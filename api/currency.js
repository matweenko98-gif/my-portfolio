import { currencyForCountry } from '../src/utils/pricing.js';
export default function currency(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  // Vercel supplies this country header at its edge; do not use browser locale.
  return res.status(200).json({ currency: currencyForCountry(req.headers['x-vercel-ip-country']) });
}
