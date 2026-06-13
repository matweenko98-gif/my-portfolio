import React, { useState } from 'react';
import contentData from '../contentData';

export default function Sidebar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = contentData.sidebar.navigation;

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 sticky top-0 bg-white/85 backdrop-blur-md border-b border-zinc-100 z-[200]">
        <span className="text-sm font-medium text-zinc-900">{contentData.sidebar.profile.name}</span>
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center border border-zinc-200/40 rounded-sm bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Открыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* ===== MOBILE NAV OVERLAY ===== */}
      <nav className={`lg:hidden fixed inset-0 bg-white/97 backdrop-blur-lg z-[300] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-6 w-10 h-10 border border-zinc-200/40 rounded-sm bg-white flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Закрыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleLinkClick(e, item.id)}
            className="text-xl font-light text-neutral-400 hover:text-black px-6 py-2.5 transition-colors tracking-tight"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="sidebar-desktop hidden lg:flex fixed top-0 left-0 w-[260px] h-screen max-h-screen overflow-hidden flex-col border-r border-zinc-100/60 bg-white z-100 p-5 xl:p-6">
        {/* Profile */}
        <div className="shrink-0 mb-6 xl:mb-8 sidebar-profile">
          <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-md overflow-hidden mb-4 border border-zinc-200/30 bg-zinc-50">
            <img src={contentData.sidebar.profile.avatarUrl} alt={contentData.sidebar.profile.altText} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-base xl:text-lg font-medium text-black mb-0.5 leading-tight tracking-tight">{contentData.sidebar.profile.name}</h2>
          <p className="text-[12px] xl:text-[13px] text-neutral-400 font-normal leading-snug sidebar-role">{contentData.sidebar.profile.role}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 min-h-0 flex flex-col justify-start py-1">
          <ul className="flex flex-col gap-0 sidebar-nav">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block px-0 py-2 xl:py-2.5 text-[13px] xl:text-[14px] transition-colors duration-200 ${isActive
                        ? 'text-black font-medium'
                        : 'text-neutral-400 hover:text-black font-normal'
                      }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer — text link only */}
        <div className="shrink-0 mt-auto border-t border-neutral-100/60 pt-4 sidebar-footer">
          <a
            href={contentData.sidebar.socialLinks.telegram}
            className="text-[13px] font-normal text-neutral-500 hover:text-black transition-colors whitespace-nowrap"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram →
          </a>
        </div>
      </aside>
    </>
  );
}
