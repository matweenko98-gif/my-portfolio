import React from 'react';
import contentData from '../contentData';

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
      <div className="w-full max-w-[860px] flex flex-col justify-center">
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
            {["Figma", "Tilda", "MVP", "AI-development"].map((tag) => (
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
    </section>
  );
}
