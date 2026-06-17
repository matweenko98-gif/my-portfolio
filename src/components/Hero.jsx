import React from 'react';
import { motion } from 'framer-motion';
import contentData from '../contentData';

export default function Hero() {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const title = contentData.hero.title;
  const commaIdx = title.indexOf(',');
  const titlePart1 = title.slice(0, commaIdx + 1);
  const titlePart2 = title.slice(commaIdx + 1);

  return (
    <motion.section
      id="hero"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 lg:pb-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100 bg-white"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
      </div>

      {/* Two-column magazine layout */}
      <div className="relative z-10 w-full grid grid-cols-1 xl:grid-cols-5 gap-10 xl:gap-12 items-start pt-4 xl:pt-8">

        {/* ── Left column: monumental heading only ── */}
        <div className="xl:col-span-3">
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
              className="text-[clamp(2rem,4.5vw,4.2rem)] font-light tracking-tighter text-black leading-[0.95] mb-0"
            >
              <span className="text-[#FF5B23]">{titlePart1}</span>
              {titlePart2}
            </motion.h1>
          </div>
        </div>

        {/* ── Right column: status + description + actions + tags ── */}
        <div className="xl:col-span-2 xl:border-l xl:border-neutral-100 xl:pl-8 flex flex-col gap-6">

          {/* Status marker — no background, pure text */}
          <p className="text-[10px] font-medium tracking-wider uppercase text-neutral-400 leading-relaxed">
            [ STATUS:{' '}
            <span className="text-emerald-600">AVAILABLE FOR PROJECTS</span>
            {' '}]
          </p>

          {/* Main description */}
          <p className="text-[15px] sm:text-[16px] leading-relaxed text-zinc-600 max-w-[400px]">
            {contentData.hero.subtitle}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={`#${contentData.hero.buttons.primary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.primary.targetId)}
              className="inline-flex items-center justify-center bg-[#FF5B23] text-white font-medium py-3 px-6 rounded-sm hover:bg-[#e04f1e] transition-all duration-200 text-sm w-full sm:w-auto tracking-tight"
            >
              {contentData.hero.buttons.primary.text}
            </a>
            <a
              href={`#${contentData.hero.buttons.secondary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.secondary.targetId)}
              className="inline-flex items-center justify-center bg-white text-zinc-900 border border-[#FF5B23]/70 hover:border-[#FF5B23] font-medium py-3 px-6 rounded-sm hover:bg-[#FF5B23]/5 transition-colors duration-200 text-sm w-full sm:w-auto tracking-tight"
            >
              {contentData.hero.buttons.secondary.text}
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100" />

          {/* Tech tags — strict rectangular cells */}
          <div className="flex flex-wrap gap-2">
            {["Figma", "Tilda", "MVP", "AI-development"].map((tag) => (
              <span
                key={tag}
                className="bg-transparent border border-neutral-200/60 rounded-sm text-xs text-neutral-500 px-2.5 py-1 font-normal tracking-tight hover:text-black hover:border-neutral-400 transition-colors duration-200 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </motion.section>
  );
}
