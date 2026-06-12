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

  return (
    <section id="workflow" className="py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100">
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

      {/* Steps List */}
      <div key={activeTab} className="flex flex-col mb-20">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex gap-6 py-6 border-b border-zinc-100 last:border-b-0 items-start animate-fadeIn"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <span className="text-[13px] font-bold text-zinc-400 w-8 flex-shrink-0 pt-0.5">
              {step.number}
            </span>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-zinc-900 mb-1">
                {step.title}
              </h3>
              <p className="text-[13.5px] text-zinc-500 leading-relaxed max-w-[600px]">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
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
              className="group border border-zinc-100 rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-4 transition-all duration-500 ease-in-out will-change-transform lg:hover:-translate-y-1 lg:hover:shadow-md lg:hover:border-zinc-200 lg:h-[280px] relative"
            >
              <div className="inline-flex items-center justify-center bg-zinc-50 border border-zinc-100/50 rounded-xl transition-all duration-500 ease-in-out will-change-[width,height,transform] w-10 h-10 lg:w-[68px] lg:h-[68px] lg:group-hover:w-10 lg:group-hover:h-10 shrink-0">
                <IconComponent className="transition-all duration-500 ease-in-out will-change-transform w-5 h-5 lg:w-9 lg:h-9 lg:group-hover:w-5 lg:group-hover:h-5 text-zinc-900" />
              </div>
              <h3 className="text-[15px] font-bold text-zinc-900 transition-all duration-500 ease-in-out will-change-transform lg:absolute lg:bottom-6 lg:left-6 lg:right-6 lg:group-hover:-translate-y-[110px]">
                {std.title}
              </h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed transition-all duration-500 ease-in-out will-change-[transform,opacity] lg:absolute lg:bottom-6 lg:left-6 lg:right-6 lg:opacity-0 lg:pointer-events-none lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0">
                {std.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
