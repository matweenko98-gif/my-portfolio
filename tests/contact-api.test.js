import test from 'node:test';
import assert from 'node:assert/strict';
import contact from '../api/contact.js';

test('brief API validates requests, keeps secrets server-side and verifies delivery', async () => {
  const originalFetch = globalThis.fetch;
  const env = { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID,
    legacyToken: process.env.VITE_TELEGRAM_BOT_TOKEN, legacyChat: process.env.VITE_TELEGRAM_CHAT_ID };
  process.env.TELEGRAM_BOT_TOKEN = 'test-token'; process.env.TELEGRAM_CHAT_ID = 'test-chat';
  delete process.env.VITE_TELEGRAM_BOT_TOKEN; delete process.env.VITE_TELEGRAM_CHAT_ID;
  const sent = []; let failure = false;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.telegram.org/bottest-token/sendMessage');
    const message = JSON.parse(options.body); sent.push(message);
    assert.equal(message.chat_id, 'test-chat');
    assert.ok(message.text.length <= 4096);
    assert.equal(message.parse_mode, undefined);
    return new Response(JSON.stringify({ ok: !failure }), { status: failure ? 400 : 200 });
  };
  let serial = 0;
  const run = async (overrides = {}) => {
    const headers = {host:'www.ksenweb.com',origin:'https://www.ksenweb.com','content-type':'application/json','x-vercel-forwarded-for':`test-${serial++}`};
    const req = { method:'POST', headers, body:{consent:true,message:'Контакт: @testuser\nЗапрос на разработку'}, ...overrides };
    const res = {headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(s){this.statusCode=s;return this;},json(data){this.data=data;return this;}};
    await contact(req,res); return res;
  };
  try {
    assert.equal((await run({method:'GET'})).statusCode,405);
    assert.equal((await run({headers:{host:'www.ksenweb.com',origin:'https://evil.example','content-type':'application/json'}})).statusCode,403);
    assert.equal((await run({body:{consent:false,message:'test'}})).statusCode,400);
    assert.equal(sent.length,0);
    const success=await run(); assert.equal(success.statusCode,200); assert.deepEqual(success.data,{ok:true});
    assert.equal(success.headers['cache-control'],'no-store');
    const long='Полный бриф '.repeat(700); const count=sent.length;
    assert.equal((await run({body:{consent:true,message:long}})).statusCode,200);
    assert.equal(sent.slice(count).map(x=>x.text).join(''),long);
    failure=true; assert.equal((await run()).statusCode,502); failure=false;
    delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.TELEGRAM_CHAT_ID;
    assert.equal((await run()).statusCode,503);
    process.env.TELEGRAM_BOT_TOKEN='test-token';process.env.TELEGRAM_CHAT_ID='test-chat';
    const fixedHeaders={host:'www.ksenweb.com',origin:'https://www.ksenweb.com','content-type':'application/json','x-vercel-forwarded-for':'limited-test'};
    for(let i=0;i<5;i++) assert.equal((await run({headers:fixedHeaders})).statusCode,200);
    assert.equal((await run({headers:fixedHeaders})).statusCode,429);
  } finally {
    globalThis.fetch=originalFetch;
    for(const [name,value] of Object.entries({TELEGRAM_BOT_TOKEN:env.token,TELEGRAM_CHAT_ID:env.chat,VITE_TELEGRAM_BOT_TOKEN:env.legacyToken,VITE_TELEGRAM_CHAT_ID:env.legacyChat})) {
      if(value===undefined) delete process.env[name]; else process.env[name]=value;
    }
  }
});
