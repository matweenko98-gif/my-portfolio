import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabaseClient';
import contentData from '../contentData';
import { caseCardImg } from '../utils/imageUtils';
import { FlickeringGrid } from "./ui/FlickeringGrid";

export default function AllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sites', 'apps'

  useEffect(() => {
    document.title = "Все кейсы — Ксения Матвеенко";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Архив и полный список выполненных проектов: от адаптивных сайтов на Tilda до кастомных интерактивных веб-приложений.');
    }

    // Fetch cases from Supabase
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        setCases(data || []);
      } catch (err) {
        console.error('Error fetching cases for AllCases page:', err);
        setCases(contentData.cases.items); // Fallback to contentData
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
    window.scrollTo(0, 0); // scroll to top on mount
  }, []);

  // Categorization function: parses metadata & tags to split cases into 'sites' and 'apps'
  const getProjectCategory = (project) => {
    const type = (project.meta?.type || '').toLowerCase();
    const title = (project.card_title || project.title || project.name || '').toLowerCase();
    const tags = (Array.isArray(project.card_tags) ? project.card_tags : (project.tags || [])).map(t => t.toLowerCase());

    const isApp = 
      type.includes('приложен') || 
      type.includes('сервис') || 
      type.includes('платформ') || 
      type.includes('mvp') || 
      tags.includes('react') || 
      tags.includes('next.js') || 
      tags.includes('mvp') || 
      tags.includes('app') ||
      title.includes('приложение') ||
      title.includes('платформа');

    return isApp ? 'apps' : 'sites';
  };

  const filteredCases = cases.filter(item => {
    if (activeTab === 'all') return true;
    return getProjectCategory(item) === activeTab;
  });

  return (
    <>
      {/* Background Flickering Grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.1} gridGap={6} maxOpacity={0.15} squareSize={4} />
      </div>

      {/* Main Content Layout */}
      <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
        {/* Reuse the desktop/mobile sidebar */}
        <Sidebar activeSection="cases" />

        {/* Scrollable Content on Right */}
        <motion.main
          initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
        >
          {/* Background Coordinate Lines */}
          <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
          </div>

          <div className="relative z-10 py-12 px-6 md:py-20 md:px-12 lg:px-16 flex flex-col w-full">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors duration-200 no-underline group"
              >
                <span className="text-[14px] transition-transform duration-200 group-hover:-translate-x-1">
                  ←
                </span>
                <span>На главную</span>
              </Link>
            </div>

            {/* Title */}
            <div className="overflow-hidden mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-black mb-0">
                Результаты и кейсы
              </h1>
            </div>

            {/* Tabs Filter Bar */}
            <div className="flex gap-6 border-b border-zinc-150 mb-10 pb-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Все проекты' },
                { id: 'sites', label: 'Сайты' },
                { id: 'apps', label: 'Приложения' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap bg-transparent border-none ${
                    activeTab === tab.id ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[#FF5B23]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Cases Grid / Loading states */}
            {loading ? (
              <div className="flex items-center gap-3 py-20 justify-center text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                <span className="w-4 h-4 border-2 border-zinc-200 border-t-[#FF5B23] rounded-full animate-spin" />
                <span>Загрузка кейсов...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 font-light text-base">
                В этой категории пока нет опубликованных проектов.
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredCases.map((project, idx) => {
                    const caseNumber = String(idx + 1).padStart(2, '0');
                    const isInDev = !!project.is_in_development || !!project.inDevelopment;
                    const title = project.card_title || project.title || project.name || '(Без названия)';
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
                          {/* Inner tab number */}
                          <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-3 block">
                            [ КЕЙС {caseNumber} ]
                          </span>

                          {/* Graphical container */}
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
                                  loading="lazy"
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

                            {/* Tags list */}
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

                        {/* Lower text part */}
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
                            <span className="block md:hidden mt-4 mb-3 text-sm font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4">
                              Смотреть кейс →
                            </span>
                          )}
                        </div>
                      </motion.article>
                    );

                    return (
                      <motion.div
                        key={project.id || slug || idx}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
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
            )}
          </div>
        </motion.main>
      </div>
    </>
  );
}
