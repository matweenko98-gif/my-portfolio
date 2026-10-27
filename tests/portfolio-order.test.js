import test from 'node:test';
import assert from 'node:assert/strict';
import { mergePortfolioCases, savePortfolioOrder, builtInConceptPayload } from '../src/utils/portfolioCases.js';

const local = [{ slug: 'demo', title: 'Demo', is_ai_concept: true, demo_url: '/demos/demo', tags: ['ИИ-концепт'] }];
test('one explicit order wins over case type; built-in demos are not duplicated', () => {
  const records = [{ id: 1, slug: 'real', sort_order: 2 }, { id: 2, slug: 'demo', sort_order: 0, meta: { presentation: { is_ai_concept: true } } }];
  assert.deepEqual(mergePortfolioCases(records, local).map(item => item.slug), ['demo', 'real']);
  const withLocal = mergePortfolioCases([records[0]], local);
  assert.deepEqual(withLocal.map(item => item.slug), ['real', 'demo']);
  assert.equal(withLocal[1].isLocalConcept, true);
});
test('removed built-in demo stays removed and an empty public database retains legacy fallback', () => {
  assert.deepEqual(mergePortfolioCases([{ slug: 'demo', meta: { presentation: { hidden: true } } }], local), []);
  assert.equal(mergePortfolioCases([], [...local, {slug:'legacy'}], true).length, 2);
  assert.equal(mergePortfolioCases([], [...local, {slug:'legacy'}]).length, 1);
});
test('saving order materializes a built-in demo and persists the exact mixed sequence', async () => {
  const writes = [];
  const client = { from(table) { assert.equal(table, 'cases'); return {
    upsert(payload, options) { writes.push({payload, options}); return Promise.resolve({error:null}); },
    update(payload) { return { eq(key, id) { writes.push({payload, key, id}); return Promise.resolve({error:null}); } }; },
  }; } };
  await savePortfolioOrder(client, [{...local[0],isLocalConcept:true}, {id:3,slug:'real'}]);
  assert.equal(writes[0].payload.slug, 'demo');
  assert.equal(writes[0].payload.sort_order, 0);
  assert.equal(writes[0].payload.meta.presentation.is_ai_concept, true);
  assert.deepEqual(writes[1], {payload:{sort_order:1},key:'id',id:3});
  assert.ok(!Object.hasOwn(builtInConceptPayload(local[0]), 'id'));
});
test('a failed order write reports failure instead of claiming success', async () => {
  const client = { from() { return { update() { return {eq:async()=>({error:new Error('failed')})}; } }; } };
  await assert.rejects(savePortfolioOrder(client, [{id:1}]), /failed/);
});
