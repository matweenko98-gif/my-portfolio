import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function KineticMarquee() {
  // Набор ключевых слов для бесконечной бегущей строки
  const marqueeTexts = [
    "ВЕБ-ДИЗАЙН",
    "РАЗРАБОТКА ИНТЕРФЕЙСОВ",
    "AI-MVP СЕРВИСЫ",
    "ТИПОГРАФИКА И\u00a0СТИЛЬ",
    "FIGMA ДИЗАЙН-СИСТЕМЫ",
    "TILDA РАЗРАБОТКА",
    "UX/UI АНАЛИТИКА",
    "КРЕАТИВНЫЙ ФРОНТЕНД"
  ];

  // Дублируем элементы для создания бесшовного бесконечного скролла
  const duplicatedTexts = [...marqueeTexts, ...marqueeTexts, ...marqueeTexts, ...marqueeTexts];

  return (
    <div className="relative w-full bg-[#0a0a0a] overflow-hidden pt-16 pb-12 border-t border-white/10 flex flex-col items-center">
      {/* Световой фокус (Spotlight) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-lime-500/20 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Контейнер бегущей строки */}
      <div className="relative z-10 w-full flex whitespace-nowrap overflow-hidden mb-12">
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 140,
            ease: "linear"
          }}
          className="flex gap-16 text-white/80 text-4xl md:text-5xl font-extralight tracking-normal uppercase items-center pr-16"
        >
          {duplicatedTexts.map((text, index) => (
            <div key={index} className="flex items-center gap-16 select-none">
              <span className="font-extralight">{text}</span>
              <span className="text-[#E0FB4A]/70 text-xl md:text-2xl font-light select-none">
                ✦
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Юридический блок */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center md:text-left text-xs text-neutral-500 font-light space-y-4 pt-8 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-neutral-400">© 2026 Матвеенко Ксения Александровна. Плательщик налога на профессиональный доход (НПД). УНП: ЕЕ7594998.</p>
            <p className="text-neutral-500 max-w-2xl leading-relaxed">
              Расчет калькулятора носит ознакомительный характер и не является публичной офертой (ст. 407 ГК РБ). Окончательная стоимость фиксируется в договоре.
            </p>
          </div>
          <div className="flex gap-6 shrink-0">
            <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors duration-200">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors duration-200">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
