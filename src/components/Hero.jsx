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
    desktopStyle: { left: '0%', top: '14%', width: '17%', height: '25%' },
  },
  {
    id: 'webapps',
    title: 'ВЕБ-ПРИЛОЖЕНИЯ\nИ MVP',
    tag: 'AI-development',
    scrollTargetId: 'service-card-03',
    // центр, ступенька вниз
    desktopStyle: { left: '30%', top: '42%', width: '21%', height: '28%' },
  },
  {
    id: 'platforms',
    title: 'ПЛАТФОРМЫ/\nСЕРВИСЫ',
    tag: 'AI-development',
    scrollTargetId: 'service-card-03',
    // справа, top:22% гарантирует чёткий зазор ниже строки статуса
    desktopStyle: { right: '5%', top: '22%', width: '21%', height: '38%' },
  },
];

function ServiceCard({ title, tag, scrollTargetId, desktopStyle }) {
  const outerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springX = useSpring(magX, { stiffness: 280, damping: 28 });
  const springY = useSpring(magY, { stiffness: 280, damping: 28 });

  const handleMouseMove = (e) => {
    if (isDragging) return;
    const rect = outerRef.current?.getBoundingClientRect();
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
      onMouseLeave={() => { setIsHovered(false); resetMag(); }}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Magnetic spring wrapper */}
      <motion.div className="absolute inset-0" style={{ x: springX, y: springY }}>
        {/* Draggable card */}
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
            'w-full h-full bg-white rounded-[2px] p-4 relative select-none',
            'cursor-grab active:cursor-grabbing',
            'transition-[border-color,box-shadow] duration-300',
            isHovered && !isDragging
              ? 'border border-[#FF5B23]/50 card-shimmer'
              : 'border border-neutral-200',
          ].join(' ')}
        >
          {/* Tag — строго верхний правый угол */}
          <span className="absolute top-3 right-3 font-mono text-[9px] text-neutral-400 tracking-wide select-none">
            {tag}
          </span>
          {/* Title — строго нижний левый угол */}
          <div className="flex flex-col justify-end h-full">
            <span className="text-[11px] font-semibold tracking-tight text-zinc-900 leading-snug whitespace-pre-line select-none">
              {title}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MobileCard({ title, tag, scrollTargetId }) {
  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      className="flex-1 bg-white border border-neutral-200 rounded-[2px] p-3 relative text-left cursor-pointer hover:border-[#FF5B23]/50 transition-colors duration-200 min-h-[70px]"
    >
      <span className="absolute top-2 right-2 font-mono text-[8px] text-neutral-400 tracking-wide">
        {tag}
      </span>
      <div className="flex flex-col justify-end h-full">
        <span className="block text-[10px] font-semibold tracking-tight text-zinc-900 leading-snug whitespace-pre-line select-none">
          {title}
        </span>
      </div>
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
      className="relative min-h-screen flex flex-col bg-white border-b border-zinc-100"
    >
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
      <div className="flex-1 flex flex-col px-6 md:px-12 lg:px-16 min-h-0">

        {/* ── Зона плашек ── */}
        <div className="relative flex-1 min-h-[42vh] pt-12">

          {/* Desktop staircase — скрыты на мобильном */}
          <div className="hidden lg:block">
            {CARDS_DATA.map((card) => (
              <ServiceCard key={card.id} {...card} />
            ))}
          </div>

          {/* Mobile row — скрыт на десктопе */}
          <div className="flex lg:hidden gap-2 mt-6">
            {CARDS_DATA.map((card) => (
              <MobileCard key={card.id} {...card} />
            ))}
          </div>
        </div>

        {/* ── Контентная зона (заголовок, подзаголовок, кнопки) ── */}
        <div className="relative z-10 pb-10 lg:pb-14 pt-2">

          {/* Заголовок: font-normal (400), очень крупный, uppercase, плотный */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1] }}
            className="text-6xl md:text-7xl lg:text-[6vw] font-normal tracking-tighter text-black leading-[0.9] uppercase mb-4"
          >
            ДИЗАЙН И РАЗРАБОТКА<br />ВЕБ-ПРОДУКТОВ
          </motion.h1>

          {/* Подзаголовок: полный текст, принудительный перенос после первого предложения */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1], delay: 0.12 }}
            className="text-[13px] sm:text-[14px] text-zinc-500 leading-relaxed max-w-none mb-6"
          >
            Создаю коммерческие лендинги, многостраничные сайты и&nbsp;интернет-магазины под&nbsp;ключ на&nbsp;Tilda. Для сложных задач разрабатываю
            <br className="hidden min-[1440px]:block" />
            {' '}веб-приложения (MVP) и&nbsp;сервисы. Использую AI-разработку, чтобы быстро собрать и&nbsp;протестировать продукт
          </motion.p>

          {/* Кнопки: растянуты на ширину подзаголовка, rounded-[2px] */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.215, 0.61, 0.355, 1], delay: 0.22 }}
            className="flex flex-row gap-2 max-w-[600px]"
          >
            <a
              href={`#${contentData.hero.buttons.primary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.primary.targetId)}
              className="flex-1 inline-flex items-center justify-center bg-[#FF5B23] text-white font-semibold py-3 px-5 rounded-[2px] hover:bg-[#e04f1e] transition-colors duration-200 text-sm tracking-tight"
            >
              {contentData.hero.buttons.primary.text}
            </a>
            <a
              href={`#${contentData.hero.buttons.secondary.targetId}`}
              onClick={(e) => handleScrollTo(e, contentData.hero.buttons.secondary.targetId)}
              className="flex-1 inline-flex items-center justify-center bg-white text-zinc-900 font-semibold py-3 px-5 rounded-[2px] hover:bg-orange-50 transition-colors duration-200 text-sm tracking-tight"
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
