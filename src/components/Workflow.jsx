import React, { useState } from 'react';
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

  return (
    <section id="workflow" className="py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100 w-full overflow-hidden">
      {/* Title & Subtitle */}
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
          {workflowContent.title}
        </h2>
        <p className="text-[14px] text-zinc-500 max-w-[600px] leading-relaxed">
          {workflowContent.subtitle}
        </p>
      </div>

      {/* Tabs Switcher Panel in minimalist premium Apple style */}
      <div className="flex p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200 max-w-xl mb-12">
        <button
          onClick={() => setActiveTab('websites')}
          className={`flex-1 py-3 px-4 text-[13px] font-medium transition-all duration-300 rounded-xl ${
            activeTab === 'websites'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {workflowContent.tabs.websites}
        </button>
        <button
          onClick={() => setActiveTab('aiApps')}
          className={`flex-1 py-3 px-4 text-[13px] font-medium transition-all duration-300 rounded-xl ${
            activeTab === 'aiApps'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
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
        className="w-full overflow-x-auto select-none scrollbar-none mb-20 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-none::-webkit-scrollbar { display: none; }
        `}} />
        <div key={activeTab} className="flex flex-row gap-6 pb-6 w-max min-w-full snap-x snap-mandatory">
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
                className="group bg-zinc-50/80 border border-zinc-100/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 lg:hover:-translate-y-1 lg:hover:bg-white lg:hover:shadow-md lg:hover:border-zinc-200/80 w-[290px] min-w-[290px] lg:w-[320px] lg:min-w-[320px] h-[270px] lg:h-[285px] shrink-0 snap-align-start relative animate-fadeIn"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Top Progress Line */}
                <div className="w-full h-[3px] bg-zinc-200/60 rounded-full transition-colors duration-300 lg:group-hover:bg-zinc-900" />

                {/* Card Header */}
                <div className="flex justify-between items-center w-full mt-4">
                  <span className="text-[13px] font-bold text-zinc-400 transition-colors duration-300 lg:group-hover:text-zinc-950">
                    {step.number}
                  </span>
                </div>

                {/* Title & Description Body */}
                <div className="flex-1 flex flex-col justify-start mt-3">
                  <h3 className="text-[14.5px] font-bold text-zinc-900 mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[12.5px] text-zinc-500 leading-relaxed line-clamp-3 lg:line-clamp-4">
                    {step.desc}
                  </p>
                </div>

                {/* Result Badge */}
                <div className="mt-auto py-1 px-2.5 bg-zinc-100 border border-zinc-200/30 rounded-lg text-[10px] sm:text-[10.5px] font-medium text-zinc-500 self-start select-none whitespace-nowrap">
                  {stepResult}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standards Section */}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-10">
        {contentData.workflow.standardsTitle}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {standards.map((std, idx) => {
          const IconComponent = iconMap[std.iconName] || Sparkles;
          return (
            <div
              key={idx}
              className="group border border-zinc-100 rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-4 transition-all duration-500 ease-in-out will-change-transform lg:hover:-translate-y-1 lg:hover:shadow-md lg:hover:border-zinc-200/80 lg:hover:bg-gradient-to-b lg:hover:from-white lg:hover:to-zinc-50/80 lg:min-h-[240px] lg:h-[240px] lg:p-8 lg:gap-0 lg:justify-between relative"
            >
              {/* Background Number Watermark */}
              <div className="absolute top-6 right-8 text-6xl font-bold opacity-[0.06] select-none text-zinc-900 pointer-events-none">
                0{idx + 1}
              </div>

              {/* Icon Container */}
              <div className="inline-flex items-center justify-center bg-zinc-50 border border-zinc-100/50 rounded-xl transition-all duration-500 ease-in-out w-10 h-10 lg:w-12 lg:h-12 lg:group-hover:bg-white lg:group-hover:border-zinc-200/80 shrink-0">
                <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-zinc-900 transition-colors duration-500" />
              </div>

              {/* Bottom Text Block */}
              <div className="flex flex-col w-full mt-4 lg:mt-0">
                {/* Divider Line */}
                <hr className="border-zinc-100 w-full mb-4 opacity-60" />

                {/* Title + Plus Flex Line */}
                <div className="flex justify-between items-center w-full mb-1">
                  <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">
                    {std.title}
                  </h3>
                  <span className="text-zinc-400 opacity-60 text-lg transition-transform duration-500 ease-in-out lg:group-hover:rotate-45 shrink-0 ml-2 select-none">
                    +
                  </span>
                </div>

                {/* Description Paragraph */}
                <p className="text-[13px] text-zinc-500 leading-relaxed transition-all duration-500 ease-in-out lg:max-h-0 lg:opacity-0 lg:overflow-hidden lg:group-hover:max-h-[120px] lg:group-hover:opacity-100 lg:group-hover:mt-2">
                  {std.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
