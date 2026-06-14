import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import contentData from '../contentData';

const INITIAL_VISIBLE = 4; // количество карточек, видимых при первой загрузке

export default function Cases() {
  const cases = contentData.cases.items;
  const [showAll, setShowAll] = useState(false);

  const visibleCases = showAll ? cases : cases.slice(0, INITIAL_VISIBLE);
  const hiddenCount = cases.length - INITIAL_VISIBLE;
  const hasMore = !showAll && hiddenCount > 0;

  // ── Framer Motion варианты ──
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      WebkitBackdropFilter: "blur(0px)"
    },
    visible: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      WebkitBackdropFilter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeInOut" }
    },
    hover: {
      opacity: 1,
      backdropFilter: "blur(3px)",
      WebkitBackdropFilter: "blur(3px)",
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 0, scale: 0.95 },
    hover: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, delay: 0.1, ease: "easeOut" }
    }
  };

  return (
    <motion.section
      id="cases"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100 bg-white"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
      </div>

      <div className="relative z-10">
        {/* ── Заголовок секции ── */}
        <div className="overflow-hidden mb-10">
          <motion.h2
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-black mb-0"
          >
            {contentData.cases.title}
          </motion.h2>
        </div>

        {/* ══════════════════════════════════════════════════
            СЕТКА КАРТОЧЕК
            ══════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <AnimatePresence initial={false}>
            {visibleCases.map((project, idx) => {
              const caseNumber = String(idx + 1).padStart(2, '0');
              return (
                <motion.div
                  key={project.name}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 16, transition: { duration: 0.3 } }}
                  layout
                  className="h-full"
                >
                  <Link to={`/case/${idx + 1}`} className="no-underline block h-full">
                    <motion.article
                      whileHover="hover"
                      className="bg-gray-50/40 border border-neutral-200/80 rounded-sm p-3 flex flex-col justify-between group cursor-pointer transition-all duration-500 ease-out hover:bg-white hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden h-full"
                    >
                      <div>
                        {/* Внутренний таб-индекс */}
                        <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-3 block">
                          [ Кейс {caseNumber} ]
                        </span>

                        {/* Графический контейнер */}
                        <div className="relative overflow-hidden aspect-[4/3] rounded-sm bg-zinc-50 border border-zinc-100/50">

                          {/* Основное фото с зумом при ховере */}
                          <img
                            src={project.imageMain}
                            alt={project.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />

                          {/* Заглушка «В разработке» */}
                          {project.inDevelopment && (
                            <motion.div
                              variants={overlayVariants}
                              className="absolute inset-0 bg-zinc-950/60 pointer-events-none group-hover:pointer-events-auto flex items-center justify-center z-20"
                            >
                              <motion.span
                                variants={textVariants}
                                className="text-white text-[11px] font-bold tracking-widest uppercase px-3.5 py-2 border border-white/10 bg-zinc-900/90 rounded-sm shadow-md"
                              >
                                Кейс в разработке...
                              </motion.span>
                            </motion.div>
                          )}

                          {/* Лаймовые бейджи */}
                          <div className="absolute bottom-3 left-3 flex flex-row flex-wrap gap-1.5 z-10">
                            {project.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="bg-[#E0FB4A] border border-[#E0FB4A]/30 text-zinc-950 text-[10px] px-2.5 py-1 rounded-sm shadow-sm tracking-wide uppercase font-semibold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Нижняя текстовая часть */}
                      <div className="flex flex-col pt-5 mt-1">
                        <h3 className="text-xl md:text-2xl font-light tracking-tight text-black flex items-center justify-between gap-2 w-full">
                          <span>{project.name}</span>
                          <span className="text-gray-300 transition-all duration-300 text-sm shrink-0 group-hover:text-[#FF5B23] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            ↗
                          </span>
                        </h3>

                        {/* Адаптивная ссылка на мобильных */}
                        <span className="block md:hidden mt-4 mb-3 text-sm font-medium text-zinc-800 hover:text-zinc-600 underline decoration-zinc-300 underline-offset-4">
                          Смотреть кейс →
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            КНОПКА «ПОКАЗАТЬ ЕЩЁ» / «СКРЫТЬ»
            ══════════════════════════════════════════════════ */}
        <AnimatePresence>
          {cases.length > INITIAL_VISIBLE && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex justify-center mt-10"
            >
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className={`group inline-flex items-center gap-3 px-6 py-3 rounded-sm text-[13px] font-medium tracking-wide transition-all duration-250 hover:shadow-sm ${
                  !showAll
                    ? 'bg-[#E0FB4A] border border-[#E0FB4A] text-zinc-950 hover:bg-[#d5f53c] hover:border-[#d5f53c]'
                    : 'bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:text-zinc-950'
                }`}
              >
                <span>{!showAll ? 'Показать еще' : 'Скрыть'}</span>
                {!showAll ? (
                  <>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-[11px] font-semibold text-white transition-colors duration-200">
                      {hiddenCount}
                    </span>
                    {/* Лаймовый ромбик-акцент при ховере */}
                    <span className="w-1.5 h-1.5 bg-zinc-950 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </>
                ) : null}
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ══════════════════════════════════════════════════
            ЖУРНАЛЬНЫЙ АРХИВ ПРОЕКТОВ
            Чисто информационный список всех кейсов на белом фоне
            ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.610, 0.355, 1.000] }}
          className="mt-20"
        >
          {/* Заголовок архива */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-0">
            ДРУГИЕ ПРОЕКТЫ
          </p>

          {/* Строки архива */}
          <div className="mt-4">
            {/* Верхняя разделительная линия */}
            <div className="border-t border-zinc-100" />

            {cases.slice(0, 4).map((project, idx) => (
              <div key={project.name}>
                {/* Строка проекта */}
                <div className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 py-4 transition-colors duration-200 cursor-default">

                  {/* 01 — номер */}
                  <span className="text-[11px] font-medium text-zinc-300 sm:w-10 shrink-0 select-none tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Название */}
                  <span className="text-[14px] md:text-[15px] font-medium text-zinc-800 group-hover:text-zinc-950 transition-colors duration-200 sm:flex-1 tracking-tight leading-snug">
                    {project.name}
                  </span>

                  {/* Краткое описание — справа от названия на десктопе */}
                  <span className="text-[12px] text-zinc-400 leading-snug sm:ml-6 sm:text-right sm:max-w-xs shrink-0">
                    {project.description}
                  </span>

                </div>

                {/* Нижняя разделительная линия */}
                <div className="border-t border-zinc-100" />
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
