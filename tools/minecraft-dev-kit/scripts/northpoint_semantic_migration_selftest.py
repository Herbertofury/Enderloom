#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import zipfile
import pathlib
import shutil
import subprocess
import tempfile

from access_rule_resolver import resolve_project as resolve_access
from classfile_symbol_index import build_index
from mixin_target_resolver import resolve_project as resolve_mixins
from packaged_linkage_audit import audit as audit_linkage
from reflection_surface_resolver import resolve_project as resolve_reflection


def write(path: pathlib.Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')


def javac(output: pathlib.Path, sources: list[pathlib.Path], classpath: list[pathlib.Path] | None = None, target_java: int | None = None) -> None:
    output.mkdir(parents=True, exist_ok=True)
    cmd = [shutil.which('javac') or 'javac']
    if target_java is not None:
        cmd += ['-source', str(target_java), '-target', str(target_java)]
    if classpath:
        cmd += ['-cp', os.pathsep.join(map(str, classpath))]
    cmd += ['-d', str(output), *map(str, sources)]
    cp = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if cp.returncode:
        raise AssertionError(cp.stderr or cp.stdout)


def blocker_ids(report: dict) -> set[str]:
    return {str(row.get('id')) for row in report.get('blockers') or []}



def service_loader_checks(root: pathlib.Path) -> dict:
    """Exercise real classpath JARs, with Java ServiceLoader as the runtime oracle."""
    src, classes = root / 'services-src', root / 'services-classes'
    fixtures = {
        'Service': 'public interface Service {}',
        'SubService': 'public interface SubService extends Service {}',
        'Base': 'public class Base implements SubService {}',
        'Good': 'public class Good extends Base {}',
        'Wrong': 'public class Wrong {}',
        'Abstract': 'public abstract class Abstract implements Service {}',
        'Hidden': 'class Hidden implements Service { public Hidden() {} }',
        'PrivateCtor': 'public class PrivateCtor implements Service { private PrivateCtor() {} }',
        'ArgCtor': 'public class ArgCtor extends Base { public ArgCtor(int x) {} }',
        'Factory': 'public class Factory { private Factory() {} public static Service provider() { return new Good(); } }',
        'Runner': 'public class Runner { public static void main(String[] args) { System.out.println(java.util.ServiceLoader.load(Service.class).iterator().next().getClass().getName()); } }',
    }
    for name, body in fixtures.items():
        write(src / 'fixture' / (name + '.java'), 'package fixture; ' + body)
    javac(classes, sorted(src.rglob('*.java')), target_java=17)

    def jar(name: str, owners: list[str], provider: str | None = None) -> pathlib.Path:
        path = root / (name + '.jar')
        with zipfile.ZipFile(path, 'w') as out:
            for owner in owners:
                out.write(classes / 'fixture' / (owner + '.class'), 'fixture/' + owner + '.class')
            if provider:
                out.writestr('META-INF/services/fixture.Service', '# provider\nfixture.' + provider + '\n')
        return path

    api = jar('service-api', ['Service', 'Runner'])
    dep = jar('service-dependency', ['Base', 'SubService'])
    indexes = [build_index(api), build_index(dep)]
    results = {}
    for provider, expected in [
        ('Good', None), ('Wrong', 'service-provider-not-subtype'),
        ('Abstract', 'service-provider-not-concrete'), ('Hidden', 'service-provider-not-public'),
        ('PrivateCtor', 'service-provider-no-public-noarg-constructor'),
        ('ArgCtor', 'service-provider-no-public-noarg-constructor'),
        ('Factory', 'service-provider-not-subtype'),
    ]:
        candidate = jar(provider, [provider], provider)
        result = audit_linkage(candidate, indexes, runtime_java=17)
        runtime = subprocess.run(
            [shutil.which('java') or 'java', '-cp', os.pathsep.join(map(str, [api, dep, candidate])), 'fixture.Runner'],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        if expected:
            assert runtime.returncode != 0 and 'ServiceConfigurationError' in runtime.stderr, runtime.stderr
            assert expected in blocker_ids(result), (provider, result)
        else:
            assert runtime.returncode == 0 and runtime.stdout.strip() == 'fixture.Good', runtime.stderr
            assert result['status'] == 'PASS', result
        results[provider] = {'audit': result['status'], 'java_exit': runtime.returncode}

    # The provider may itself come from a supplied dependency JAR.
    descriptor = jar('descriptor-only', [], 'Good')
    good = jar('good-dependency', ['Good'])
    assert audit_linkage(descriptor, [*indexes, build_index(good)], runtime_java=17)['status'] == 'PASS'
    missing = audit_linkage(descriptor, indexes, runtime_java=17)
    assert 'missing-service-provider-class' in blocker_ids(missing), missing

    # Incomplete indexes must not manufacture a negative subtype proof or a clean pass.
    unknown = audit_linkage(root / 'Good.jar', [build_index(api)], runtime_java=17)
    assert unknown['status'] == 'PASS_WITH_WARNINGS', unknown
    assert 'service-provider-hierarchy-incomplete' in {x['id'] for x in unknown['warnings']}, unknown
    assert 'service-provider-not-subtype' not in blocker_ids(unknown), unknown
    missing_service = audit_linkage(root / 'Good.jar', [build_index(dep)], runtime_java=17)
    assert missing_service['status'] == 'PASS_WITH_WARNINGS', missing_service

    # Named-module factory providers need not implement Service or have a public constructor.
    # They are declared in module-info, not in classpath META-INF/services descriptors.
    module_src, module_classes = root / 'module-src', root / 'module-classes'
    write(module_src / 'module-info.java',
          'module fixture.module { exports fixture; uses fixture.Service; provides fixture.Service with fixture.Factory; }')
    for name in ['Service', 'SubService', 'Base', 'Good', 'Factory', 'Runner']:
        write(module_src / 'fixture' / (name + '.java'), 'package fixture; ' + fixtures[name])
    javac(module_classes, sorted(module_src.rglob('*.java')), target_java=17)
    module_jar = root / 'module.jar'
    with zipfile.ZipFile(module_jar, 'w') as out:
        for file in sorted(module_classes.rglob('*.class')):
            out.write(file, file.relative_to(module_classes).as_posix())
    module_result = audit_linkage(module_jar, [], runtime_java=17)
    assert module_result['status'] == 'PASS', module_result
    runtime = subprocess.run(
        [shutil.which('java') or 'java', '--module-path', str(module_jar), '-m', 'fixture.module/fixture.Runner'],
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    assert runtime.returncode == 0 and runtime.stdout.strip() == 'fixture.Good', runtime.stderr
    with zipfile.ZipFile(module_jar, 'a') as out:
        out.writestr('META-INF/services/fixture.Service', 'fixture.Factory\n')
    dual = audit_linkage(module_jar, [], runtime_java=17)
    assert dual['status'] == 'PASS_WITH_WARNINGS', dual
    assert 'service-provider-launch-mode-unknown' in {x['id'] for x in dual['warnings']}, dual
    named = subprocess.run(
        [shutil.which('java') or 'java', '--module-path', str(module_jar), '-m', 'fixture.module/fixture.Runner'],
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    classpath = subprocess.run(
        [shutil.which('java') or 'java', '-cp', str(module_jar), 'fixture.Runner'],
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    assert named.returncode == 0 and named.stdout.strip() == 'fixture.Good', named.stderr
    assert classpath.returncode != 0 and 'not a subtype' in classpath.stderr, classpath.stderr
    results['dual_mode_factory'] = {'audit': dual['status'], 'named_module_exit': named.returncode, 'classpath_exit': classpath.returncode}
    results['named_module_factory'] = {'audit': module_result['status'], 'java_exit': runtime.returncode}
    return results


def main() -> int:
    if not shutil.which('javac'):
        raise AssertionError('javac is required')

    with tempfile.TemporaryDirectory(prefix='northpoint-semantic-migration-') as td:
        root = pathlib.Path(td)
        old_api_src, old_api_classes = root / 'old-api-src', root / 'old-api-classes'
        new_public_src, new_public_classes = root / 'new-public-src', root / 'new-public-classes'
        new_runtime_src, new_runtime_classes = root / 'new-runtime-src', root / 'new-runtime-classes'
        old_dep_src, old_dep_classes = root / 'old-dep-src', root / 'old-dep-classes'
        new_dep_src, new_dep_classes = root / 'new-dep-src', root / 'new-dep-classes'
        old_mod_src, old_mod_classes = root / 'old-mod-src', root / 'old-mod-classes'
        repaired_src, repaired_classes = root / 'repaired-src', root / 'repaired-classes'

        write(old_api_src / 'net/minecraft/ApiTarget.java',
              'package net.minecraft; public class ApiTarget { public long compute(int x){ return x; } }\n')
        write(new_public_src / 'net/minecraft/ApiTarget.java',
              'package net.minecraft; public class ApiTarget { public long compute(long x){ return x; } }\n')
        write(new_runtime_src / 'net/minecraft/ApiTarget.java',
              'package net.minecraft; public class ApiTarget { private long compute(long x){ return x; } }\n')
        write(old_dep_src / 'fixturedep/Helper.java',
              'package fixturedep; public class Helper { public static String decorate(int x){ return Integer.toString(x); } }\n')
        write(new_dep_src / 'fixturedep/Helper.java',
              'package fixturedep; public class Helper { public static String decorate(long x){ return Long.toString(x); } }\n')

        javac(old_api_classes, sorted(old_api_src.rglob('*.java')))
        javac(new_public_classes, sorted(new_public_src.rglob('*.java')))
        javac(new_runtime_classes, sorted(new_runtime_src.rglob('*.java')))
        javac(old_dep_classes, sorted(old_dep_src.rglob('*.java')))
        javac(new_dep_classes, sorted(new_dep_src.rglob('*.java')))

        write(old_mod_src / 'example/LegacyPort.java', '''package example;
import net.minecraft.ApiTarget;
import fixturedep.Helper;
public class LegacyPort {
  public static String run(ApiTarget target, int value){ return Helper.decorate((int)target.compute(value)); }
}
''')
        javac(old_mod_classes, sorted(old_mod_src.rglob('*.java')), [old_api_classes, old_dep_classes])

        target_index = build_index(new_runtime_classes, include_refs=True)
        dep_index = build_index(new_dep_classes, include_refs=True)
        broken = audit_linkage(old_mod_classes, [target_index, dep_index], prefixes=('net/minecraft/', 'fixturedep/'))
        broken_ids = blocker_ids(broken)
        assert 'unresolved-member-reference' in broken_ids, broken
        unresolved = broken.get('blockers') or []
        unresolved_text = json.dumps(unresolved)
        assert 'compute' in unresolved_text and 'decorate' in unresolved_text, broken

        write(repaired_src / 'example/LegacyPort.java', '''package example;
import net.minecraft.ApiTarget;
import fixturedep.Helper;
public class LegacyPort {
  public static String run(ApiTarget target, int value){ return Helper.decorate(target.compute((long)value)); }
}
''')
        javac(repaired_classes, sorted(repaired_src.rglob('*.java')), [new_public_classes, new_dep_classes])

        inaccessible = audit_linkage(repaired_classes, [target_index, dep_index], prefixes=('net/minecraft/', 'fixturedep/'))
        assert 'linkage-member-inaccessible' in blocker_ids(inaccessible), inaccessible

        widened = root / 'repaired-widened'
        shutil.copytree(repaired_classes, widened)
        write(widened / 'META-INF/accesstransformer.cfg', 'public net.minecraft.ApiTarget compute(J)J\n')
        linked = audit_linkage(widened, [target_index, dep_index], prefixes=('net/minecraft/', 'fixturedep/'))
        assert linked['status'] == 'PASS', linked

        surfaces = root / 'surfaces'
        write(surfaces / 'src/main/java/example/ApiMixin.java', '''package example;
@Mixin(targets = "net.minecraft.ApiTarget")
class ApiMixin {
  @Inject(method = "compute(J)J", at = @At("HEAD"))
  private void northpoint$compute() {}
}
''')
        write(surfaces / 'src/main/java/example/ReflectionHook.java', '''package example;
import net.minecraft.ApiTarget;
class ReflectionHook {
  void check() throws Exception { ApiTarget.class.getDeclaredMethod("compute", long.class); }
}
''')
        write(surfaces / 'src/main/resources/META-INF/accesstransformer.cfg',
              'public net.minecraft.ApiTarget compute(J)J\n')

        mixin = resolve_mixins(surfaces, target_index)
        access = resolve_access(surfaces, target_index)
        reflection = resolve_reflection(surfaces, target_index)
        assert not mixin.get('blockers'), mixin
        assert not access.get('blockers'), access
        assert not reflection.get('blockers'), reflection

        services = service_loader_checks(root)

        report = {
            'status': 'PASS',
            'service_loader': services,
            'broken_detected': sorted(broken_ids),
            'access_drift_detected': sorted(blocker_ids(inaccessible)),
            'repaired_linkage': linked['status'],
            'mixin_status': mixin['status'],
            'access_status': access['status'],
            'reflection_status': reflection['status'],
            'reflection_warnings': [row.get('id') for row in reflection.get('warnings') or []],
        }
        print(json.dumps(report, indent=2))
    print('Northpoint semantic migration self-test: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())