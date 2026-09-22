import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import contentData from '../contentData';

const CARDS_DATA = [
  {
    id: 'sites',
    title: 'САЙТЫ',
    tag: 'Tilda',
    scrollTargetId: 'service-card-01',
    // top-left, верхняя позиция
    desktopStyle: { left: '0%', top: '10%', width: '220px', height: '120px' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5B23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'webapps',
    title: 'ВЕБ-ПРИЛОЖЕНИЯ\nИ MVP',
    tag: 'AI-development',
    scrollTargetId: 'service-card-03',
    // центр, ступенька вниз
    desktopStyle: { left: '30%', top: '40%', width: '220px', height: '120px' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5B23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="4" height="9" rx="0.5" />
        <rect x="10" y="4" width="4" height="16" rx="0.5" />
        <rect x="17" y="8" width="4" height="12" rx="0.5" />
      </svg>
    ),
  },
  {
    id: 'platforms',
    title: 'ПЛАТФОРМЫ/\nСЕРВИСЫ',
    tag: 'AI-development',
    scrollTargetId: 'service-card-03',
    // справа, top:20% гарантирует чёткий зазор ниже строки статуса
    desktopStyle: { right: '5%', top: '20%', width: '220px', height: '120px' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5B23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

function ServiceCard({ title, tag, icon, scrollTargetId, desktopStyle }) {
  const outerRef = useRef(null);
  const rectRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springX = useSpring(magX, { stiffness: 280, damping: 28 });
  const springY = useSpring(magY, { stiffness: 280, damping: 28 });

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (outerRef.current) {
      rectRef.current = outerRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) return;
    let rect = rectRef.current;
    if (!rect) {
      if (outerRef.current) {
        rect = outerRef.current.getBoundingClientRect();
        rectRef.current = rect;
      }
    }
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    magX.set((e.clientX - cx) * 0.1);
    magY.set((e.clientY - cy) * 0.1);
  };

  const resetMag = () => { magX.set(0); magY.set(0); };

  const handleScroll = () => {
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={outerRef}
      className="absolute"
      style={{ ...desktopStyle, zIndex: isDragging ? 50 : 'auto' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setIsHovered(false); rectRef.current = null; resetMag(); }}
      onMouseEnter={handleMouseEnter}
    >
      {/* Magnetic spring wrapper */}
      <motion.div className="absolute inset-0" style={{ x: springX, y: springY }}>
        {/* Draggable card — без скруглений (rounded-none) */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
          onDragStart={() => { setIsDragging(true); resetMag(); }}
          onDragEnd={() => setIsDragging(false)}
          onTap={handleScroll}
          whileDrag={{ scale: 1.04, zIndex: 50 }}
          className={[
            'w-full h-full bg-white rounded-none p-3.5 sm:p-4 relative select-none flex flex-col justify-between',
            'cursor-grab active:cursor-grabbing',
            'transition-[border-color,box-shadow] duration-300',
            isHovered && !isDragging
              ? 'border border-[#FF5B23]/50 card-shimmer'
              : 'border border-neutral-200',
          ].join(' ')}
        >
          {/* Верхний ряд: плашка с иконкой и тэг */}
          <div className="flex items-start justify-between w-full">
            {/* Плашка без скруглений */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FFF2EA] border border-[#FF5B23]/15 rounded-none flex items-center justify-center shrink-0">
              {icon}
            </div>
            {/* Tag — строго верхний правый угол */}
            <span className="font-mono text-[9px] text-neutral-400 tracking-wide select-none pt-0.5">
              {tag}
            </span>
          </div>

          {/* Title — строго нижний левый угол */}
          <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight text-zinc-900 leading-snug whitespace-pre-line select-none mt-2">
            {title}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MobileCard({ title, tag, icon, scrollTargetId }) {
  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      className="flex-1 bg-white border border-neutral-200 rounded-none p-3 relative text-left cursor-pointer hover:border-[#FF5B23]/50 transition-colors duration-200 min-h-[92px] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between w-full">
        {/* Плашка без скруглений */}
        <div className="w-7 h-7 bg-[#FFF2EA] border border-[#FF5B23]/15 rounded-none flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="font-mono text-[8px] text-neutral-400 tracking-wide">
          {tag}
        </span>
      </div>
      <span className="block text-[10px] font-semibold tracking-tight text-zinc-900 leading-snug whitespace-pre-line select-none mt-2">
        {title}
      </span>
    </button>
  );
}

export default function Hero() {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col bg-white border-b border-zinc-100 md:min-h-screen"
    >
      {/* Фоновая анимация: отключённый звук обязателен для автозапуска в браузерах. */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-55"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Светлый слой сохраняет контраст текста и карточек поверх видео. */}
      <div className="absolute inset-0 z-0 bg-white/35 pointer-events-none" aria-hidden="true" />

      {/* Background coordinate grid lines — едва угадываются */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0 opacity-40">
        <div className="border-l border-neutral-200 h-full" />
        <div className="border-l border-neutral-200 h-full" />
        <div className="border-l border-neutral-200 h-full" />
        <div className="border-l border-neutral-200 h-full" />
      </div>

      {/* Status badge — фиксирован к секции, вне контейнера с паддингами */}
      <div className="absolute top-5 right-5 lg:right-16 z-20">
        <span className="font-mono text-[10px] tracking-widest text-neutral-400">
          [ STATUS:{' '}
          <span className="text-emerald-500 font-medium">AVAILABLE FOR PROJECTS</span>
          {' '}]
        </span>
      </div>

      {/* Основной контейнер с горизонтальными паддингами */}
      <div className="flex flex-col md:flex-1 justify-start px-4 md:px-12 lg:px-16 min-h-0 gap-6 pb-2 md:pb-24">

        {/* ── Зона плашек ── */}
        <div className="relative md:flex-1 min-h-0 md:min-h-[42vh] pt-8 md:pt-12">

          {/* Desktop staircase — скрыты на мобильном */}
          <div className="hidden lg:block">
            {CARDS_DATA.map((card) => (
              <ServiceCard key={card.id} {...card} />
            ))}
          </div>

          {/* Mobile row — скрыт на десктопе */}
          <div className="flex lg:hidden gap-3 mt-6 pt-1">
            {CARDS_DATA.map((card) => (
              <MobileCard key={card.id} {...card} />
            ))}
          </div>
        </div>

        {/* ── Контентная зона (заголовок, подзаголовок, кнопки) ── */}
        <div className="relative z-10 pb-0 md:pb-10 pt-6 md:pt-2">

          {/* Заголовок: font-normal (400), очень крупный, uppercase, плотный */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1] }}
            className="mt-6 md:mt-0 text-[10vw] md:text-7xl lg:text-[6vw] font-normal tracking-tighter text-black leading-[0.95] uppercase mb-2 md:mb-4"
            dangerouslySetInnerHTML={{ __html: contentData.hero.title }}
          />

          {/* Подзаголовок: полный текст, принудительный перенос после первого предложения */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1], delay: 0.12 }}
            className="text-[13px] sm:text-[14px] text-zinc-500 leading-relaxed max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: contentData.hero.subtitle }}
          />

          {/* Кнопки: растянуты на ширину подзаголовка, rounded-[2px] */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1], delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-3 max-w-[600px]"
          >
            <a
              href={`#${contentData.hero.buttons.primary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.primary.targetId)}
              className="flex-1 w-full inline-flex items-center justify-center bg-[#FF5B23] text-white font-semibold py-3 px-5 rounded-[2px] hover:bg-[#e04f1e] transition-colors duration-200 text-sm tracking-tight"
            >
              {contentData.hero.buttons.primary.text}
            </a>
            <a
              href={`#${contentData.hero.buttons.secondary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.secondary.targetId)}
              className="flex-1 w-full inline-flex items-center justify-center bg-white text-zinc-900 font-semibold py-3 px-5 rounded-[2px] hover:bg-orange-50 transition-colors duration-200 text-sm tracking-tight"
              style={{ border: '0.4px solid #FF5B23' }}
            >
              {contentData.hero.buttons.secondary.text}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
