import React from 'react';
import { motion } from 'framer-motion';

export default function KineticMarquee() {
  // Набор ключевых слов для бесконечной бегущей строки
  const marqueeTexts = [
    "ВЕБ-ДИЗАЙН",
    "РАЗРАБОТКА ИНТЕРФЕЙСОВ",
    "AI-MVP СЕРВИСЫ",
    "ТИПОГРАФИКА И СТИЛЬ",
    "FIGMA ДИЗАЙН-СИСТЕМЫ",
    "TILDA РАЗРАБОТКА",
    "UX/UI АНАЛИТИКА",
    "КРЕАТИВНЫЙ ФРОНТЕНД"
  ];

  // Дублируем элементы для создания бесшовного бесконечного скролла
  const duplicatedTexts = [...marqueeTexts, ...marqueeTexts, ...marqueeTexts, ...marqueeTexts];

  return (
    <div className="relative w-full bg-[#0a0a0a] overflow-hidden py-16 border-t border-b border-white/10">
      {/* Световой фокус (Spotlight) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-lime-500/20 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Контейнер бегущей строки */}
      <div className="relative z-10 flex whitespace-nowrap overflow-hidden">
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
    </div>
  );
}
