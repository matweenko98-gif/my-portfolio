import { readFile } from 'node:fs/promises';

const origin = 'https://www.ksenweb.com';
const key = 'f19c7b9d5b475ad8b316c74394004e1c';
const keyLocation = `${origin}/${key}.txt`;
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

async function main() {
  const inputs = args.filter(arg => arg !== '--dry-run');
  if (!inputs.length) throw new Error('Укажите изменённые URL: npm run indexnow -- / /blog/slug (или --dry-run).');
  const urlList = [...new Set(inputs.map(input => {
    if (!input.startsWith('/') && !input.startsWith(`${origin}/`)) {
      throw new Error(`Разрешены только пути или URL основного сайта: ${input}`);
    }
    const url = new URL(input, origin);
    if (url.origin !== origin || url.username || url.password || url.search || url.hash) {
      throw new Error(`Нужен canonical URL без параметров и якоря: ${input}`);
    }
    if (/^\/(admin(?:-keis)?|assets|fonts|demos)(?:\/|$)/.test(url.pathname)) {
      throw new Error(`Служебный URL нельзя отправлять: ${input}`);
    }
    return url.href;
  }))];
  if (urlList.length > 10000) throw new Error('Максимум 10 000 адресов в запросе.');
  const localKey = await readFile(new URL(`../public/${key}.txt`, import.meta.url), 'utf8');
  if (localKey.trim() !== key) throw new Error('Содержимое файла ключа не совпадает.');
  const payload = { host: new URL(origin).host, key, keyLocation, urlList };
  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  const keyResponse = await fetch(keyLocation, { signal: AbortSignal.timeout(30000), redirect: 'error' });
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
    throw new Error('Файл ключа ещё не опубликован или недоступен. Сначала дождитесь публикации на Vercel.');
  }
  const response = await fetch('https://yandex.com/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  console.log(`IndexNow HTTP ${response.status}: ${urlList.length} URL. ${response.status === 202 ? 'Запрос принят, новый ключ ожидает проверки.' : 'Яндекс принял адреса.'} Это не подтверждение индексации.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
