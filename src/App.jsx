import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Services from './components/Services';
import Reviews from './components/Reviews';
import Cases from './components/Cases';
import Workflow from './components/Workflow';
import Contacts from './components/Contacts';
import contentData from './contentData';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans text-zinc-900">
      {/* Fixed Sidebar on Left */}
      <Sidebar activeSection={activeSection} />

      {/* Scrollable Content on Right */}
      <main className="flex-1 lg:ml-[260px] min-h-screen flex flex-col bg-white">
        <Hero />
        <Services />
        <Cases />
        <Workflow />
        <Reviews />
        <Contacts />
      </main>
    </div>
  );
}
