export const FIXED_BYN_PRICES = Object.freeze({20000:700,30000:1000,40000:1400,45000:1600,55000:2000});
export const currencyForCountry = country => country === 'BY' ? 'BYN' : 'RUB';
export function formatMoney(amount, currency = 'RUB') {
  const byn = currency === 'BYN' ? FIXED_BYN_PRICES[amount] : undefined;
  return `${new Intl.NumberFormat('ru-RU').format(byn ?? amount)} ${byn === undefined ? 'RUB' : 'BYN'}`;
}
export function localizePrices(value, currency) {
  if (typeof value === 'string') return value.replace(/(\d[\d \u00a0\u202f]*)\s*(?:₽|руб\.)/g, (_, amount) => formatMoney(Number(amount.replace(/\s/g, '')), currency));
  if (Array.isArray(value)) return value.map(item => localizePrices(item, currency));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizePrices(item, currency)]));
  return value;
}
