import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, MessageCircle, Check, Copy, Clock, Shield, Loader2 } from 'lucide-react';
import contentData from '../contentData';
import KineticMarquee from './ui/KineticMarquee';
import { supabase } from '../lib/supabaseClient';
import { caseHeroImg, panoramaImg, featureImg, mobileFeatureImg, outroImg, customBlockImg, avatarImg } from '../utils/imageUtils';

// ── Framer Motion shared animation preset ──
const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTACTS BLOCK (Обсудить проект) — полная копия логики из Contacts.jsx
// Переиспользуем внутри шаблона кейса со всей интерактивностью.
// ══════════════════════════════════════════════════════════════════════════════
function buildMessage(topic) {
  return `Здравствуйте! Меня интересует ${topic}. Хочу обсудить проект.`;
}

function buildTelegramHref(baseUrl, message) {
  const url = baseUrl.replace(/\/$/, '');
  return `${url}?text=${encodeURIComponent(message)}`;
}

function buildMaxHref(baseUrl, message) {
  if (baseUrl.includes('/u/')) return baseUrl;
  return `https://max.ru/:share?text=${encodeURIComponent(message)}`;
}

function CaseContacts() {
  const { contacts } = contentData;
  const [activeIntentId, setActiveIntentId] = useState(contacts.intents[0].id);
  const [copied, setCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const activeIntent = React.useMemo(
    () => contacts.intents.find((item) => item.id === activeIntentId) ?? contacts.intents[0],
    [activeIntentId, contacts.intents]
  );

  const message = React.useMemo(
    () => buildMessage(activeIntent.messageTopic),
    [activeIntent.messageTopic]
  );

  const telegramHref = buildTelegramHref(contacts.messengers.telegram.url, message);
  const maxHref = buildMaxHref(contacts.messengers.max.url, message);
  const maxOpensDirectChat = contacts.messengers.max.url.includes('/u/');

  const handleCopyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [message]);

  const handleCopyPhone = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contacts.phone);
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 2000);
    } catch {
      try {
        const tempInput = document.createElement("textarea");
        tempInput.value = contacts.phone;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
      } catch (e) {
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
      }
    }
  }, [contacts.phone]);

  const handleMaxClick = useCallback(async () => {
    if (maxOpensDirectChat) {
      await handleCopyMessage();
    }
  }, [maxOpensDirectChat, handleCopyMessage]);

  return (
    <motion.section
      {...sectionReveal}
      id="case-contacts"
      className="relative contact-section min-h-screen h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16 border-t border-neutral-800 bg-[#111111] overflow-hidden"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
      </div>

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-14 xl:gap-16 items-start">

          {/* ── Col LEFT: Step 1 ── */}
          <div className="flex flex-col min-w-0 order-1 lg:order-none">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#E0FB4A] mb-3">
              Шаг 1 · Выберите задачу
            </p>
            <div className="overflow-hidden mb-2">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-0 leading-tight"
              >
                {contacts.title}
              </motion.h2>
            </div>
            <p className="text-[14px] sm:text-[15px] text-neutral-450 leading-relaxed mb-6 max-w-md">
              {contacts.subtitle}
            </p>

            <div className="flex flex-wrap gap-2">
              {contacts.intents.map((intent) => {
                const isActive = intent.id === activeIntentId;
                return (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => setActiveIntentId(intent.id)}
                    className={`px-3.5 py-2 text-[13px] font-medium rounded-sm border transition-all duration-200 ${isActive
                        ? 'bg-[#E0FB4A] text-[#111111] border-[#E0FB4A] shadow-sm font-semibold'
                        : 'bg-transparent text-neutral-400 border-neutral-600 hover:border-neutral-750 hover:text-white'
                      }`}
                  >
                    {intent.label}
                  </button>
                );
              })}
            </div>

            {/* Trust checkmarks — desktop only */}
            <div className="hidden lg:block mt-14 w-full">
              <div className="border-t border-white/10 w-full" />
              <div className="pt-10">
                <ul className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-start sm:items-center gap-y-2 gap-x-6 lg:gap-x-8 mb-6 lg:w-[180%] lg:max-w-none relative z-0">
                  {contacts.trustPoints.map((point) => (
                    <li key={point} className="inline-flex items-center gap-2 text-[13px] text-neutral-450 whitespace-nowrap shrink-0">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Phone — desktop only */}
            <div className="hidden lg:flex mt-16 lg:mt-20 mb-6 flex-col items-start relative z-0">
              <button
                type="button"
                onClick={handleCopyPhone}
                className="text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-0 group/phone flex items-start"
              >
                <span className="text-[90px] xl:text-[100px] font-extralight tracking-tighter text-white group-hover/phone:text-[#E0FB4A] transition-colors duration-300 leading-none select-all whitespace-nowrap">
                  {contacts.phone}
                </span>
                <span className="ml-4 mt-2 shrink-0 text-neutral-500 group-hover/phone:text-white transition-colors duration-300">
                  {phoneCopied ? (
                    <Check className="w-8 h-8 text-[#E0FB4A]" />
                  ) : (
                    <Copy className="w-8 h-8" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* ── Col RIGHT: Step 2 card ── */}
          <div
            key={activeIntent.id}
            className="flex flex-col bg-[#282828] border border-neutral-600/60 rounded-sm p-5 sm:p-6 animate-fadeIn relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] order-2 lg:order-none mt-6 lg:mt-0"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">
              Шаг 2 · Отправьте сообщение
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-neutral-800 border border-neutral-750 px-2.5 py-1 rounded-sm">
                <Clock className="w-3.5 h-3.5" />
                {activeIntent.timeline}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-neutral-800 border border-neutral-750 px-2.5 py-1 rounded-sm">
                <Shield className="w-3.5 h-3.5" />
                {activeIntent.priceHint}
              </span>
            </div>

            <ul className="flex flex-col gap-2 mb-5">
              {activeIntent.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-[13px] text-neutral-350 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mb-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[12px] font-semibold text-neutral-450">Готовый текст сообщения</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-450 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-neutral-900 border border-neutral-850 rounded-sm px-4 py-3 text-[13px] text-neutral-300 leading-relaxed">
                {message}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 font-semibold py-3 px-5 rounded-sm transition-all duration-200 hover:-translate-y-[1px] text-sm border border-neutral-800"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{contacts.messengers.telegram.text}</span>
              </a>
              <a
                href={maxHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMaxClick}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 font-semibold py-3 px-5 rounded-sm transition-all duration-200 hover:-translate-y-[1px] text-sm border border-neutral-800"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{contacts.messengers.max.text}</span>
              </a>
            </div>

            {maxOpensDirectChat && (
              <p className="text-[11px] text-neutral-500 text-center mb-2">
                Текст сообщения скопируется автоматически — вставьте его в чат MAX
              </p>
            )}
          </div>

          {/* ── Mobile only: trust checkmarks ── */}
          <div className="lg:hidden order-3 w-full">
            <div className="border-t border-white/10 w-full" />
            <div className="pt-3">
              <ul className="flex flex-col gap-2">
                {contacts.trustPoints.map((point) => (
                  <li key={point} className="inline-flex items-center gap-2 text-[13px] text-neutral-450">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Mobile only: phone ── */}
          <div className="lg:hidden order-4 flex flex-col items-start pb-2 mt-8">
            <button
              type="button"
              onClick={handleCopyPhone}
              className="text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-0 group/phone flex items-center gap-3"
            >
              <span className="text-3xl sm:text-4xl font-extralight tracking-tighter text-white group-hover/phone:text-[#E0FB4A] transition-colors duration-300 leading-none select-all whitespace-nowrap">
                {contacts.phone}
              </span>
              <span className="shrink-0 text-neutral-500 group-hover/phone:text-white transition-colors duration-300">
                {phoneCopied ? (
                  <Check className="w-5 h-5 text-[#E0FB4A]" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </span>
            </button>
          </div>

        </div>
      </div>
    </motion.section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CASE SIDEBAR COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function CaseSidebar({ activeSection, sections = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, socialLinks } = contentData.sidebar;

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
      <motion.header
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="lg:hidden flex items-center justify-between px-6 py-4 sticky top-0 bg-white/85 backdrop-blur-md border-b\u00a0border-zinc-100 z-[200]"
      >
        <span className="text-sm font-medium text-zinc-900">{profile.name}</span>
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center border border-zinc-200/40 rounded-sm bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Открыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </motion.header>

      {/* ===== MOBILE NAV OVERLAY ===== */}
      <nav className={`lg:hidden fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-6 w-10 h-10 border border-zinc-200/40 rounded-sm bg-white flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm"
          aria-label="Закрыть меню"
        >
          <svg className="w-5 h-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-start gap-1 w-full px-8 my-auto">
          {/* На главную */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 py-2 w-full text-zinc-900 font-medium text-xl tracking-tight hover:text-black no-underline"
          >
            <span className="text-[10px] font-medium tracking-widest text-[#FF5B23] uppercase shrink-0 w-8 text-right">
              ←
            </span>
            <span>На главную</span>
          </Link>

          <div className="w-full border-t border-zinc-100 my-3" />

          {/* case sections */}
          {sections.map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                className="group flex items-center gap-3 py-2 w-full no-underline"
              >
                <span className="text-[10px] font-medium tracking-widest text-[#FF5B23] uppercase shrink-0 w-8 text-right">
                  {num}
                </span>
                <span className="text-xl font-medium text-zinc-900 hover:text-black tracking-tight transition-colors">
                  {item.label}
                </span>
              </a>
            );
          })}

          <div className="w-full border-t border-zinc-100 my-3" />

          {/* Обсудить проект */}
          <a
            href="#case-contacts"
            onClick={(e) => handleLinkClick(e, 'case-contacts')}
            className="group flex items-center gap-3 py-2 w-full text-zinc-900 font-medium text-xl tracking-tight hover:text-black no-underline"
          >
            <span className="text-[10px] font-medium tracking-widest text-[#FF5B23] uppercase shrink-0 w-8 text-right">
              ↓
            </span>
            <span>Обсудить проект</span>
          </a>
        </div>

        {/* Mobile footer links */}
        <div className="mt-auto mb-10 pt-6 border-t border-zinc-100 w-2/3 flex flex-col items-center gap-2.5 justify-center">
          <a
            href={socialLinks.max || "https://max.ru/u/f9LHodD0cOLc1tgODx5Hvuln4-rgmfFJqN4Q5OLgnaxmSTG2FxgU9ZVRnGg"}
            className="inline-flex items-center gap-1.5 group cursor-pointer text-[14px] font-normal text-zinc-900 whitespace-nowrap no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="border-b\u00a0border-zinc-900 pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
              Связь в MAX
            </span>
            <span className="text-[#FF5B23] font-medium transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
          <a
            href={socialLinks.telegram}
            className="inline-flex items-center gap-1.5 group cursor-pointer text-[14px] font-normal text-zinc-900 whitespace-nowrap no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="border-b\u00a0border-zinc-900 pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
              Связь в Telegram
            </span>
            <span className="text-[#FF5B23] font-medium transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </nav>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <motion.aside
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="sidebar-desktop hidden lg:flex fixed top-0 left-0 w-[260px] h-screen max-h-screen overflow-hidden flex-col border-r border-zinc-200 bg-white z-100 p-5 xl:p-6"
      >
        {/* Profile */}
        <div className="shrink-0 mb-5 xl:mb-6 sidebar-profile">
          <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-sm overflow-hidden mb-4 border border-zinc-200/30 bg-zinc-50">
            <img src={avatarImg(profile.avatarUrl)} alt={profile.altText} width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-base xl:text-lg font-medium text-black mb-0.5 leading-tight tracking-tight">{profile.name}</h2>
          <p className="text-[12px] xl:text-[13px] text-neutral-400 font-normal leading-snug sidebar-role">{profile.role}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 min-h-0 flex flex-col justify-start py-1">
          <ul className="flex flex-col gap-0 sidebar-nav pl-0 list-none m-0">
            {/* На главную */}
            <li>
              <Link
                to="/"
                className="block px-0 py-2 xl:py-2.5 text-[13px] xl:text-[14px] text-neutral-500 hover:text-black font-normal transition-colors duration-200 no-underline"
              >
                На главную
              </Link>
            </li>

            {/* Разделитель 1 */}
            <li className="my-2 border-t border-zinc-100" />

            {/* case sections */}
            {sections.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="relative flex items-center list-none">
                  <span
                    className={`absolute left-0 w-1.5 h-1.5 rounded-full bg-[#FF5B23] transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                      }`}
                  />
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block pl-4 py-2 xl:py-2.5 text-[13px] xl:text-[14px] transition-colors duration-200 no-underline ${isActive
                        ? 'text-black font-medium'
                        : 'text-neutral-500 hover:text-black font-normal'
                      }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}

            {/* Разделитель 2 */}
            <li className="my-2 border-t border-zinc-100" />

            {/* Обсудить проект */}
            <li>
              <a
                href="#case-contacts"
                onClick={(e) => handleLinkClick(e, 'case-contacts')}
                className="block px-0 py-2 xl:py-2.5 text-[13px] xl:text-[14px] text-neutral-500 hover:text-black font-normal transition-colors duration-200 no-underline"
              >
                Обсудить проект
              </a>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer — connections */}
        <div className="shrink-0 mt-auto border-t border-neutral-100/60 pt-4 sidebar-footer">
          <div className="flex flex-col gap-2.5">
            <a
              href={socialLinks.max || "https://max.ru/u/f9LHodD0cOLc1tgODx5Hvuln4-rgmfFJqN4Q5OLgnaxmSTG2FxgU9ZVRnGg"}
              className="inline-flex items-center gap-1.5 group cursor-pointer text-[13px] font-normal text-[#111111] whitespace-nowrap no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="border-b\u00a0border-[#111111] pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
                Связь в MAX
              </span>
              <span className="text-[#FF5B23] font-medium transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
            <a
              href={socialLinks.telegram}
              className="inline-flex items-center gap-1.5 group cursor-pointer text-[13px] font-normal text-[#111111] whitespace-nowrap no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="border-b\u00a0border-[#111111] pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
                Связь в Telegram
              </span>
              <span className="text-[#FF5B23] font-medium transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

const marqueeStyle = `
  @keyframes marquee-ltr {
    0% { transform: translate3d(-50%, 0, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }
  @keyframes marquee-rtl {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  .animate-marquee-ltr {
    animation: marquee-ltr 35s linear infinite;
  }
  .animate-marquee-rtl {
    animation: marquee-rtl 35s linear infinite;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
// CASE TEMPLATE — Главный компонент
// ══════════════════════════════════════════════════════════════════════════════
export default function CaseTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [casesList, setCasesList] = useState([]);
  const [activeSection, setActiveSection] = useState('case-about');

  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);

  // Fetch case detail from Supabase dynamically
  useEffect(() => {
    const fetchCaseData = async () => {
      setLoading(true);
      try {
        // First try by slug
        const { data: fetchedData, error } = await supabase
          .from('cases')
          .select('*')
          .eq('slug', id)
          .maybeSingle();

        if (error) throw error;

        if (fetchedData) {
          setData(fetchedData);
        } else {
          // Fallback by ID if slug not found
          const { data: fallbackData, error: fbError } = await supabase
            .from('cases')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (fbError) throw fbError;
          if (fallbackData) {
            setData(fallbackData);
          } else {
            setData(null);
          }
        }
      } catch (err) {
        console.error('Error fetching case detail:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseData();
  }, [id]);

  // Fetch cases list for navigation
  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        const { data: list, error } = await supabase
          .from('cases')
          .select('slug, title, card_title')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setCasesList(list || []);
      } catch (err) {
        console.error('Error fetching cases list for navigation:', err);
      }
    };
    fetchAllCases();
  }, []);

  const scrollDesktop = (direction) => {
    const container = desktopScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollMobile = (direction) => {
    const container = mobileScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top when entering case page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track active section on scroll
  useEffect(() => {
    // ── rAF + ticking guard ────────────────────────────────────────────────────
    // offsetTop / offsetHeight — layout-свойства. Если раньше браузер рендерил
    // какой-либо DOM, их чтение заставляет браузер немедленно
    // пересчитать layout (Forced Reflow). Внутри rAF layout уже актуален.
    let ticking = false;

    const computeActiveSection = () => {
      const scrollPosition = window.scrollY;
      const sections = ['case-about', 'case-process', 'case-challenge', 'case-showcase', 'case-mobile-showcase', 'case-outro', 'case-custom'];

      let currentSection = 'case-about';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 240;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(computeActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    computeActiveSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id, data]);

  // Determine next case for navigation
  const currentIndex = casesList.findIndex(c => c.slug === id);
  let nextCase = null;
  if (currentIndex !== -1 && casesList.length > 0) {
    nextCase = casesList[(currentIndex + 1) % casesList.length];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-zinc-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5B23]" />
          <span className="text-xs font-semibold tracking-wider uppercase">Загрузка проекта...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900 font-sans p-6 text-center">
        <h1 className="text-4xl font-light tracking-tight text-black mb-4">Проект не найден</h1>
        <p className="text-sm text-zinc-500 mb-8 max-w-sm">Кейс с адресом "{id}" не существует в базе данных или был удален.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную</span>
        </Link>
      </div>
    );
  }

  const outroImages = data.outro?.images || (data.outro?.image ? [data.outro.image] : []);

  const caseSections = [
    data.about?.text && { id: 'case-about', label: 'О\u00a0проекте' },
    (data.visibility?.process !== false && data.process?.length > 0) && { id: 'case-process', label: 'Процесс' },
    (data.visibility?.challenge !== false && (data.challenge?.task || data.challenge?.solution)) && { id: 'case-challenge', label: 'Задача' },
    (data.visibility?.desktop !== false && data.features?.length > 0) && { id: 'case-showcase', label: 'Десктоп' },
    (data.visibility?.mobile !== false && data.mobile_features?.length > 0) && { id: 'case-mobile-showcase', label: 'Мобильные' },
    (data.visibility?.outro !== false && outroImages.length > 0) && { id: 'case-outro', label: 'Результат' },
    (data.visibility?.custom !== false && data.custom_blocks?.length > 0) && { id: 'case-custom', label: 'Инфо' }
  ].filter(Boolean);

  const metaItems = [
    { label: "Сфера", value: data.meta?.sphere },
    { label: "Тип проекта", value: data.meta?.type },
    { label: "Стек", value: data.meta?.stack },
    { label: "Год", value: data.meta?.year }
  ].filter(item => item.value && item.value.trim() !== '');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
      {/* Fixed Sidebar on Left */}
      <CaseSidebar activeSection={activeSection} sections={caseSections} />

      {/* Scrollable Content on Right with Blur Reveal animation */}
      <motion.main
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
      >
        <div className="relative z-10 flex flex-col w-full">

          {/* ══════════════════════════════════════════════════════════
          Блок 1: Главный экран (Hero)
          ══════════════════════════════════════════════════════════ */}
          <motion.section
            {...sectionReveal}
            className="relative bg-white"
          >
            {/* Back navigation button — fixed top-left */}
            <div className="absolute top-6 left-6 md:left-12 z-20">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer no-underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад на главную</span>
              </Link>
            </div>

            <div className="pt-24 pb-12 px-6 md:px-12 lg:px-16">
              {/* Subtitle label */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF5B23] mb-5">
                [ Кейс ]
              </p>

              {/* Main title */}
              <div className="overflow-hidden mb-4">
                <motion.h1
                  initial={{ y: "100%", opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tighter text-black leading-[1.1]"
                >
                  {data.title || data.card_title}
                </motion.h1>
              </div>

              {/* Subtitle */}
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-zinc-500 font-light max-w-2xl mb-0"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>

            {/* Hero image placeholder or real image — full width */}
            {data.heroImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1.000], delay: 0.15 }}
                className="w-full px-6 md:px-12 lg:px-16 pb-12"
              >
                {/* aspect-ratio задан через padding-trick контейнера, явный width/height предотвращает CLS */}
                <div className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-neutral-100 shadow-sm">
                  <img
                    src={caseHeroImg(data.heroImage)}
                    alt={data.title || data.card_title}
                    loading="eager"
                    decoding="async"
                    width={1400}
                    height={787}
                    className="w-full h-auto object-cover max-h-[85vh]"
                  />
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* ══════════════════════════════════════════════════════════
          Блок 2: Мета-данные и краткое описание
          ══════════════════════════════════════════════════════════ */}
          {metaItems.length > 0 && (
            <motion.section
              {...sectionReveal}
              className="border-t border-b\u00a0border-neutral-200/60 bg-white"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-200/60">
                {metaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-6 md:px-12 lg:px-16 py-8 bg-white"
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                      {item.label}
                    </span>
                    <span className="block text-[14px] md:text-[15px] font-medium text-black tracking-tight">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {data.about?.text && (
            <motion.section
              {...sectionReveal}
              id="case-about"
              className="py-16 px-6 md:px-12 lg:px-16 bg-white"
            >
              <div className="max-w-4xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-5">
                  Описание проекта
                </p>
                <p className="text-base md:text-lg text-neutral-700 font-light leading-relaxed tracking-tight">
                  {data.about.text}
                </p>
              </div>
            </motion.section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 3: Процесс работы (Design Process)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.process !== false && Array.isArray(data.process) && data.process.length > 0 && (
            <section id="case-process" className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white border-t border-neutral-100">
              <div className="mb-12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Дизайн-процесс
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Этапы реализации
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.process.map((step, idx) => {
                  const stepNumber = String(idx + 1).padStart(2, '0');
                  const tags = Array.isArray(step.tags) ? step.tags : [];
                  
                  const icons = [
                    <Clock className="w-5 h-5 text-[#FF5B23]" />,
                    <Shield className="w-5 h-5 text-[#FF5B23]" />,
                    <Check className="w-5 h-5 text-[#FF5B23]" />
                  ];
                  const icon = icons[idx % 3];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.15 }}
                      className="bg-neutral-50/30 border border-neutral-200/60 rounded-sm p-6 flex flex-col justify-between hover:border-neutral-300 transition-colors duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                            {icon}
                          </div>
                          <span className="text-[11px] font-bold text-neutral-300 tracking-wider">
                            {stepNumber}
                          </span>
                        </div>

                        <h3 className="text-lg md:text-xl font-medium text-black mb-3">
                          {step.title}
                        </h3>

                        {step.duration && (
                          <span className="inline-block text-[10px] text-[#FF5B23] font-semibold uppercase tracking-wider mb-2">
                            Срок: {step.duration}
                          </span>
                        )}

                        <p className="text-[13px] leading-relaxed text-neutral-500 mb-6">
                          {step.desc || step.text}
                        </p>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 4: Бесконечный панорамный шоукейс
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.panorama !== false && Array.isArray(data.panorama_images) && data.panorama_images.length > 0 && (
            <section id="case-marquee-showcase" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-b\u00a0border-neutral-100 overflow-hidden relative">
              <style>{marqueeStyle}</style>

              <div className="px-6 md:px-12 lg:px-16 mb-12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Шоукейс интерфейсов
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Панорамный обзор
                </h2>
              </div>

              <div className="flex flex-col gap-6 w-full overflow-hidden">
                {/* Row 1: Left to Right */}
                <div className="relative w-full flex overflow-hidden">
                  <div className="flex gap-6 w-max animate-marquee-ltr">
                    {data.panorama_images.map((imgUrl, idx) => (
                      <div key={`ltr-1-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                        <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {/* Duplicate for infinite effect */}
                    {data.panorama_images.map((imgUrl, idx) => (
                      <div key={`ltr-2-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                        <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2: Right to Left */}
                {data.panorama_images.length > 1 && (
                  <div className="relative w-full flex overflow-hidden">
                    <div className="flex gap-6 w-max animate-marquee-rtl">
                      {[...data.panorama_images].reverse().map((imgUrl, idx) => (
                        <div key={`rtl-1-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                          <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {[...data.panorama_images].reverse().map((imgUrl, idx) => (
                        <div key={`rtl-2-${idx}`} className="w-[300px] md:w-[450px] aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden shrink-0">
                          <img src={panoramaImg(imgUrl)} alt={`Панорама ${idx + 1}`} loading="lazy" decoding="async" width={900} height={506} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 5: Задача и Решение (The Challenge)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.challenge !== false && (data.challenge?.task || data.challenge?.solution) && (
            <section id="case-challenge" className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white border-b\u00a0border-neutral-100">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF5B23] mb-4">
                    [ Испытание ]
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black leading-tight">
                    Задача & Решение
                  </h2>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div className="text-base md:text-lg text-neutral-600 font-light leading-relaxed tracking-tight mb-8">
                    {data.challenge.task && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Задача</h4>
                        <p>{data.challenge.task}</p>
                      </div>
                    )}
                    {data.challenge.solution && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Решение</h4>
                        <p>{data.challenge.solution}</p>
                      </div>
                    )}
                  </div>

                  {data.challenge.liveUrl && data.challenge.liveUrl !== "" && data.challenge.liveUrl !== "#" && (
                    <div>
                      <a
                        href={data.challenge.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5B23] text-white hover:bg-[#e04f1e] rounded-sm text-[13px] font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md no-underline"
                      >
                        <span>Смотреть live</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 6: Ключевые десктопные экраны (Desktop Horizontal Scroll)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.desktop !== false && Array.isArray(data.features) && data.features.length > 0 && (
            <section id="case-showcase" className="py-20 md:py-28 bg-white border-b\u00a0border-neutral-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:items-end px-6 md:px-12 lg:px-16 mb-6 md:mb-10 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Ключевые экраны
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                    Решения в деталях
                  </h2>
                </div>
                {/* Navigation controls */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => scrollDesktop('left')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollDesktop('right')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Horizontal Scroll */}
              <div
                ref={desktopScrollRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pb-6 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 scroll-pr-6 md:scroll-pr-12 lg:scroll-pr-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {data.features.map((feature, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="w-px self-stretch bg-neutral-200 my-4 shrink-0" />}
                    <div
                      className="w-[85vw] md:w-[45%] lg:w-[44%] shrink-0 snap-start"
                    >
                      {/* Text */}
                      <div className="mb-5">
                        <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-2 block">
                          [ 0{idx + 1} ]
                        </span>
                        <h3 className="text-xl md:text-2xl font-light tracking-tight text-black mb-3 leading-tight">
                          {feature.title}
                        </h3>
                        {feature.text && (
                          <p className="text-[14px] md:text-[15px] leading-relaxed text-zinc-600">
                            {feature.text}
                          </p>
                        )}
                      </div>

                      {/* Image */}
                      <div className="w-full aspect-[16/9] bg-neutral-100 border border-neutral-200/60 rounded-sm overflow-hidden flex items-center justify-center">
                        {feature.image ? (
                          <img src={featureImg(feature.image)} alt={feature.title} loading="lazy" decoding="async" width={800} height={450} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neutral-400 text-[10px] font-semibold tracking-widest uppercase">
                            Десктопный скриншот 0{idx + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок 7: Мобильная версия (Mobile Responsive Carousel)
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.mobile !== false && Array.isArray(data.mobile_features) && data.mobile_features.length > 0 && (
            <section id="case-mobile-showcase" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-b\u00a0border-neutral-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:items-end px-6 md:px-12 lg:px-16 mb-6 md:mb-10 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Адаптивность
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                    Мобильная версия
                  </h2>
                </div>
                {/* Navigation controls */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => scrollMobile('left')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollMobile('right')}
                    className="w-10 h-10 rounded-sm border border-neutral-200 hover:border-neutral-400 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-white shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Horizontal Carousel */}
              <div
                ref={mobileScrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pb-6 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 scroll-pr-6 md:scroll-pr-12 lg:scroll-pr-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {data.mobile_features.map((screen, idx) => (
                  <div
                    key={idx}
                    className="w-[60vw] sm:w-[40vw] md:w-[25vw] lg:w-[18vw] shrink-0 snap-start"
                  >
                    {/* Text */}
                    <div className="mb-4">
                      {screen.label && (
                        <span className="text-[9px] font-semibold text-[#FF5B23] tracking-widest uppercase block mb-1">
                          [ {screen.label} ]
                        </span>
                      )}
                      <h3 className="text-sm font-medium text-black leading-tight">
                        {screen.title}
                      </h3>
                    </div>

                    {/* Smartphone Aspect Ratio */}
                    <div className="w-full aspect-[9/19] bg-neutral-100 border border-zinc-300 rounded-md overflow-hidden flex items-center justify-center relative">
                      {screen.image ? (
                        <img src={mobileFeatureImg(screen.image)} alt={screen.title} loading="lazy" decoding="async" width={400} height={844} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col justify-between p-4 text-neutral-400 text-[9px] font-medium tracking-widest uppercase absolute inset-0">
                          <div className="flex justify-between items-center w-full">
                            <span>Экран 0{idx + 1}</span>
                            <div className="w-4 h-1.5 rounded-full bg-neutral-200/70" />
                          </div>

                          <span className="self-center">9:19 PLACEHOLDER</span>

                          <div className="w-8 h-8 rounded-full border border-neutral-200/70 self-center flex items-center justify-center text-[8px] select-none">
                            ○
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок Outro: Финальное изображение / Сетка
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.outro !== false && outroImages.length > 0 && (
            <motion.section
              {...sectionReveal}
              id="case-outro"
              className="py-16 px-6 md:px-12 lg:px-16 bg-white border-t border-neutral-100"
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Результат
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
                  Финальный шоукейс
                </h2>
              </div>

              <div className={`grid grid-cols-1 ${outroImages.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                {outroImages.map((imgUrl, idx) => (
                  <div key={idx} className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-zinc-50 shadow-sm" style={{ aspectRatio: '16/9' }}>
                    <img src={outroImg(imgUrl)} alt={`Outro ${idx + 1}`} loading="lazy" decoding="async" width={1000} height={562} className="w-full h-auto object-cover" />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ══════════════════════════════════════════════════════════
          Блок Custom Blocks: Кастомные блоки контента
          ══════════════════════════════════════════════════════════ */}
          {data.visibility?.custom !== false && Array.isArray(data.custom_blocks) && data.custom_blocks.length > 0 && (
            <section id="case-custom" className="py-16 px-6 md:px-12 lg:px-16 bg-white border-t border-neutral-100">
              <div className="space-y-12">
                {data.custom_blocks.map((block, idx) => (
                  <div key={idx} className="w-full">
                    {block.type === 'text' ? (
                      <div className="max-w-4xl">
                        <p className="text-base md:text-lg text-neutral-700 font-light leading-relaxed tracking-tight whitespace-pre-line">
                          {block.content}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full border border-neutral-200/60 rounded-sm overflow-hidden bg-zinc-50">
                        <img src={customBlockImg(block.content)} alt={`Кастомный блок ${idx + 1}`} loading="lazy" decoding="async" width={1000} height={562} className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
          9. НАВИГАЦИЯ — возврат + следующий кейс
          ══════════════════════════════════════════════════════════ */}
          <section className="bg-white border-t border-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Back to home */}
              <Link
                to="/"
                className="group flex items-center gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 border-b\u00a0md:border-b-0 md:border-r border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 transition-colors duration-300 no-underline"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300 shrink-0" />
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                    Назад
                  </span>
                  <span className="block text-lg md:text-xl font-light tracking-tight text-zinc-900">
                    На главную
                  </span>
                </div>
              </Link>

              {/* Next case */}
              {nextCase ? (
                <Link
                  to={`/case/${nextCase.slug}`}
                  className="group flex items-center justify-end gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 bg-zinc-50/50 hover:bg-zinc-100/60 transition-colors duration-300 text-right no-underline"
                >
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                      Следующий кейс
                    </span>
                    <span className="block text-lg md:text-xl font-light tracking-tight text-zinc-900">
                      {nextCase.title || nextCase.card_title || 'Следующий проект'}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-[#FF5B23] transition-colors duration-300 shrink-0" />
                </Link>
              ) : (
                <div className="px-6 md:px-12 lg:px-16 py-10 md:py-14 bg-zinc-50/50 text-right flex items-center justify-end text-zinc-350 select-none">
                  <span>Конец галереи</span>
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
          8. БЛОК «ОБСУДИТЬ ПРОЕКТ» — полная копия с главной
          ══════════════════════════════════════════════════════════ */}
          <CaseContacts />

          {/* ══════════════════════════════════════════════════════════
          БЕГУЩАЯ СТРОКА
          ══════════════════════════════════════════════════════════ */}
          <KineticMarquee />

        </div>
      </motion.main>
    </div>
  );
}
