import test from 'node:test';
import assert from 'node:assert/strict';
import { safeArticleHtml } from '../src/utils/safeArticleHtml.js';

test('CMS content keeps article formatting and removes executable HTML', () => {
  const html=safeArticleHtml('<h2 id="section">Заголовок</h2><p><strong>Текст</strong></p><table><tr><td colspan="2">Данные</td></tr></table><img src="https://example.com/img.webp" onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(2)">ссылка</a><script>alert(3)</script><iframe src="https://evil.example"></iframe><a href="https://example.com" target="_blank">Безопасная ссылка</a>');
  assert.match(html,/<h2 id="section">Заголовок<\/h2>/);
  assert.match(html,/<strong>Текст<\/strong>/);
  assert.match(html,/colspan="2"/);
  assert.match(html,/loading="lazy" decoding="async"/);
  assert.match(html,/rel="noopener noreferrer"/);
  assert.doesNotMatch(html,/onerror|onclick|javascript:|<script|<iframe|alert\(/);
});
