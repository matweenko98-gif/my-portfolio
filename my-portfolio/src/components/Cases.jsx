import React from 'react';

// Sub-component to render high-fidelity wireframe placeholders for different project types
function WireframePlaceholder({ type }) {
  const renderBrowserHeader = () => (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex-shrink-0">
      <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
      <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
      <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
      <div className="ml-4 w-1/3 h-3 bg-zinc-100 rounded-md"></div>
    </div>
  );

  switch (type) {
    case 'booking': // Booking Form Wireframe
      return (
        <div className="w-full h-60 bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.01]">
          {renderBrowserHeader()}
          <div className="flex-1 p-4 flex gap-4 bg-zinc-50/30">
            {/* Form Fields Column */}
            <div className="flex-1 flex flex-col gap-3 justify-center">
              <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
              <div className="h-8 bg-white border border-zinc-100 rounded-lg w-full"></div>
              <div className="h-8 bg-white border border-zinc-100 rounded-lg w-full"></div>
              <div className="h-8 bg-zinc-900 rounded-lg w-1/2 mt-1"></div>
            </div>
            {/* Sidebar Calendar Column */}
            <div className="w-1/3 bg-white border border-zinc-100 rounded-lg p-3 flex flex-col gap-2 justify-between">
              <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className={`h-3 rounded-sm ${i === 7 ? 'bg-zinc-900' : 'bg-zinc-100'}`}></div>
                ))}
              </div>
              <div className="h-5 bg-zinc-100 rounded-md w-full"></div>
            </div>
          </div>
        </div>
      );

    case 'dashboard': // CRM / IT Dashboard Wireframe
      return (
        <div className="w-full h-60 bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.01]">
          {renderBrowserHeader()}
          <div className="flex-1 flex bg-zinc-50/30">
            {/* Dashboard Sidebar */}
            <div className="w-12 border-r border-zinc-100 bg-white p-2 flex flex-col gap-3 items-center">
              <div className="w-6 h-6 rounded bg-zinc-100"></div>
              <div className="w-6 h-4 rounded bg-zinc-100"></div>
              <div className="w-6 h-4 rounded bg-zinc-100"></div>
            </div>
            {/* Dashboard Main Area */}
            <div className="flex-1 p-4 flex flex-col gap-4">
              {/* Widgets Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm">
                  <div className="w-1/2 h-2.5 bg-zinc-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-zinc-900 rounded"></div>
                </div>
                <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm">
                  <div className="w-1/2 h-2.5 bg-zinc-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-zinc-200 rounded"></div>
                </div>
                <div className="bg-white border border-zinc-100 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm">
                  <div className="w-1/2 h-2.5 bg-zinc-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-zinc-200 rounded"></div>
                </div>
              </div>
              {/* Chart Wireframe */}
              <div className="flex-1 bg-white border border-zinc-100 rounded-lg p-3 flex items-end justify-between gap-1 shadow-sm">
                <div className="w-6 bg-zinc-100 h-10 rounded-sm"></div>
                <div className="w-6 bg-zinc-100 h-16 rounded-sm"></div>
                <div className="w-6 bg-zinc-900 h-24 rounded-sm"></div>
                <div className="w-6 bg-zinc-100 h-14 rounded-sm"></div>
                <div className="w-6 bg-zinc-100 h-20 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'catalog': // E-commerce Catalog Wireframe
      return (
        <div className="w-full h-60 bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.01]">
          {renderBrowserHeader()}
          <div className="flex-1 p-3 flex gap-3 bg-zinc-50/30">
            {/* Filter Sidebar */}
            <div className="w-16 bg-white border border-zinc-100 rounded-lg p-2 flex flex-col gap-2">
              <div className="h-3 bg-zinc-100 rounded w-3/4"></div>
              <div className="h-2 bg-zinc-100 rounded w-1/2"></div>
              <div className="h-2 bg-zinc-100 rounded w-2/3"></div>
            </div>
            {/* Catalog Grid */}
            <div className="flex-1 grid grid-cols-3 gap-2.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-zinc-100 rounded-lg p-2 flex flex-col gap-2 shadow-sm">
                  <div className="flex-1 bg-zinc-50 rounded-md relative overflow-hidden flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-[10px] text-zinc-300 font-bold">🛒</div>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'landing': // Educational Landing Page Wireframe
      return (
        <div className="w-full h-60 bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.01]">
          {renderBrowserHeader()}
          <div className="flex-1 p-4 bg-zinc-50/30 flex flex-col justify-between">
            {/* Hero Layout */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-zinc-900 rounded w-5/6"></div>
                <div className="h-2 bg-zinc-400 rounded w-2/3"></div>
                <div className="h-6 bg-zinc-900 rounded-md w-1/3 mt-2"></div>
              </div>
              <div className="w-1/3 h-20 bg-white border border-zinc-100 rounded-lg flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-200"></div>
              </div>
            </div>
            {/* Course Features */}
            <div className="grid grid-cols-4 gap-2 mb-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-zinc-100 rounded-md p-1.5 flex flex-col gap-1 shadow-sm">
                  <div className="w-4 h-4 rounded-sm bg-zinc-100"></div>
                  <div className="h-1.5 bg-zinc-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <div className="w-full h-60 bg-zinc-100 rounded-xl"></div>;
  }
}

import contentData from '../contentData';

export default function Cases() {
  const cases = contentData.cases.items;

  return (
    <section id="cases" className="py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-10">{contentData.cases.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cases.map((project, idx) => (
          <article
            key={idx}
            className="border border-zinc-100 rounded-2xl overflow-hidden hover:border-zinc-200 transition-colors bg-white shadow-sm flex flex-col"
          >
            {/* Wireframe Placeholder */}
            <div className="p-4 bg-zinc-50/50 border-b border-zinc-100">
              <WireframePlaceholder type={project.wireframeType} />
            </div>

            {/* Case Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg mb-4 tracking-wide uppercase">
                  {project.metric}
                </span>
                <h3 className="text-[17px] font-bold text-zinc-900 mb-4">{project.name}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3 mb-6">
                  {project.details.map((detail, dIdx) => (
                    <p key={dIdx} className="text-[13px] text-zinc-500 leading-relaxed">
                      <strong className="text-zinc-900 font-semibold">{detail.label}: </strong>
                      {detail.value}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:gap-2.5 transition-all duration-200 mt-2"
              >
                <span>Смотреть разбор</span>
                <span>→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
