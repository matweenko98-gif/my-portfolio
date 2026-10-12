import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeCaseRecord, normalizeCaseRecord } from '../src/utils/caseRecord.js';

test('case settings round trip through existing meta without unsupported columns', () => {
  const input = { slug: 'demo', title: 'Кейс', demo_url: '/demos/example/index.html',
    description: 'Описание', is_ai_concept: true, is_desktop_only: true,
    meta: { sphere: 'Дизайн' } };
  const payload = serializeCaseRecord(input, { stack: 'React', presentation: { custom: 'keep' } });
  for (const key of ['demo_url', 'description', 'is_ai_concept', 'is_desktop_only']) {
    assert.equal(Object.hasOwn(payload, key), false);
    assert.equal(normalizeCaseRecord(payload)[key], input[key]);
  }
  assert.equal(payload.meta.stack, 'React');
  assert.equal(payload.meta.presentation.custom, 'keep');
  assert.equal(input.demo_url, '/demos/example/index.html');
});

test('legacy columns override stored settings and clearing a demo persists', () => {
  assert.equal(normalizeCaseRecord({ demo_url: '/legacy', meta: { presentation: { demo_url: '/stored' } } }).demo_url, '/legacy');
  const payload = serializeCaseRecord({ demo_url: '', is_ai_concept: false }, { presentation: { demo_url: '/old', is_ai_concept: true } });
  assert.equal(normalizeCaseRecord(payload).demo_url, '');
  assert.equal(normalizeCaseRecord(payload).is_ai_concept, false);
});
