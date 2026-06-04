import React, { useState } from 'react';
import { Send } from 'lucide-react';
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
        <span className="text-sm font-semibold text-zinc-900">{contentData.sidebar.profile.name}</span>
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center border border-zinc-200 rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Открыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* ===== MOBILE NAV OVERLAY ===== */}
      <nav className={`lg:hidden fixed inset-0 bg-white/95 backdrop-blur-lg z-[300] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-6 w-10 h-10 border border-zinc-200 rounded-xl bg-white flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Закрыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleLinkClick(e, item.id)}
            className="text-xl font-semibold text-zinc-900 px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-80 h-screen overflow-y-auto flex-col p-9 border-r border-zinc-100 bg-white z-100">
        {/* Profile */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 border border-zinc-200 bg-zinc-100">
            <img src={contentData.sidebar.profile.avatarUrl} alt={contentData.sidebar.profile.altText} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-1">{contentData.sidebar.profile.name}</h2>
          <p className="text-sm text-zinc-500 font-medium">{contentData.sidebar.profile.role}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="mb-8">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
               const isActive = activeSection === item.id;
               return (
                 <li key={item.id}>
                   <a
                     href={`#${item.id}`}
                     onClick={(e) => handleLinkClick(e, item.id)}
                     className={`block px-3.5 py-2.5 text-[14.5px] rounded-xl transition-all duration-200 ${
                       isActive
                         ? 'text-zinc-900 bg-zinc-100 font-semibold'
                         : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium'
                     }`}
                   >
                     {item.label}
                   </a>
                 </li>
               );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-6 border-t border-zinc-100 flex flex-col gap-4">
          <p className="text-[13px] text-zinc-500 leading-relaxed">
            {contentData.sidebar.shortDescription}
          </p>
          <a
            href={contentData.sidebar.socialLinks.telegram}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-3 	px-5 rounded-xl cursor-pointer w-full hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[1px]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send className="w-4 h-4" />
            <span>Связаться в Telegram</span>
          </a>
        </div>
      </aside>
    </>
  );
}
