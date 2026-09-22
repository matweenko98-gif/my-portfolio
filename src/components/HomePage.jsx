import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Hero from './Hero';
import Services from './Services';
import Cases from './Cases';
import Workflow from './Workflow';
import Reviews from './Reviews';
import FAQ from './FAQ';
import BlogSection from './BlogSection';
import Contacts from './Contacts';
import contentData from '../contentData';
import { FlickeringGrid } from "./ui/FlickeringGrid";

// ─── Тяжёлые декоративные компоненты — lazy-loaded ───────────────────────────
const KineticMarquee = lazy(() => import('./ui/KineticMarquee'));

function SectionFallback() {
  return <div style={{ minHeight: '100px' }} />;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();

  // Scroll to hash element if present in url (e.g. /#blog, /#faq)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const scrollToHash = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Выполняем скролл после отрисовки макета
      const timer = setTimeout(scrollToHash, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

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
          const rect = el.getBoundingClientRect();
          positions.push({
            id: sectionId,
            top: rect.top + window.scrollY - 240,
            height: rect.height
          });
        }
      }
      sectionPositions = positions;
    };

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

    // Настраиваем ResizeObserver для отслеживания изменений размеров страницы (загрузки lazy-секций)
    const mainContent = document.getElementById('main-content-wrapper');
    let resizeObserver;
    if (mainContent) {
      resizeObserver = new ResizeObserver(() => {
        updateSectionPositions();
        handleScroll();
      });
      resizeObserver.observe(mainContent);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Первоначальный расчет
    updateSectionPositions();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
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
          <div id="main-content-wrapper" className="relative z-10 flex flex-col w-full">
            {/* Hero грузится синхронно — критический контент первого экрана */}
            <Hero />
            <Services />
            <Cases />
            <Workflow />
            <Reviews />
            <FAQ />
            <BlogSection />
            <Contacts />
            <Suspense fallback={<SectionFallback />}>
              <KineticMarquee />
            </Suspense>
          </div>
        </motion.main>
      </div>
    </>
  );
}
