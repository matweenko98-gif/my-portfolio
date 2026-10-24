import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { formatMoney, localizePrices } from '../utils/pricing';
const CurrencyContext = createContext({ currency: 'RUB', selectCurrency: () => {} });
const valid = value => value === 'RUB' || value === 'BYN';
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('RUB');
  const manualChoice = useRef(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ks-currency');
      if (valid(saved)) { manualChoice.current = true; setCurrency(saved); return; }
    } catch { /* Storage may be unavailable in private browsers. */ }
    const controller = new AbortController();
    fetch('/api/currency', { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => { if (!manualChoice.current && valid(result?.currency)) setCurrency(result.currency); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const value = useMemo(() => ({ currency, selectCurrency(next) {
    if (!valid(next)) return;
    manualChoice.current = true;
    setCurrency(next);
    try { localStorage.setItem('ks-currency', next); } catch { /* Keep the session choice. */ }
  } }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
export function usePricing() {
  const { currency } = useContext(CurrencyContext);
  return { currency, money: amount => formatMoney(amount, currency), text: value => localizePrices(value, currency) };
}
export function CurrencySwitcher() {
  const { currency, selectCurrency } = useContext(CurrencyContext);
  return <div className="flex items-center gap-1 text-xs" role="group" aria-label="Валюта цен"><span className="mr-2 text-zinc-500">Валюта</span>{['BYN','RUB'].map(code => <button key={code} type="button" aria-pressed={currency === code} onClick={() => selectCurrency(code)} className={`px-2 py-1 border rounded-sm ${currency === code ? 'border-[#FF5B23] text-[#FF5B23]' : 'border-zinc-200 text-zinc-500'}`}>{code}</button>)}</div>;
}
