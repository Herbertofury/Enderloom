#!/usr/bin/env python3
"""Parse the actual extended probe with javac; compile/run its JDK-only JSON.

No Minecraft/Fabric stubs, dependency resolution, or gameplay claims. A full JDK
must be available on PATH. Parsing deliberately stops before symbol attribution.
"""
from pathlib import Path
import json
import shutil
import subprocess
import tempfile

# Use javac's public syntax-tree API, not a regex approximation of Java syntax.
PARSER = r'''
import com.sun.source.tree.*;
import com.sun.source.util.*;
import javax.tools.*;
import java.nio.file.*;
import java.util.*;
public class ProbeSyntax {
  public static void main(String[] args) throws Exception {
    var compiler = ToolProvider.getSystemJavaCompiler();
    var diagnostics = new DiagnosticCollector<JavaFileObject>();
    try (var files = compiler.getStandardFileManager(diagnostics, null, null)) {
      var task = (JavacTask) compiler.getTask(null, files, diagnostics,
          List.of("-proc:none"), null, files.getJavaFileObjects(args[0]));
      var units = task.parse(); // Never analyze: native dependencies are absent.
      boolean failed = false;
      for (var diagnostic : diagnostics.getDiagnostics()) {
        if (diagnostic.getKind() == Diagnostic.Kind.ERROR) {
          System.err.println(diagnostic); failed = true;
        }
      }
      if (failed) System.exit(1);
      if (args.length == 1) return;
      String source = Files.readString(Path.of(args[0]));
      var positions = Trees.instance(task).getSourcePositions();
      var registry = new ArrayList<String>();
      var json = new ArrayList<String>();
      var proofs = new ArrayList<String>();
      for (var unit : units) new TreeScanner<Void, Void>() {
        String exact(Tree tree) {
          return source.substring((int) positions.getStartPosition(unit, tree),
              (int) positions.getEndPosition(unit, tree));
        }
        @Override public Void visitMethod(MethodTree tree, Void unused) {
          if (tree.getName().contentEquals("registryIds")) registry.add(exact(tree));
          return super.visitMethod(tree, unused);
        }
        @Override public Void visitVariable(VariableTree tree, Void unused) {
          if (tree.getName().contentEquals("json")) json.add(exact(tree));
          return super.visitVariable(tree, unused);
        }
        @Override public Void visitMethodInvocation(MethodInvocationTree tree, Void unused) {
          if (tree.getMethodSelect().toString().equals("Files.writeString") &&
              tree.getArguments().size() == 2 &&
              tree.getArguments().get(0).toString().contains("devkit-runtime-proof.json"))
            proofs.add(exact(tree.getArguments().get(1)));
          return super.visitMethodInvocation(tree, unused);
        }
      }.scan(unit, null);
      if (registry.size() != 1 || json.size() != 1 || proofs.size() != 2)
        throw new AssertionError("probe changed; reconcile JSON extraction");
      String harness = "public class ProbeJson {\n" + registry.get(0) +
          "\npublic static void main(String[] args) {\n" +
          "String biomes = registryIds(java.util.List.of(\"test:z\", \"minecraft:plains\", \"test:a/b\"));\n" +
          "String dimensions = registryIds(java.util.List.of());\n" +
          "String dimensionTypes = registryIds(java.util.List.of(\"minecraft:overworld\"));\n" +
          json.get(0) + "\nSystem.out.println(json);\n" +
          "long firstPid = 101, currentPid = 202;\n";
      for (String proof : proofs) harness += "System.out.println(" + proof + ");\n";
      Files.writeString(Path.of(args[1]), harness + "}}\n");
    }
  }
}
'''


def main():
    from devkit_native import JAVA
    javac = shutil.which('javac')
    if not javac:
        raise RuntimeError('Native codegen regression requires a full JDK on PATH')
    compiler = Path(javac).resolve()
    java = str(compiler.with_name('java.exe' if compiler.suffix.lower() == '.exe' else 'java'))
    with tempfile.TemporaryDirectory(prefix='devkit-codegen-') as td:
        root = Path(td)
        def run(*args):
            return subprocess.run(args, cwd=root, text=True, capture_output=True, timeout=60)
        def checked(*args):
            result = run(*args)
            assert result.returncode == 0, result.stdout + result.stderr
            return result.stdout
        (root / 'ProbeSyntax.java').write_text(PARSER)
        checked(javac, 'ProbeSyntax.java')
        (root / 'RuntimeProbe.java').write_text(JAVA)
        checked(java, '-cp', td, 'ProbeSyntax', 'RuntimeProbe.java', 'ProbeJson.java')
        checked(javac, 'ProbeJson.java')
        output = checked(java, '-cp', td, 'ProbeJson').splitlines()
        assert len(output) == 3, output
        assert json.loads(output[0]) == {'schema_version': 1, 'registries': {
            'minecraft:worldgen/biome': ['minecraft:plains', 'test:a/b', 'test:z'],
            'minecraft:dimension': [],
            'minecraft:dimension_type': ['minecraft:overworld']}}
        expected = {'state': 'runtime-smoke-verified', 'artifact_sha256': 'EXPECTED_SHA',
                    'modid': 'EXPECTED_MOD', 'world_reopened': True, 'client_server_sync': True}
        assert json.loads(output[1]) == expected
        assert json.loads(output[2]) == dict(expected, process_restart=True,
                                            first_process_id=101, restart_process_id=202)
        # Independently recreate both original escaping failures. Each must be
        # rejected by the same parser that accepted the actual generated source.
        for name, start, end in [
            ('registry-id-quotes', JAVA.index('  private static String registryIds'),
             JAVA.index('  private static void writeVariantFoundryRegistryDump')),
            ('registry-json-quotes', JAVA.index('      String json ='),
             JAVA.index('      Files.writeString(Path.of("variant-foundry-registry.json")'))]:
            fragment = JAVA[start:end]
            broken = fragment.replace('\\"', '"')
            assert broken != fragment, name
            (root / 'RuntimeProbe.java').write_text(JAVA[:start] + broken + JAVA[end:])
            result = run(java, '-cp', td, 'ProbeSyntax', 'RuntimeProbe.java')
            assert result.returncode == 1 and 'error:' in result.stderr, (name, result.stderr)
    print('Native probe javac syntax, compiled registry/proof JSON and two escaping negative controls PASS (not Minecraft)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
