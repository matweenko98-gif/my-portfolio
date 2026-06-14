import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
import contentData from '../contentData';
import { workflowContent } from '../content/workflowContent';

const iconMap = {
  MessageSquare,
  Sparkles,
  Calendar,
  ShieldCheck
};

export default function Workflow() {
  const [activeTab, setActiveTab] = useState('websites');
  const [expandedStep, setExpandedStep] = useState(null);
  const standards = contentData.workflow.standards;

  const steps = activeTab === 'websites' ? workflowContent.websiteSteps : workflowContent.aiAppsSteps;

  const containerRef = React.useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleWheel = (e) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
      const isAtStart = container.scrollLeft <= 0;

      // If we are scrolling down and not at the end, or scrolling up and not at the start,
      // scroll horizontally and prevent vertical page scroll.
      if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  return (
    <motion.section
      id="workflow"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b border-neutral-800 bg-[#111111] w-full overflow-hidden"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
      </div>
      <div className="relative z-10">
      {/* Title & Subtitle */}
      <div className="mb-10">
        <div className="overflow-hidden mb-2">
          <motion.h2
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-0"
          >
            {workflowContent.title}
          </motion.h2>
        </div>
        <p className="text-[14px] text-neutral-400 max-w-[600px] leading-relaxed">
          {workflowContent.subtitle}
        </p>
      </div>

      {/* Tabs Switcher Panel in minimalist premium Apple style */}
      <div className="flex p-1 bg-neutral-900/50 rounded-md border border-neutral-850 w-full mb-12">
        <button
          onClick={() => setActiveTab('websites')}
          className={`flex-1 py-3 px-4 text-[13px] font-medium transition-all duration-300 rounded-sm font-sans ${activeTab === "websites"
              ? 'bg-[#E0FB4A] text-[#111111] shadow-sm font-semibold'
              : 'text-neutral-400 hover:text-white'
            }`}
        >
          {workflowContent.tabs.websites}
        </button>
        <button
          onClick={() => setActiveTab('aiApps')}
          className={`flex-1 py-3 px-4 text-[13px] font-medium transition-all duration-300 rounded-sm font-sans ${activeTab === "aiApps"
              ? 'bg-[#E0FB4A] text-[#111111] shadow-sm font-semibold'
              : 'text-neutral-400 hover:text-white'
            }`}
        >
          {workflowContent.tabs.aiApps}
        </button>
      </div>

      {/* Steps List - Horizontal Scrollable Wrapper */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className="w-full overflow-x-auto select-none scrollbar-none mb-20 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          .scrollbar-none::-webkit-scrollbar { display: none; }
        `}} />
        <div key={activeTab} className="flex flex-row gap-6 pb-6 w-max min-w-full snap-x snap-mandatory lg:snap-none">
          {steps.map((step, idx) => {
            const stepResults = {
              websites: [
                "Результат: Интеллект-карта и ТЗ",
                "Результат: Интерактивный макет в Figma",
                "Результат: Готовый сайт на Tilda + CRM",
                "Результат: Передача прав + Видеоинструкция",
                "Результат: 30 дней поддержки и аналитики"
              ],
              aiApps: [
                "Результат: Функциональное ТЗ и бэклог",
                "Результат: Интерактивный прототип Figma",
                "Результат: Рабочий MVP веб-сервис",
                "Результат: Релиз продукта + Инструкции",
                "Результат: План развития и итераций"
              ]
            };
            const stepResult = stepResults[activeTab][idx];

            return (
              <div
                key={idx}
                onClick={() => setExpandedStep(prev => prev === idx ? null : idx)}
                className={`group bg-[#1A1A1A] border border-neutral-800 rounded-md p-6 flex flex-col justify-between transition-all duration-300 lg:hover:-translate-y-1 lg:hover:bg-neutral-900/60 lg:hover:border-neutral-700 w-[290px] min-w-[290px] lg:w-[320px] lg:min-w-[320px] h-auto min-h-[290px] lg:h-[285px] shrink-0 snap-align-start lg:snap-align-none relative animate-fadeIn cursor-pointer`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Top Progress Line */}
                <div className="w-full h-[3px] bg-neutral-800 rounded-full transition-colors duration-300 lg:group-hover:bg-[#E0FB4A]" />

                {/* Card Header */}
                <div className="flex justify-between items-center w-full mt-4">
                  <span className="text-[10px] font-bold tracking-wider text-[#E0FB4A] uppercase">
                    [ ЭТАП {step.number} ]
                  </span>
                </div>

                {/* Title & Description Body */}
                <div className="flex-1 flex flex-col justify-start mt-3 mb-4">
                  <h3 className="text-[16px] font-light tracking-tight text-white mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className={`text-[12.5px] text-neutral-400 leading-relaxed ${expandedStep === idx ? 'line-clamp-none lg:line-clamp-4' : 'line-clamp-3 lg:line-clamp-4'}`}>
                    {step.desc}
                  </p>
                </div>

                {/* Result Badge */}
                <div className="mt-auto py-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm text-[10px] tracking-wider uppercase font-medium text-neutral-400 self-start select-none whitespace-normal break-words sm:whitespace-nowrap lg:whitespace-normal xl:whitespace-nowrap">
                  {stepResult}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standards Section */}
      <div className="overflow-hidden mb-10">
        <motion.h2
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-0"
        >
          {contentData.workflow.standardsTitle}
        </motion.h2>
      </div>

      <motion.div
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {standards.map((std, idx) => {
          const IconComponent = iconMap[std.iconName] || Sparkles;
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group border border-neutral-800 rounded-md p-6 bg-[#1A1A1A] flex flex-col gap-4 transition-all duration-500 ease-in-out will-change-transform lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:border-neutral-700 lg:hover:bg-neutral-900/60 lg:min-h-[240px] lg:h-[240px] lg:p-8 lg:gap-0 lg:justify-between relative"
            >
              {/* Background Number Watermark */}
              <div className="absolute top-6 right-8 text-7xl font-extralight opacity-[0.03] select-none text-white pointer-events-none">
                0{idx + 1}
              </div>

              {/* Icon Container */}
              <div className="inline-flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-sm transition-all duration-500 ease-in-out w-10 h-10 lg:w-12 lg:h-12 lg:group-hover:bg-[#1A1A1A] lg:group-hover:border-neutral-700 shrink-0">
                <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white transition-colors duration-500" />
              </div>

              {/* Bottom Text Block */}
              <div className="flex flex-col w-full mt-4 lg:mt-0">
                {/* Divider Line */}
                <hr className="border-neutral-800 w-full mb-4 opacity-60" />

                {/* Title + Plus Flex Line */}
                <div className="flex justify-between items-center w-full mb-1">
                  <h3 className="text-xl md:text-2xl font-light tracking-tight text-white leading-tight">
                    {std.title}
                  </h3>
                  <span className="text-neutral-500 opacity-80 text-lg transition-transform duration-500 ease-in-out lg:group-hover:rotate-45 shrink-0 ml-2 select-none">
                    +
                  </span>
                </div>

                {/* Description Paragraph */}
                <p className="text-[13px] text-neutral-450 leading-relaxed transition-all duration-500 ease-in-out lg:max-h-0 lg:opacity-0 lg:overflow-hidden lg:group-hover:max-h-[120px] lg:group-hover:opacity-100 lg:group-hover:mt-2">
                  {std.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    </motion.section>
  );
}
