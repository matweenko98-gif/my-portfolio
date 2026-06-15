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
  hintText = 'Выберите параметры слева — они появятся в\u00a0корзине',
  isLight = false,
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
      className={`project-cart flex flex-col h-full rounded-sm border ${
        isLight ? 'border-neutral-200/40 bg-neutral-100 shadow-sm' : 'border-neutral-800 bg-[#1A1A1A]'
      } overflow-hidden transition-transform duration-300 ${bump ? 'project-cart--bump' : ''}`}
    >
      <div className="px-4 pt-4 pb-2 shrink-0">
        <p className={`text-[12px] ${isLight ? 'text-neutral-600 font-medium' : 'text-neutral-450'} leading-relaxed`}>
          {hintText}
        </p>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-6 min-h-0">
        {showArrowHint && filledCount < totalCount && (
          <div className="project-cart-hint absolute bottom-2 left-4 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
            <span className="inline-block animate-pulse">←</span>
            <span>Выберите опцию</span>
          </div>
        )}

        <div ref={cartIconRef} className="relative flex items-center justify-center mt-6">
          <ShoppingBag className="w-24 h-24 sm:w-[6.5rem] sm:h-[6.5rem] text-neutral-400 transition-all duration-300" strokeWidth={1.0} />
          <span
            className={`absolute transition-all duration-300 ${
              isLight
                ? '-top-1 -right-1 w-5 h-5 bg-[#111111] text-white text-[10px] font-bold'
                : '-top-1 -right-3 min-w-[26px] h-[26px] px-1.5 bg-[#E0FB4A] text-[#111111] text-[11px] font-extrabold shadow-md'
            } flex items-center justify-center rounded-full ${badgeBump ? 'project-cart-badge-bump' : ''}`}
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
              className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-sm border transition-all duration-300 ${
                isCollected
                  ? isHighlighted
                    ? isLight ? 'bg-white border-neutral-300 shadow-sm scale-[1.03]' : 'bg-neutral-900 border-[#E0FB4A] shadow-sm scale-[1.03]'
                    : isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-[#1A1A1A] border-neutral-700 shadow-sm'
                  : isLight ? 'border-dashed border-neutral-200 bg-neutral-100/40' : 'border-dashed border-neutral-800 bg-neutral-900/20'
              }`}
            >
              {isCollected ? (
                <>
                  <span className={`w-5 h-5 rounded-sm ${
                    isLight ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-neutral-800 border border-neutral-750 text-neutral-300'
                  } flex items-center justify-center text-[10px] font-bold shrink-0`}>
                    {item.step}
                  </span>
                  {Icon && <Icon className={`w-4 h-4 ${isLight ? 'text-neutral-600' : 'text-neutral-450'} shrink-0`} strokeWidth={1.5} />}
                </>
              ) : (
                <span className={`text-[10px] font-medium ${isLight ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {item.step}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`border-t ${isLight ? 'border-neutral-100 bg-neutral-100/40' : 'border-neutral-850 bg-[#1e1e1e]/40'} px-4 py-3.5 shrink-0`}>
        <div className={`flex items-center gap-2 text-[12px] ${isLight ? 'text-neutral-600' : 'text-neutral-450'} mb-2`}>
          <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          <span>
            Срок:{' '}
            <span className={`font-semibold ${isLight ? 'text-[#111111]' : 'text-white'}`}>
              {isComplete ? `от ${days} ${getDaysWord(days)}` : '—'}
            </span>
          </span>
        </div>
        <div
          className={`flex items-baseline justify-between gap-2 transition-transform duration-300 ${priceBump ? 'project-cart-price-bump' : ''
            }`}
        >
          <span className={`text-[12px] font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-450'}`}>Итого</span>
          <span className={`text-base font-bold ${isLight ? 'text-[#111111]' : 'text-[#E0FB4A]'} tracking-tight`}>
            {isComplete ? `от ${formatPrice(price)} ₽` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
