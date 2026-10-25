import test from 'node:test';
import assert from 'node:assert/strict';
import { caseServices } from '../src/content/serviceCatalog.js';
import { chooseServiceProjects } from '../src/utils/serviceLeads.js';
import { serializeCaseRecord, normalizeCaseRecord } from '../src/utils/caseRecord.js';

test('explicit service selection wins over legacy labels, including an empty selection', () => {
  assert.deepEqual(caseServices({ title:'Лендинг', meta:{ services:['redesign','unknown'] } }), ['redesign']);
  assert.deepEqual(caseServices({ title:'Лендинг', meta:{ services:[] } }), []);
  assert.deepEqual(caseServices({ title:'Лендинг', meta:{ services:null } }), ['landing']);
});

test('legacy cases are classified by their work rather than the technology alone', () => {
  assert.deepEqual(caseServices({ title:'Корпоративный сайт', meta:{stack:'React'} }), ['multipage']);
  assert.ok(caseServices({title:'Редизайн сайта',meta:{stack:'Figma'}}).includes('redesign'));
  assert.ok(caseServices({title:'Веб-приложение'}).includes('web-apps'));
  assert.ok(!caseServices({title:'Корпоративный сайт',card_tags:['E-commerce']}).includes('online-store'));
});

test('all services show the same latest three completed projects', () => {
  const base = {slug:'project', card_image:'image.webp', meta:{services:['web-apps']}};
  const items = [base, {...base,slug:'concept',is_ai_concept:true}, {...base,slug:'unfinished',is_in_development:true}];
  assert.deepEqual(chooseServiceProjects(items,'web-apps').map(item=>item.slug), ['project']);
  assert.deepEqual(chooseServiceProjects(items,'online-store').map(item=>item.slug), ['project']);
  const latest = [4,1,3,2].map(sort_order=>({...base,slug:`case-${sort_order}`,sort_order}));
  assert.deepEqual(chooseServiceProjects(latest,'landing').map(item=>item.slug), ['case-1','case-2','case-3']);
  assert.deepEqual(chooseServiceProjects(latest,'redesign'), chooseServiceProjects(latest,'web-apps'));
});

test('service links survive storage serialization; automatic mode can clear a previous choice', () => {
  const previous = {sphere:'B2B',services:['landing'],presentation:{description:'Existing'}};
  const saved = serializeCaseRecord({meta:{services:['multipage']},is_ai_concept:false}, previous);
  assert.deepEqual(normalizeCaseRecord(saved).meta.services,['multipage']);
  assert.equal(saved.meta.sphere,'B2B');
  assert.equal(saved.meta.presentation.description,'Existing');
  assert.equal(saved.meta.presentation.is_ai_concept,false);
  assert.equal(serializeCaseRecord({meta:{services:null}},previous).meta.services,null);
});
