import React, { useEffect, useState } from 'react';
import { ShoppingBag, Clock } from 'lucide-react';

const getDaysWord = (n) => {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 19) return 'рабочих дней';
  if (rem10 === 1) return 'рабочий день';
  if (rem10 >= 2 && rem10 <= 4) return 'рабочих дня';
  return 'рабочих дней';
};

const formatPrice = (price) => price.toLocaleString('ru-RU');

export default function ProjectCart({
  cartRef,
  cartIconRef,
  registerSlotRef,
  items = [],
  collectedIds = [],
  price,
  days,
  isComplete = false,
  bump = false,
  badgeBump = false,
  highlightedSlot = null,
  hintText = 'Выберите параметры слева — они появятся в корзине',
}) {
  const [showArrowHint, setShowArrowHint] = useState(true);
  const [priceBump, setPriceBump] = useState(false);

  const filledCount = collectedIds.length;
  const totalCount = items.length;

  useEffect(() => {
    const timer = setTimeout(() => setShowArrowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (highlightedSlot) setShowArrowHint(false);
  }, [highlightedSlot]);

  useEffect(() => {
    if (!isComplete) return;
    setPriceBump(true);
    const timer = setTimeout(() => setPriceBump(false), 400);
    return () => clearTimeout(timer);
  }, [price, days, isComplete]);

  return (
    <div
      ref={cartRef}
      className={`project-cart flex flex-col h-full rounded-2xl border border-zinc-200 bg-zinc-50/80 shadow-inner overflow-hidden transition-transform duration-300 ${
        bump ? 'project-cart--bump' : ''
      }`}
    >
      <div className="px-4 pt-4 pb-2 shrink-0">
        <p className="text-[12px] text-zinc-500 leading-relaxed mb-2.5">{hintText}</p>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-zinc-900 leading-tight">Ваша корзина проекта</h4>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Компоненты будущего сайта</p>
          </div>
          <span className="text-[11px] font-bold text-zinc-500 bg-white border border-zinc-200/60 px-2.5 py-1 rounded-lg shrink-0">
            {filledCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-6 min-h-0">
        {showArrowHint && filledCount < totalCount && (
          <div className="project-cart-hint absolute top-1 left-4 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
            <span className="inline-block animate-pulse">←</span>
            <span>Выберите опцию</span>
          </div>
        )}

        <div ref={cartIconRef} className="relative flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] text-zinc-800" strokeWidth={1.2} />
          <span
            className={`absolute -top-0.5 -right-2 min-w-[22px] h-[22px] px-1 flex items-center justify-center rounded-full bg-zinc-900 text-white text-[10px] font-bold shadow-md transition-transform duration-300 ${
              badgeBump ? 'project-cart-badge-bump' : ''
            }`}
          >
            {filledCount}
          </span>
        </div>
      </div>

      <div className="flex gap-2 w-full px-4 pb-4 shrink-0">
        {items.map((item) => {
          const Icon = item.icon;
          const isCollected = collectedIds.includes(item.id);
          const isHighlighted = highlightedSlot === item.id;

          return (
            <div
              key={item.id}
              ref={(el) => registerSlotRef?.(item.id, el)}
              className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border transition-all duration-300 ${
                isCollected
                  ? isHighlighted
                    ? 'bg-white border-zinc-400 shadow-sm scale-[1.03]'
                    : 'bg-white border-zinc-200/90 shadow-sm'
                  : 'border-dashed border-zinc-200/80 bg-white/30'
              }`}
            >
              {isCollected ? (
                <>
                  <span className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700 shrink-0">
                    {item.step}
                  </span>
                  {Icon && <Icon className="w-4 h-4 text-zinc-600 shrink-0" strokeWidth={1.5} />}
                </>
              ) : (
                <span className="text-[10px] font-medium text-zinc-300">{item.step}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-2 text-[12px] text-zinc-500 mb-2">
          <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span>
            Срок:{' '}
            <span className="font-semibold text-zinc-800">
              {isComplete ? `от ${days} ${getDaysWord(days)}` : '—'}
            </span>
          </span>
        </div>
        <div
          className={`flex items-baseline justify-between gap-2 transition-transform duration-300 ${
            priceBump ? 'project-cart-price-bump' : ''
          }`}
        >
          <span className="text-[12px] font-medium text-zinc-500">Итого</span>
          <span className="text-base font-bold text-zinc-900 tracking-tight">
            {isComplete ? `от ${formatPrice(price)} ₽` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
