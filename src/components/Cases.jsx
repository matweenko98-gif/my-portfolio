import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import contentData from '../contentData';
import { supabase } from '../lib/supabaseClient';
import { caseCardImg } from '../utils/imageUtils';

const INITIAL_VISIBLE = 4; // количество карточек, видимых при первой загрузке

const FALLBACK_OTHER_PROJECTS = [
  {
    num: "01",
    title: "Интернет-магазин одежды FORME",
    description: "Онлайн-магазин одежды с\u00a0фокусом на\u00a0форму, посадку и\u00a0визуальную чистоту. Проект ориентирован на\u00a0аудиторию, для\u00a0которой важны не тренды «на\u00a0один сезон», а\u00a0силуэт, качество и\u00a0ощущение собранного образа."
  },
  {
    num: "02",
    title: "Типография цифровых решений",
    description: "Многостраничный сайт. Основной фокус — B2B-клиенты, для\u00a0которых важны скорость, качество, точная цветопередача и\u00a0надёжность подрядчика."
  },
  {
    num: "03",
    title: "Корпоративный сайт косметологического кабинета",
    description: "Косметологический кабинет для\u00a0девушек с\u00a0проблемной, чувствительной и\u00a0реактивной кожей. Формат — частный специалист. Сайт должен был работать как\u00a0система: объяснять подход специалиста, показывать логику работы с\u00a0кожей и\u00a0формировать ощущение безопасного пространства."
  },
  {
    num: "04",
    title: "Nempl — автоматизация бизнеса",
    description: "Nempl — компания, занимающаяся внедрением ИИ-сотрудников для\u00a0автоматизации продаж и\u00a0бизнес-процессов. Основной продукт — ИИ-ассистенты для\u00a0отделов продаж, поддержки и\u00a0коммуникаций, интегрируемые с\u00a0CRM и\u00a0мессенджерами."
  }
];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [otherProjects, setOtherProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setCases(data || []);
      } catch (err) {
        console.error('Error fetching cases for homepage:', err);
        setCases(contentData.cases.items);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('other_projects')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setOtherProjects(data);
        } else {
          // Empty DB, seed default entries
          try {
            await supabase
              .from('other_projects')
              .insert(FALLBACK_OTHER_PROJECTS.map((p, idx) => ({
                num: p.num,
                title: p.title,
                description: p.description,
                link_url: p.link_url || null,
                sort_order: idx
              })));
            const { data: refetched } = await supabase
              .from('other_projects')
              .select('*')
              .order('sort_order', { ascending: true });
            if (refetched && refetched.length > 0) {
              setOtherProjects(refetched);
              return;
            }
          } catch (seedErr) {
            console.error('Error seeding other projects on mount:', seedErr);
          }
          setOtherProjects(FALLBACK_OTHER_PROJECTS);
        }
      } catch (err) {
        console.error('Error fetching other projects:', err);
        setOtherProjects(FALLBACK_OTHER_PROJECTS);
      }
    };

    fetchCases();
    fetchOtherProjects();
  }, []);

  const handleToggle = () => {
    if (showAll) {
      setShowAll(false);
      setTimeout(() => {
        const el = document.getElementById('case-card-2');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    } else {
      setShowAll(true);
    }
  };

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
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b\u00a0border-zinc-100 bg-white"
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
              const isInDev = !!project.is_in_development || !!project.inDevelopment;
              const title = project.card_title || project.title || project.name || '(Без\u00a0названия)';
              const image = project.card_image || project.imageMain;
              const tags = Array.isArray(project.card_tags) ? project.card_tags : (project.tags || []);
              const slug = project.slug || String(idx + 1);

              const cardContent = (
                <motion.article
                  whileHover={!isInDev ? "hover" : ""}
                  className={`bg-gray-50/40 border border-neutral-200/80 rounded-sm p-3 flex flex-col justify-between group transition-all duration-500 ease-out relative overflow-hidden h-full ${
                    isInDev 
                      ? 'cursor-default' 
                      : 'cursor-pointer hover:bg-white hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  <div>
                    {/* Внутренний таб-индекс */}
                    <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-3 block">
                      [ КЕЙС {caseNumber} ]
                    </span>

                    {/* Графический контейнер */}
                    <div className="relative overflow-hidden aspect-[4/3] rounded-sm bg-zinc-50 border border-zinc-100/50">
                      <div className="relative w-full h-full overflow-hidden">
                        {isInDev && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                            <div className="bg-black px-4 py-2 rounded-sm text-white text-[11px] font-bold tracking-wider">
                              КЕЙС В РАЗРАБОТКЕ...
                            </div>
                          </div>
                        )}
                        {image ? (
                          <img
                            src={caseCardImg(image)}
                            alt={title}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            width={650}
                            height={488}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
                              !isInDev ? 'group-hover:scale-105' : ''
                            }`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 bg-neutral-100 text-xs">
                            Нет изображения
                          </div>
                        )}
                      </div>

                      {/* Лаймовые бейджи */}
                      <div className="absolute bottom-3 left-3 flex flex-row flex-wrap gap-1.5 z-10">
                        {tags.map((tag, tIdx) => (
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
                      <span>{title}</span>
                      {!isInDev && (
                        <span className="text-zinc-300 transition-all duration-300 text-sm shrink-0 group-hover:text-[#FF5B23] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      )}
                    </h3>

                    {!isInDev && (
                      <span className="block md:hidden mt-4 mb-3 text-sm font-medium text-zinc-800 hover:text-zinc-600 underline decoration-zinc-300 underline-offset-4">
                        Смотреть кейс →
                      </span>
                    )}
                  </div>
                </motion.article>
              );

              return (
                <motion.div
                  key={project.id || slug || idx}
                  id={`case-card-${idx}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 16, transition: { duration: 0.3 } }}
                  layout
                  className="h-full"
                >
                  {isInDev ? (
                    <div className="h-full block">
                      {cardContent}
                    </div>
                  ) : (
                    <Link to={`/case/${slug}`} className="no-underline block h-full">
                      {cardContent}
                    </Link>
                  )}
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
                onClick={handleToggle}
                className={`group inline-flex items-center gap-3 px-6 py-3 rounded-sm text-[13px] font-medium tracking-wide transition-all duration-250 hover:shadow-sm ${
                  !showAll
                    ? 'bg-[#E0FB4A] border border-[#E0FB4A] text-zinc-950 hover:bg-[#d5f53c] hover:border-[#d5f53c]'
                    : 'bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:text-zinc-950'
                }`}
              >
                <span>{!showAll ? 'Показать еще' : 'Скрыть'}</span>
                {!showAll ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-[11px] font-semibold text-white transition-colors duration-200">
                    {hiddenCount}
                  </span>
                ) : null}
              </button>
            </motion.div>
          )}
        </AnimatePresence>


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

            {otherProjects.map((project) => {
              const hasLink = !!project.link_url;
              const rowContent = (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-4 items-baseline">
                  {/* Left column: Number + Title */}
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200 shrink-0 select-none tabular-nums">
                      {project.num}
                    </span>
                    <span className="text-[14px] md:text-[15px] font-medium text-zinc-800 group-hover:text-zinc-950 transition-colors duration-200 tracking-tight leading-snug">
                      {project.title}
                    </span>
                  </div>

                  {/* Right column: Description */}
                  <div className="text-[12px] text-zinc-450 group-hover:text-zinc-800 transition-colors duration-200 leading-relaxed md:pl-2">
                    {project.description}
                  </div>
                </div>
              );

              return (
                <div key={project.id || project.num} className="relative">
                  {hasLink ? (
                    <a
                      href={project.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block no-underline transition-all duration-300 hover:bg-zinc-50/70 px-4 -mx-4 rounded-sm cursor-pointer"
                    >
                      {rowContent}
                    </a>
                  ) : (
                    <div className="group px-4 -mx-4">
                      {rowContent}
                    </div>
                  )}
                  {/* Lower divider line */}
                  <div className="border-t border-zinc-100" />
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
