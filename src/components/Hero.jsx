import React from 'react';
import contentData from '../contentData';

function CalculatorTeaser() {
  const handleTeaserClick = (serviceId) => {
    window.dispatchEvent(new CustomEvent('open-calculator', { detail: { serviceNumber: serviceId } }));
  };

  return (
    <div 
      onClick={() => handleTeaserClick('01')}
      className="w-full max-w-[380px] bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-zinc-350/80 transition-all duration-300 relative overflow-hidden group cursor-pointer select-none"
    >
      {/* Background glow animation */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-zinc-100 rounded-full blur-2xl group-hover:bg-zinc-200/50 transition-colors duration-500" />
      
      <div className="relative flex flex-col h-full z-10">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="inline-flex items-center justify-center p-1 bg-zinc-100 rounded-md border border-zinc-200/30">
            <svg className="w-3.5 h-3.5 text-zinc-900 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 13.903H9.813L10.626 9H4.719L9.813 15.904Z" />
            </svg>
          </span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Быстрый расчет
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-[16px] sm:text-[17px] font-bold text-zinc-950 leading-snug mb-4">
          Узнать стоимость проекта за 3 клика
        </h3>

        {/* Visual step progress indicator */}
        <div className="flex items-center justify-between gap-1 mb-5 bg-zinc-100/50 p-2.5 rounded-xl border border-zinc-200/30">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span>Шаг 1 • Выберите услугу</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
          </div>
        </div>

        {/* Dynamic Option Buttons */}
        <div className="flex flex-col gap-2 mb-5">
          {[
            { id: '01', name: 'Сайт на Tilda', price: 'от 30 000 ₽' },
            { id: '04', name: 'Дизайн в Figma', price: 'от 25 000 ₽' },
            { id: '03', name: 'Кастомный код / AI', price: 'от 50 000 ₽' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={(e) => {
                e.stopPropagation();
                handleTeaserClick(opt.id);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200/80 hover:border-zinc-950 text-left text-xs font-semibold text-zinc-800 transition-all hover:bg-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:-translate-y-[0.5px] active:translate-y-0"
            >
              <span>{opt.name}</span>
              <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-500">{opt.price}</span>
            </button>
          ))}
        </div>

        {/* Bottom Action Hint */}
        <div className="flex items-center justify-between text-xs font-bold text-zinc-950 mt-auto pt-3 border-t border-zinc-100">
          <span>Начать расчет цены</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center pt-28 pb-16 lg:pb-[80px] px-6 md:px-12 lg:px-16 border-b border-zinc-100 bg-gradient-to-br from-white to-zinc-50/20"
    >
      <div className="w-full max-w-[1140px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
        {/* Left Column (Content) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[56px] xl:text-[64px] font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
            {contentData.hero.title}
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-relaxed text-zinc-600 mb-8 max-w-[640px]">
            {contentData.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href={`#${contentData.hero.buttons.primary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.primary.targetId)}
              className="inline-flex items-center justify-center bg-zinc-900 text-white font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto shadow-sm"
            >
              {contentData.hero.buttons.primary.text}
            </a>
            <a
              href={`#${contentData.hero.buttons.secondary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.secondary.targetId)}
              className="inline-flex items-center justify-center bg-white text-zinc-900 border border-zinc-200 font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-50 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto shadow-sm"
            >
              {contentData.hero.buttons.secondary.text}
            </a>
          </div>

          <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6">
            {/* Status Badge with LED indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold w-fit select-none animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Доступна для новых проектов</span>
            </div>

            {/* Glassmorphic Tags */}
            <div className="flex flex-wrap gap-2.5 mt-1 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              {["Figma", "Tilda", "React", "AI Integration"].map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100/50 backdrop-blur-md border border-zinc-200/40 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-zinc-100/80 hover:text-zinc-950 transition-all duration-200 cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Teaser Widget) */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-start lg:justify-end">
          <CalculatorTeaser />
        </div>
      </div>
    </section>
  );
}
