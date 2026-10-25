import ServiceContact from './ServiceContact';
import { relatedCaseServices } from '../content/serviceCatalog';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, MessageCircle, Check, Copy, Clock, Shield, Loader2 } from 'lucide-react';
import contentData from '../contentData';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabaseClient';
import { caseHeroImg, panoramaImg, featureImg, mobileFeatureImg, outroImg, customBlockImg, avatarImg } from '../utils/imageUtils';
import ConceptToolbarModal from './ConceptToolbarModal';
import { normalizeCaseRecord } from '../utils/caseRecord';

// ── Framer Motion shared animation preset ──
const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }
};

function getAboutText(about, legacyText = '') {
  if (typeof about === 'string') {
    try {
      const parsed = JSON.parse(about);
      if (typeof parsed?.text === 'string') return parsed.text.trim();
    } catch {
      return about.trim();
    }
  }
  if (typeof about?.text === 'string') return about.text.trim();
  return typeof legacyText === 'string' ? legacyText.trim() : '';
}

const marqueeStyle = `
  @keyframes marquee-ltr {
    0% { transform: translate3d(-50%, 0, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }
  @keyframes marquee-rtl {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  .animate-marquee-ltr { animation: marquee-ltr 35s linear infinite; }
  .animate-marquee-rtl { animation: marquee-rtl 35s linear infinite; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function CaseTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [casesList, setCasesList] = useState([]);
  const [activeSection, setActiveSection] = useState('case-about');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);

  useEffect(() => {
    if (loading || data) return;
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
    document.getElementById('jsonld-route')?.remove();
    document.getElementById('jsonld-case')?.remove();
  }, [loading, data]);

  // Fetch case detail from Supabase dynamically
  useEffect(() => {
    const fetchCaseData = async () => {
      setLoading(true);
      try {
        // 1. Check local contentData items
        const localMatch = contentData.cases.items.find(
          item => String(item.id) === id || String(item.slug) === id || item.slug === id || (id === '1' && (item.is_ai_concept || item.isAiConcept))
        );

        // 2. Fetch from Supabase
        let dbMatch = null;
        try {
          const { data: bySlug } = await supabase
            .from('cases')
            .select('*')
            .eq('slug', id)
            .maybeSingle();
          
          if (bySlug) {
            dbMatch = bySlug;
          } else {
            const { data: byId } = await supabase
              .from('cases')
              .select('*')
              .eq('id', id)
              .maybeSingle();
            if (byId) dbMatch = byId;
          }
        } catch (dbErr) {
          console.warn('Supabase fetch error or offline:', dbErr);
        }

        const finalData = dbMatch ? { ...(localMatch || {}), ...normalizeCaseRecord(dbMatch) } : localMatch;

        if (finalData) {
          setData(finalData);
          if (finalData.is_ai_concept || finalData.isAiConcept) {
            setIsAiModalOpen(true);
          }
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Error fetching case detail:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseData();
  }, [id]);

  // Динамическое обновление SEO мета-тегов для кейса
  useEffect(() => {
    if (data) {
      const caseTitle = data.title || data.card_title || 'Проект';
      const caseDescription = data.meta_description || data.subtitle || data.card_description || `Подробный кейс по дизайну и разработке: ${caseTitle}. Ксения Матвеенко.`;
      const canonicalUrl = `https://www.ksenweb.com/case/${encodeURIComponent(id)}`;
      document.title = `${caseTitle} — Кейс Ксении Матвеенко`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', caseDescription);
      }

      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', canonicalUrl);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
      const caseImage = data.card_image || data.cardImage || data.hero_image || data.heroImage || data.imageMain || 'https://www.ksenweb.com/og-image.png';
      const socialMeta = [
        ['meta[property="og:type"]', 'property', 'og:type', 'article'],
        ['meta[property="og:title"]', 'property', 'og:title', `${caseTitle} — Кейс Ксении Матвеенко`],
        ['meta[property="og:description"]', 'property', 'og:description', caseDescription],
        ['meta[property="og:image"]', 'property', 'og:image', caseImage],
        ['meta[name="twitter:title"]', 'name', 'twitter:title', `${caseTitle} — Кейс Ксении Матвеенко`],
        ['meta[name="twitter:description"]', 'name', 'twitter:description', caseDescription],
        ['meta[name="twitter:image"]', 'name', 'twitter:image', caseImage],
      ];
      socialMeta.forEach(([selector, attribute, key, value]) => {
        let node = document.querySelector(selector);
        if (!node) {
          node = document.createElement('meta');
          node.setAttribute(attribute, key);
          document.head.appendChild(node);
        }
        node.setAttribute('content', value);
      });

      let schema = document.getElementById('jsonld-case');
      if (!schema) {
        schema = document.createElement('script');
        schema.id = 'jsonld-case';
        schema.type = 'application/ld+json';
        document.head.appendChild(schema);
      }
      schema.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: caseTitle,
        description: caseDescription,
        url: canonicalUrl,
        image: caseImage,
        creator: {
          '@type': 'Person',
          name: 'Ксения Матвеенко',
          url: 'https://www.ksenweb.com/',
        },
      });
    }
  }, [data, id]);


  // Fetch cases list for navigation
  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        const { data: list, error } = await supabase
          .from('cases')
          .select('slug, title, card_title')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setCasesList(list || []);
      } catch (err) {
        console.error('Error fetching cases list for navigation:', err);
      }
    };
    fetchAllCases();
  }, []);

  const scrollDesktop = (direction) => {
    const container = desktopScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollMobile = (direction) => {
    const container = mobileScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top when entering case page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track active section on scroll
  useEffect(() => {
    let sectionPositions = [];

    const updateSectionPositions = () => {
      const sections = ['case-about', 'case-process', 'case-challenge', 'case-showcase', 'case-mobile-showcase', 'case-outro', 'case-custom'];
      const positions = [];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          positions.push({
            id: sectionId,
            top: el.offsetTop - 240,
            height: el.offsetHeight
          });
        }
      }
      sectionPositions = positions;
    };

    updateSectionPositions();

    const resizeTimeout = setTimeout(updateSectionPositions, 500);

    const handleResize = () => {
      requestAnimationFrame(updateSectionPositions);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          let currentSection = 'case-about';
          for (const section of sectionPositions) {
            if (scrollPosition >= section.top && scrollPosition < section.top + section.height) {
              currentSection = section.id;
            }
          }
          setActiveSection(currentSection);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [id, data]);

  // Determine next case for navigation
  const currentIndex = casesList.findIndex(c => c.slug === id);
  let nextCase = null;
  if (currentIndex !== -1 && casesList.length > 0) {
    nextCase = casesList[(currentIndex + 1) % casesList.length];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5B23]" />
          <span className="text-xs font-semibold tracking-wider uppercase">Загрузка проекта...</span>
        </div>
      </div>
    );
  }

  // Handle AI Concept direct page render
  if (data && (data.is_ai_concept || data.isAiConcept)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans p-6 text-center relative overflow-hidden">
        <ConceptToolbarModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          concept={data}
        />
        <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#FF5B23] text-[#111111] mb-4">
          ИИ-КОНЦЕПТ
        </span>
        <Link to="/cases" className="text-sm text-zinc-400 underline underline-offset-4 mb-5">← Все проекты</Link>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-3 max-w-xl">
          {data.title || data.card_title || data.name}
        </h1>
        <p className="text-sm md:text-base text-zinc-400 mb-8 max-w-md font-light leading-relaxed">
          {data.description || 'Интерактивный ИИ-концепт для демонстрации возможностей визуального стиля и верстки.'}
          <span className="block mt-3 text-xs">Демонстрационная работа: показывает дизайн и взаимодействия, без результатов клиентского запуска.</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5B23] text-white hover:bg-[#e04f1e] rounded-sm text-sm font-semibold transition-all cursor-pointer shadow-lg no-underline border-none"
          >
            <span>Смотреть концепт</span>
            <span>↗</span>
          </button>
          <Link
            to="/services/landing#mp-contact"
            className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 rounded-sm text-sm font-medium transition-colors bg-zinc-900 cursor-pointer no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Обсудить похожий сайт</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900 font-sans p-6 text-center">
        <h1 className="text-4xl font-light tracking-tight text-black mb-4">Проект не найден</h1>
        <p className="text-sm text-zinc-500 mb-8 max-w-sm">Кейс с адресом "{id}" не существует в базе данных или был удален.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную</span>
        </Link>
      </div>
    );
  }

  const heroImageSrc = data.heroImage || data.hero_image;
  const aboutText = getAboutText(data.about, data.about_text || data.description || data.subtitle);
  const outroImages = data.outro?.images || (data.outro?.image ? [data.outro.image] : (Array.isArray(data.outro_images) ? data.outro_images : []));
  const liveUrl = data.challenge?.liveUrl || data.live_url || data.demoUrl || data.demo_url;
  const panoramaImages = data.panorama_images || data.panoramaImages || [];
  const mobileFeatures = data.mobile_features || data.mobileFeatures || [];
  const customBlocks = data.custom_blocks || data.customBlocks || [];

  const caseSections = [
    aboutText && { id: 'case-about', label: 'О\u00a0проекте' },
    (data.visibility?.process !== false && Array.isArray(data.process) && data.process.length > 0) && { id: 'case-process', label: 'Процесс' },
    (data.visibility?.challenge !== false && (data.challenge?.task || data.challenge?.solution || liveUrl)) && { id: 'case-challenge', label: 'Задача' },
    (data.visibility?.desktop !== false && Array.isArray(data.features) && data.features.length > 0) && { id: 'case-showcase', label: 'Десктоп' },
    (data.visibility?.mobile !== false && mobileFeatures.length > 0) && { id: 'case-mobile-showcase', label: 'Мобильные' },
    (data.visibility?.outro !== false && outroImages.length > 0) && { id: 'case-outro', label: 'Результат' },
    (data.visibility?.custom !== false && customBlocks.length > 0) && { id: 'case-custom', label: 'Инфо' }
  ].filter(Boolean);

  const metaItems = [
    { label: "Сфера", value: data.meta?.sphere },
    { label: "Тип проекта", value: data.meta?.type },
    { label: "Стек", value: data.meta?.stack },
    { label: "Год", value: data.meta?.year }
  ].filter(item => item.value && item.value.trim() !== '');

  const hasAbout = !!(data.about?.text && data.about.text.trim() !== '');
  const hasButton = !!(data.challenge?.liveUrl && data.challenge.liveUrl !== "" && data.challenge.liveUrl !== "#");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
      {/* Fixed Sidebar on Left */}
      <Sidebar activeSection="cases" />

      {/* Scrollable Content on Right with Blur Reveal animation */}
      <motion.main
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
      >
        <div className="relative z-10 flex flex-col w-full">

          {/* ══════════════════════════════════════════════════════════
          Блок 1: Главный экран (Hero)
          ══════════════════════════════════════════════════════════ */}
          <motion.section
            {...sectionReveal}
            className="relative bg-white"
          >
            {/* Back navigation button — fixed top-left */}
            <div className="absolute top-6 left-6 md:left-12 z-20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer no-underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            </div>

            <div className="pt-24 pb-12 px-6 md:px-12 lg:px-16">
              {/* Subtitle label */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF5B23] mb-5">
                [ Кейс ]
              </p>

              {/* Main title */}
              <div className="overflow-hidden mb-4">
                <motion.h1
                  initial={{ y: "100%", opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tighter text-black leading-[1.1]"
                >
                  {data.title || data.card_title}
                </motion.h1>
              </div>

              {/* Subtitle */}
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-zinc-500 font-light max-w-2xl mb-0"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>

            {/* Hero image placeholder or real image — full width */}
            {(heroImageSrc || data.heroImage) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1.000], delay: 0.15 }}
                className="w-full px-6 md:px-12 lg:px-16 pb-12"
              >
                {/* aspect-ratio задан через padding-trick контейнера, явный width/height предотвращает CLS */}
                <div className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-neutral-100 shadow-sm">
                  <img
                    src={caseHeroImg(heroImageSrc || data.heroImage)}
                    alt={data.title || data.card_title}
                    loading="eager"
                    decoding="async"
                    width={1400}
                    height={787}
                    className="w-full h-auto object-cover max-h-[85vh]"
                  />
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* ══════════════════════════════════════════════════════════
          Блок 2: Мета-данные и краткое описание
          ══════════════════════════════════════════════════════════ */}
          {(metaItems.length > 0 || (liveUrl && liveUrl !== "" && liveUrl !== "#")) && (
            <motion.section
              {...sectionReveal}
              className="border-t border-neutral-200/60 bg-white"
            >
              {metaItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-200/60">
                  {metaItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-6 md:px-12 lg:px-16 py-8 bg-white"
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                        {item.label}
                      </span>
                      <span className="block text-[14px] md:text-[15px] font-medium text-black tracking-tight">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {liveUrl && liveUrl !== "" && liveUrl !== "#" && (
                <div className={`px-6 md:px-12 lg:px-16 py-6 flex justify-start bg-white ${metaItems.length > 0 ? 'border-t border-neutral-200/60' : ''}`}>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5B23] text-white hover:bg-[#e04f1e] rounded-sm text-[13px] font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md no-underline"
                  >
                    <span>Смотреть сайт</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.section>
          )}

          {aboutText && (
            <motion.section
              {...sectionReveal}
              id="case-about"
              className="py-16 px-6 md:px-12 lg:px-16 bg-white"
            >
              <div className="max-w-4xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-5">
                  Описание проекта
                </p>
                <p className="text-base md:text-lg text-neutral-700 font-light leading-relaxed tracking-tight">
                  {aboutText}
                </p>
              </div>
            </motion.section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 3: Процесс работы (Design Process)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.process !== false && Array.isArray(data.process) && data.process.length > 0 && (
            <section
              id="case-process"
              className={`py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white ${
                aboutText || !liveUrl ? 'border-t border-neutral-100' : ''
              }`}
            >
              <div className="mb-12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Дизайн-процесс
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Этапы реализации
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.process.map((step, idx) => {
                  const stepNumber = String(idx + 1).padStart(2, '0');
                  const tags = Array.isArray(step.tags) ? step.tags : [];
                  
                  const icons = [
                    <Clock className="w-5 h-5 text-[#FF5B23]" />,
                    <Shield className="w-5 h-5 text-[#FF5B23]" />,
                    <Check className="w-5 h-5 text-[#FF5B23]" />
                  ];
                  const icon = icons[idx % 3];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.15 }}
                      className="bg-neutral-50/30 border border-neutral-200/60 rounded-sm p-6 flex flex-col justify-between hover:border-neutral-300 transition-colors duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                            {icon}
                          </div>
                          <span className="text-[11px] font-bold text-neutral-300 tracking-wider">
                            {stepNumber}
                          </span>
                        </div>

                        <h3 className="text-lg md:text-xl font-medium text-black mb-3">
                          {step.title}
                        </h3>

                        {step.duration && (
                          <span className="inline-block text-[10px] text-[#FF5B23] font-semibold uppercase tracking-wider mb-2">
                            Срок: {step.duration}
                          </span>
                        )}

                        <p className="text-[13px] leading-relaxed text-neutral-500 mb-6">
                          {step.desc || step.text}
                        </p>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 4: Бесконечный панорамный шоукейс
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.panorama !== false && panoramaImages.length > 0 && (
            <section id="case-marquee-showcase" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-b border-neutral-100 overflow-hidden relative">
              <style>{marqueeStyle}</style>

              <div className="px-6 md:px-12 lg:px-16 mb-12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Шоукейс интерфейсов
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Панорамный обзор
                </h2>
              </div>

              <div className="flex flex-col gap-6 w-full overflow-hidden">
                {/* Row 1: Left to Right */}
                <div className="relative w-full flex overflow-hidden">
                  <div className="flex gap-6 w-max animate-marquee-ltr">
                    {panoramaImages.map((imgUrl, idx) => (
                      <div key={`ltr-1-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                        <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {/* Duplicate for infinite effect */}
                    {panoramaImages.map((imgUrl, idx) => (
                      <div key={`ltr-2-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                        <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2: Right to Left */}
                {panoramaImages.length > 1 && (
                  <div className="relative w-full flex overflow-hidden">
                    <div className="flex gap-6 w-max animate-marquee-rtl">
                      {[...panoramaImages].reverse().map((imgUrl, idx) => (
                        <div key={`rtl-1-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                          <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {[...panoramaImages].reverse().map((imgUrl, idx) => (
                        <div key={`rtl-2-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                          <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 5: Задача и Решение (The Challenge)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.challenge !== false && (data.challenge?.task || data.challenge?.solution) && (
            <section id="case-challenge" className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white border-b border-neutral-100">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF5B23] mb-4">
                    [ Испытание ]
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black leading-tight">
                    Задача & Решение
                  </h2>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div className="text-base md:text-lg text-neutral-600 font-light leading-relaxed tracking-tight mb-8">
                    {data.challenge.task && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Задача</h4>
                        <p>{data.challenge.task}</p>
                      </div>
                    )}
                    {data.challenge.solution && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Решение</h4>
                        <p>{data.challenge.solution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 6: Ключевые десктопные экраны (Desktop Horizontal Scroll)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.desktop !== false && Array.isArray(data.features) && data.features.length > 0 && (
            <section id="case-showcase" className="py-20 md:py-28 bg-white border-b border-neutral-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:items-end px-6 md:px-12 lg:px-16 mb-6 md:mb-10 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Ключевые экраны
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                    Решения в деталях
                  </h2>
                </div>
                {/* Navigation controls */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => scrollDesktop('left')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollDesktop('right')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Horizontal Scroll */}
              <div
                ref={desktopScrollRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pb-6 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 scroll-pr-6 md:scroll-pr-12 lg:scroll-pr-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {data.features.map((feature, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="w-px self-stretch bg-neutral-200 my-4 shrink-0" />}
                    <div
                      className="w-[85vw] md:w-[45%] lg:w-[44%] shrink-0 snap-start flex flex-col"
                    >
                      {/* Text */}
                      <div className="mb-5">
                        <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-2 block">
                          [ 0{idx + 1} ]
                        </span>
                        <h3 className="text-xl md:text-2xl font-light tracking-tight text-black mb-3 leading-tight">
                          {feature.title}
                        </h3>
                        {feature.text && (
                          <p className="text-[14px] md:text-[15px] leading-relaxed text-zinc-600">
                            {feature.text}
                          </p>
                        )}
                      </div>

                      {/* Image */}
                      <div className="w-full aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden flex items-center justify-center mt-auto">
                        {feature.image ? (
                          <img src={featureImg(feature.image)} alt={feature.title} loading="lazy" decoding="async" width={800} height={450} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neutral-400 text-[10px] font-semibold tracking-widest uppercase">
                            Десктопный скриншот 0{idx + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 7: Мобильная версия (Mobile Responsive Carousel)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.mobile !== false && mobileFeatures.length > 0 && (
            <section id="case-mobile-showcase" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-b border-neutral-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:items-end px-6 md:px-12 lg:px-16 mb-6 md:mb-10 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Адаптивность
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                    Мобильная версия
                  </h2>
                </div>
                {/* Navigation controls */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => scrollMobile('left')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollMobile('right')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Horizontal Carousel */}
              <div
                ref={mobileScrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pb-6 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 scroll-pr-6 md:scroll-pr-12 lg:scroll-pr-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {mobileFeatures.map((screen, idx) => (
                  <div
                    key={idx}
                    className="w-[60vw] sm:w-[40vw] md:w-[25vw] lg:w-[18vw] shrink-0 snap-start flex flex-col"
                  >
                    {/* Text */}
                    <div className="mb-4">
                      {screen.label && (
                        <span className="text-[9px] font-semibold text-[#FF5B23] tracking-widest uppercase block mb-1">
                          [ {screen.label} ]
                        </span>
                      )}
                      <h3 className="text-sm font-medium text-black leading-tight">
                        {screen.title}
                      </h3>
                    </div>

                    {/* Smartphone Aspect Ratio */}
                    <div className="w-full aspect-[9/19] bg-neutral-100 border border-zinc-300 rounded-md overflow-hidden flex items-center justify-center relative mt-auto">
                      {screen.image ? (
                        <img src={mobileFeatureImg(screen.image)} alt={screen.title} loading="lazy" decoding="async" width={400} height={844} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col justify-between p-4 text-neutral-400 text-[9px] font-medium tracking-widest uppercase absolute inset-0">
                          <div className="flex justify-between items-center w-full">
                            <span>Экран 0{idx + 1}</span>
                            <div className="w-4 h-1.5 rounded-full bg-neutral-200/70" />
                          </div>

                          <span className="self-center">9:19 PLACEHOLDER</span>

                          <div className="w-8 h-8 rounded-full border border-neutral-200/70 self-center flex items-center justify-center text-[8px] select-none">
                            ○
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок Outro: Финальное изображение / Сетка
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.outro !== false && outroImages.length > 0 && (
            <motion.section
              {...sectionReveal}
              id="case-outro"
              className="py-16 px-6 md:px-12 lg:px-16 bg-white border-t border-neutral-100"
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Результат
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Финальный шоукейс
                </h2>
              </div>

              <div className={`grid grid-cols-1 ${outroImages.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                {outroImages.map((imgUrl, idx) => (
                  <div key={idx} className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-zinc-50 shadow-sm" style={{ aspectRatio: '16/9' }}>
                    <img src={outroImg(imgUrl)} alt={`Outro ${idx + 1}`} loading="lazy" decoding="async" width={1000} height={562} className="w-full h-auto object-cover" />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок Custom Blocks: Кастомные блоки контента
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.custom !== false && customBlocks.length > 0 && (
            <section id="case-custom" className="py-16 px-6 md:px-12 lg:px-16 bg-white border-t border-neutral-100">
              <div className="space-y-12">
                {customBlocks.map((block, idx) => (
                  <div key={idx} className="w-full">
                    {block.type === 'text' ? (
                      <div className="max-w-4xl">
                        <p className="text-base md:text-lg text-neutral-700 font-light leading-relaxed tracking-tight whitespace-pre-line">
                          {block.content}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-zinc-50">
                        <img src={customBlockImg(block.content)} alt={`Кастомный блок ${idx + 1}`} loading="lazy" decoding="async" width={1000} height={562} className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          9. НАВИГАЦИЯ — возврат + следующий кейс
          ══════════════════════════════════════════════════════════ */}
          <section className="bg-white border-t border-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Back to home */}
              <Link
                to="/cases"
                className="group flex items-center gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 border-b\u00a0md:border-b-0 md:border-r border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 transition-colors duration-300 no-underline"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300 shrink-0" />
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                    Назад
                  </span>
                  <span className="block text-lg md:text-xl font-light tracking-tight text-zinc-900">
                    Все кейсы
                  </span>
                </div>
              </Link>

              {/* Next case */}
              {nextCase ? (
                <Link
                  to={`/case/${nextCase.slug}`}
                  className="group flex items-center justify-end gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 bg-zinc-50/50 hover:bg-zinc-100/60 transition-colors duration-300 text-right no-underline"
                >
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                      Следующий кейс
                    </span>
                    <span className="block text-lg md:text-xl font-light tracking-tight text-zinc-900">
                      {nextCase.title || nextCase.card_title || 'Следующий проект'}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-[#FF5B23] transition-colors duration-300 shrink-0" />
                </Link>
              ) : (
                <div className="px-6 md:px-12 lg:px-16 py-10 md:py-14 bg-zinc-50/50 text-right flex items-center justify-end text-zinc-350 select-none">
                  <span>Конец галереи</span>
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
          8. БЛОК «ОБСУДИТЬ ПРОЕКТ» — полная копия с главной
          ══════════════════════════════════════════════════════════ */}
          <section className="mp-section case-related-services"><h2>Услуги для похожей задачи</h2><div className="mp-reading-list">{relatedCaseServices(data).map(service => <Link key={service.key} to={`/services/${service.key}`}><h3>{service.name}</h3><p>{service.description}</p><span className="mp-text-link">Что входит в услугу ↗</span></Link>)}</div></section>
          <ServiceContact id="contacts" service={relatedCaseServices(data)[0]?.key || 'general'} title="Обсудим похожий проект"/>

          {/* ══════════════════════════════════════════════════════════
          БЕГУЩАЯ СТРОКА
          ══════════════════════════════════════════════════════════ */}


        </div>
      </motion.main>
    </div>
  );
}
