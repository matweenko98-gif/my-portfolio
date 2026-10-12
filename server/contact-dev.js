import { loadEnv } from 'vite';
import contact from '../api/contact.js';

export function contactApiPlugin() {
  function install(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/contact') return next();
      res.status = code => { res.statusCode = code; return res; };
      res.json = value => { res.end(JSON.stringify(value)); return res; };
      try {
        let body = '';
        for await (const chunk of req) {
          body += chunk.toString();
          if (Buffer.byteLength(body) > 65536) { res.status(413).json({ ok: false }); return; }
        }
        req.body = body;
        await contact(req, res);
      } catch { res.status(500).json({ ok: false }); }
    });
  }
  return {
    name: 'contact-api',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir, '');
      for (const name of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'VITE_TELEGRAM_BOT_TOKEN', 'VITE_TELEGRAM_CHAT_ID']) {
        if (!process.env[name] && env[name]) process.env[name] = env[name];
      }
    },
    configureServer: install,
    configurePreviewServer: install,
  };
}
