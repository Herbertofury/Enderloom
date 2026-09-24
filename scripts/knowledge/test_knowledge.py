#!/usr/bin/env python3
"""Regression tests for source accounting and honest, single-owner progress."""
import copy, hashlib, importlib.util, json, re, tempfile, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('knowledge',Path(__file__).with_name('knowledge.py'))
k=importlib.util.module_from_spec(spec);spec.loader.exec_module(k)

class KnowledgeTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.state=k.read_state();cls.corpus=k.scan(cls.state['groups'])
 def test_ids_unique(self):
  ids=[i['id'] for g in self.state['groups'] for i in g['items']]
  self.assertEqual(len(ids),len(set(ids)))
 def test_source_accounting_complete(self):
  self.assertEqual(sum(len(c['occurrences']) for c in self.corpus['clauses']),self.corpus['stats']['source_blocks'])
  self.assertEqual(len(k.load_sources()),len(self.corpus['sources']))
  seen={o['source'] for c in self.corpus['clauses'] for o in c['occurrences']}
  self.assertEqual(seen,{s['id'] for s in self.corpus['sources']})
 def test_studio_task_identity_preserved(self):
  ss=next(s['id'] for s in self.corpus['sources'] if s['path']=='docs/ENDERLOOM_STUDIO_EXECUTION.md')
  aliases={a['task'] for a in self.corpus['aliases'] if a['source']==ss}
  self.assertTrue({f'T{n:03}' for n in range(1,165)}<=aliases)
 def test_qualifiers_not_deduplicated(self):
  self.assertNotEqual(k.norm('Do not remove content.'),k.norm('Remove content.'))
  self.assertNotEqual(k.norm('Support Fabric 1.20.1.'),k.norm('Support Fabric 1.21.1.'))
 def test_code_fences_are_not_task_aliases(self):
  items=list(k.blocks('# Scope\n\n```text\n- [x] example\n```\n\n- [ ] real\n'))
  self.assertTrue(any('```text' in b[3] for b in items))
  self.assertEqual(sum(b[3].startswith('- [ ]') for b in items),1)
 def test_historical_checks_do_not_certify_product(self):
  self.assertGreater(self.corpus['stats']['source_checked'],0)
  # New documentation cannot silently synthesize certification.
  for g in self.state['groups']:
   for item in g['items']:
    if item['status']=='verified':k.proof_valid(item)
 def test_verified_without_proof_rejected(self):
  with self.assertRaises(ValueError):k.proof_valid({'id':'AOA-01','status':'verified','evidence':[]})
 def test_fake_digest_rejected(self):
  with self.assertRaises(ValueError):k.proof_valid({'id':'AOA-01','status':'verified','evidence':[{'artifact_sha256':'fake'}]})
 def test_proof_identity_and_staleness(self):
  with tempfile.TemporaryDirectory(dir=k.ROOT) as folder:
   p=Path(folder)/'proof.json';data={'status':'passed','requirement_id':'AOA-01','artifact_sha256':'a'*64,'source_commit':'b'*40,'commands':['TEST FIXTURE ONLY'],'observations':['structural fixture, not product evidence']}
   p.write_text(json.dumps(data));e={'path':p.relative_to(k.ROOT).as_posix(),'artifact_sha256':'a'*64,'source_commit':'b'*40,'proof_sha256':k.digest(p.read_bytes())}
   item={'id':'AOA-01','status':'verified','evidence':[e]};k.proof_valid(item)
   data['status']='failed';p.write_text(json.dumps(data))
   with self.assertRaises(ValueError):k.proof_valid(item)
 def test_generation_idempotent(self):
  k.render(self.state,self.corpus)
  before={p.name:k.digest(p.read_bytes()) for p in k.K.iterdir() if p.is_file()}
  k.render(self.state,self.corpus)
  after={p.name:k.digest(p.read_bytes()) for p in k.K.iterdir() if p.is_file()}
  self.assertEqual(before,after)
 def test_single_checkbox_projection(self):
  for p in k.K.glob('*.md'):
   if p.name!='Checklist.md':self.assertIsNone(re.search(r'^- \[[ x]\]',p.read_text(),re.M),p.name)
 def test_links_and_sources(self):k.check(self.state,self.corpus)

if __name__=='__main__':unittest.main(verbosity=2)
