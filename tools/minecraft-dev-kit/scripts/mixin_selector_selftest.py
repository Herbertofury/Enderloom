#!/usr/bin/env python3
"""Regression gate for source-selector bugs triggered by released TML 0.2.0.

No mod is loaded. DEVKIT_SCRIPTS can select a preserved baseline for red/green proof.
"""
import os
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, os.environ.get("DEVKIT_SCRIPTS", str(Path(__file__).parent)))
import mixin_target_resolver as resolver


class SelectorTests(unittest.TestCase):
    def selectors(self, source):
        return resolver._selectors(source)

    def test_literal_descriptor_concat(self):
        rows = self.selectors('@Inject(method = "render(Lexample/Pose;" + "IF)V", at = @At("HEAD"))')
        self.assertEqual([r['selector'] for r in rows], ['render(Lexample/Pose;IF)V'])

    def test_array_concat_preserves_distinct_selectors(self):
        rows = self.selectors('@Inject(method = {"first(" + ")V", "second"}, at = @At("HEAD"))')
        self.assertEqual([r['selector'] for r in rows], ['first()V', 'second'])

    def test_array_trailing_comma(self):
        rows = self.selectors('@Inject(method = {"one", "two",}, at = @At("HEAD"))')
        self.assertEqual([r['selector'] for r in rows], ['one', 'two'])

    def test_at_target_concat(self):
        rows = self.selectors('@Redirect(method="run", at=@At(value="INVOKE", target="Lexample/" + "Target;apply()V"))')
        self.assertEqual([(r['kind'], r['selector']) for r in rows],
                         [('method', 'run'), ('at-target', 'Lexample/Target;apply()V')])

    def test_unknown_suffix_cannot_partially_resolve(self):
        rows = self.selectors('@Inject(method="run" + SUFFIX, at=@At("HEAD"))')
        self.assertEqual([r['kind'] for r in rows], ['unparsed'])

    def test_unknown_prefix_cannot_partially_resolve(self):
        rows = self.selectors('@Inject(method=PREFIX + "()V", at=@At("HEAD"))')
        self.assertEqual([r['kind'] for r in rows], ['unparsed'])

    def test_unknown_array_element_is_not_dropped(self):
        rows = self.selectors('@Inject(method={"run", OTHER}, at=@At("HEAD"))')
        self.assertEqual([r['kind'] for r in rows], ['unparsed'])

    def test_block_comment_between_concat_terms(self):
        rows = self.selectors('@Inject(method="run(" /* why */ + ")V", at=@At("HEAD"))')
        self.assertEqual(rows[0]['selector'], 'run()V')

    def test_line_comment_and_line_numbers(self):
        rows = self.selectors('// @Inject(method="fake")\n@Inject(method="run" + // comment\n "()V", at=@At("HEAD"))')
        self.assertEqual([(r['selector'], r['line']) for r in rows], [('run()V', 2)])

    def test_annotations_in_literals_are_not_source(self):
        rows = self.selectors('String fake="@Inject(method=\\"ghost\\")"; @Inject(method="run", at=@At("HEAD"))')
        self.assertEqual([r['selector'] for r in rows], ['run'])

    def test_comments_in_literal_are_preserved(self):
        self.assertEqual(resolver._without_comments('String url="https://example/x"; /* c */'),
                         'String url="https://example/x";        ')

    def test_shadow_field_does_not_capture_later_callback(self):
        source = '@Shadow\nprivate Model gunModel;\n@Shadow\nprivate Pair<Model, Resource> lodModel;\n@Inject(method="check")\nprivate void afterCheck(CallbackInfo ci) {}'
        rows = resolver._shadow_names(source)
        self.assertEqual([(r['kind'], r['selector']) for r in rows], [('field', 'gunModel'), ('field', 'lodModel')])

    def test_shadow_inline_field(self):
        self.assertEqual(resolver._shadow_names('@Shadow private int count;')[0]['selector'], 'count')

    def test_shadow_initialized_field(self):
        rows = resolver._shadow_names('@Shadow private Model model = new Model();\nvoid later() {}')
        self.assertEqual([(r['kind'], r['selector']) for r in rows], [('field', 'model')])

    def test_shadow_annotation_arguments_and_adjacent_annotations(self):
        rows = resolver._shadow_names('@Shadow(remap=false) @Final @Custom(note="x")\nprivate Model model;')
        self.assertEqual([(r['kind'], r['selector']) for r in rows], [('field', 'model')])

    def test_shadow_method(self):
        rows = resolver._shadow_names('@Shadow\nprotected abstract void run(int count);')
        self.assertEqual([(r['kind'], r['selector']) for r in rows], [('method', 'run')])

    def test_shadow_comment_ignored(self):
        rows = resolver._shadow_names('/* @Shadow private int wrong; */\n@Shadow private int correct;')
        self.assertEqual([r['selector'] for r in rows], ['correct'])

    def test_overwrite_inline_method(self):
        rows = resolver._overwrite_names('@Overwrite public void run() {}')
        self.assertEqual([r['selector'] for r in rows], ['run'])

    def resolve(self, annotation, methods):
        index = {'input': 'test-only-index', 'classes': {'example/Target': {
            'methods': [{'name': n, 'descriptor': d, 'access': 1} for n, d in methods],
            'fields': [], 'interfaces': [], 'super': None}}}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'Test.java').write_text('import example.Target;\n@Mixin(Target.class)\nclass Test {\n' + annotation + '\nvoid hook() {}\n}')
            return resolver.resolve_project(root, index)

    def test_full_descriptor_resolves_overload(self):
        result = self.resolve('@Inject(method="run(" + "I)V", at=@At("HEAD"))', [('run', '(I)V'), ('run', '(J)V')])
        self.assertEqual(result['status'], 'PASS')
        self.assertEqual(result['resolved'][0]['selector']['descriptor'], '(I)V')

    def test_descriptorless_overload_still_blocks(self):
        result = self.resolve('@Inject(method="run", at=@At("HEAD"))', [('run', '(I)V'), ('run', '(J)V')])
        self.assertEqual(result['blockers'][0]['id'], 'mixin-selector-ambiguous')

    def test_missing_exact_descriptor_still_blocks(self):
        result = self.resolve('@Inject(method="run(" + "F)V", at=@At("HEAD"))', [('run', '(I)V')])
        self.assertEqual(result['blockers'][0]['id'], 'mixin-selector-member-missing')

    def test_dynamic_expression_blocks_instead_of_false_pass(self):
        result = self.resolve('@Inject(method="run" + SUFFIX, at=@At("HEAD"))', [('run', '()V')])
        self.assertEqual(result['status'], 'FAIL')
        self.assertEqual(result['blockers'][0]['id'], 'mixin-selector-expression-unresolved')


if __name__ == '__main__':
    unittest.main(verbosity=2)
