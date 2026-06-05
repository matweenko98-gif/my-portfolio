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
      className="min-h-screen flex flex-col justify-center py-16 px-6 md:px-12 lg:px-16 border-b border-zinc-100"
    >
      <div className="max-w-[720px]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-bold tracking-tight text-zinc-900 leading-[1.2] mb-6">
          {contentData.hero.title}
        </h1>
        <p className="text-[15px] sm:text-[17px] leading-relaxed text-zinc-600 mb-10 max-w-[640px]">
          {contentData.hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`#${contentData.hero.buttons.primary.targetId}`}
            onClick={(e) => handleScrollTo(e, contentData.hero.buttons.primary.targetId)}
            className="inline-flex items-center justify-center bg-zinc-900 text-white font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto"
          >
            {contentData.hero.buttons.primary.text}
          </a>
          <a
            href={`#${contentData.hero.buttons.secondary.targetId}`}
            onClick={(e) => handleScrollTo(e, contentData.hero.buttons.secondary.targetId)}
            className="inline-flex items-center justify-center bg-white text-zinc-900 border border-zinc-200 font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-50 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto"
          >
            {contentData.hero.buttons.secondary.text}
          </a>
        </div>
      </div>
    </section>
  );
}
