import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Hero from './Hero';
import Services from './Services';
import Reviews from './Reviews';
import Cases from './Cases';
import Workflow from './Workflow';
import Contacts from './Contacts';
import contentData from '../contentData';
import { FlickeringGrid } from "./ui/FlickeringGrid";
import KineticMarquee from './ui/KineticMarquee';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    document.title = "Ксения Матвеенко — Дизайн-студия & Разработка премиальных сайтов";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Создание высококлассных сайтов, интерфейсов и UX/UI дизайна с упором на чистую эстетику и техническое совершенство.');
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = contentData.sidebar.navigation.map(item => item.id);

      // Calculate which section is currently centered/active in the viewport
      let currentSection = 'hero';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 240; // trigger zone offset
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load to establish initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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
            <Hero />
            <Services />
            <Cases />
            <Workflow />
            <Reviews />
            <Contacts />
            <KineticMarquee />
          </div>
        </motion.main>
      </div>
    </>
  );
}
