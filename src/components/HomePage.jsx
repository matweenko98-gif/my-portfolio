import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Hero from './Hero';
import contentData from '../contentData';
import { FlickeringGrid } from "./ui/FlickeringGrid";

// ─── Тяжёлые секции — lazy-loaded ─────────────────────────────────────────────
// Services (~86 KB), Cases, Workflow, Reviews, Contacts, KineticMarquee
// подгружаются асинхронно после того, как Hero уже отрисован.
const Services     = lazy(() => import('./Services'));
const Cases        = lazy(() => import('./Cases'));
const Workflow     = lazy(() => import('./Workflow'));
const Reviews      = lazy(() => import('./Reviews'));
const FAQ          = lazy(() => import('./FAQ'));
const Contacts     = lazy(() => import('./Contacts'));
const KineticMarquee = lazy(() => import('./ui/KineticMarquee'));

// Минималистичный плейсхолдер для секций пока чанк грузится
function SectionFallback() {
  return <div style={{ minHeight: '200px' }} />;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    document.title = "Ксения Матвеенко — Дизайн & Разработка премиальных сайтов";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Создание высококлассных сайтов, интерфейсов и\u00a0UX/UI дизайна с\u00a0упором на\u00a0чистую эстетику и\u00a0техническое совершенство.');
    }

    // ─── Оптимизация: кэшируем координаты секций и исключаем DOM-чтения из скролла ───
    let sectionPositions = [];

    const updateSectionPositions = () => {
      const sections = contentData.sidebar.navigation.map(item => item.id);
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

    // Первоначальный расчет
    updateSectionPositions();

    // Задержка для правильного вычисления ленивых секций после рендера
    const resizeTimeout = setTimeout(updateSectionPositions, 500);

    const handleResize = () => {
      requestAnimationFrame(updateSectionPositions);
    };

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        let currentSection = 'hero';
        for (const section of sectionPositions) {
          if (scrollPosition >= section.top && scrollPosition < section.top + section.height) {
            currentSection = section.id;
          }
        }
        setActiveSection(currentSection);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    // Начальное состояние
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <>
      {/* Background Flickering Grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.1} gridGap={6} maxOpacity={0.15} squareSize={4} />
      </div>

      {/* Main Content layout */}
      <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
        {/* Fixed Sidebar on Left */}
        <Sidebar activeSection={activeSection} />

        {/* Scrollable Content on Right with Blur Reveal animation */}
        <motion.main
          initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
        >
          <div className="relative z-10 flex flex-col w-full">
            {/* Hero грузится синхронно — критический контент первого экрана */}
            <Hero />

            {/* Все остальные секции — lazy, подгрузятся после первого экрана */}
            <Suspense fallback={<SectionFallback />}>
              <Services />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Cases />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Workflow />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Reviews />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <FAQ />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Contacts />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <KineticMarquee />
            </Suspense>
          </div>
        </motion.main>
      </div>
    </>
  );
}
