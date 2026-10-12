const attempts = new Map();
const WINDOW_MS = 60_000;

function respond(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

export default async function contact(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, { ok: false });
  }
  const origin = req.headers.origin;
  try {
    if (!origin || new URL(origin).host !== req.headers.host || req.headers['sec-fetch-site'] === 'cross-site') {
      return respond(res, 403, { ok: false });
    }
  } catch { return respond(res, 403, { ok: false }); }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return respond(res, 415, { ok: false });
  }
  let payload;
  try { payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return respond(res, 400, { ok: false }); }
  if (!payload || payload.consent !== true || typeof payload.message !== 'string' ||
      payload.message.trim().length < 10 || payload.message.length > 16000) {
    return respond(res, 400, { ok: false });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return respond(res, 503, { ok: false });

  // Bound the in-memory limiter; Vercel Firewall can provide deployment-wide limits.
  const now = Date.now();
  for (const [key, value] of attempts) if (now - value.start >= WINDOW_MS) attempts.delete(key);
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const rate = attempts.get(ip) || { start: now, count: 0 };
  if (rate.count >= 5 || attempts.size >= 1000) {
    res.setHeader('Retry-After', '60');
    return respond(res, 429, { ok: false });
  }
  rate.count += 1;
  attempts.set(ip, rate);
  try {
    const signal = AbortSignal.timeout(8000);
    let remaining = payload.message;
    while (remaining) {
      let length = Math.min(3800, remaining.length);
      if (length < remaining.length && /[\uD800-\uDBFF]/.test(remaining[length - 1])) length -= 1;
      const text = remaining.slice(0, length);
      remaining = remaining.slice(length);
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) return respond(res, 502, { ok: false });
    }
    return respond(res, 200, { ok: true });
  } catch { return respond(res, 502, { ok: false }); }
}
