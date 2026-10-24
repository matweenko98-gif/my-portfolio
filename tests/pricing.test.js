import test from 'node:test';
import assert from 'node:assert/strict';
import { currencyForCountry, formatMoney, localizePrices, FIXED_BYN_PRICES } from '../src/utils/pricing.js';
import currencyApi from '../api/currency.js';
test('country defaults and all agreed fixed prices', () => {
  assert.equal(currencyForCountry('BY'),'BYN');
  for (const country of ['RU','US',undefined,'']) assert.equal(currencyForCountry(country),'RUB');
  for (const [rub,byn] of Object.entries(FIXED_BYN_PRICES)) assert.equal(formatMoney(Number(rub),'BYN').replace(/\s/g,''), `${byn}BYN`);
  assert.equal(formatMoney(50000,'BYN').replace(/\s/g,''),'50000RUB');
});
test('localization is immutable and handles NBSP, multiple prices, and repeated calls', () => {
  const data = {price:'от 30\u00a0000 ₽',nested:['20 000 руб. и 45 000 ₽'], amount:30000};
  const result=localizePrices(data,'BYN');
  assert.equal(result.price.replace(/\s/g,''),'от1000BYN');
  assert.equal(result.nested[0].replace(/\s/g,''),'700BYNи1600BYN');
  assert.equal(result.amount,30000);
  assert.equal(data.price,'от 30\u00a0000 ₽');
  assert.deepEqual(localizePrices(result,'BYN'),result);
});
test('geo API prevents cross-country cache reuse', () => {
  for (const country of ['BY','RU',undefined]) {
    const headers={}; let body;
    const res={setHeader:(k,v)=>headers[k]=v,status:()=>res,json:value=>body=value};
    currencyApi({headers:{'x-vercel-ip-country':country}},res);
    assert.equal(body.currency,country==='BY'?'BYN':'RUB');
    assert.match(headers['Cache-Control'],/private, no-store/);
  }
});
