import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, MessageCircle, Check, Copy, Clock, Shield } from 'lucide-react';
import mockCaseData from '../utils/mockCaseData';
import contentData from '../contentData';
import KineticMarquee from './ui/KineticMarquee';

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
                    className={`px-3.5 py-2 text-[13px] font-medium rounded-sm border transition-all duration-200 ${
                      isActive
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
            <div className="hidden lg:flex mt-24 lg:mt-32 mb-6 flex-col items-start relative z-0">
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
            className="flex flex-col bg-[#282828] border border-neutral-600/60 rounded-md p-5 sm:p-6 animate-fadeIn relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] order-2 lg:order-none mt-6 lg:mt-0"
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
function CaseSidebar({ activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, socialLinks } = contentData.sidebar;

  const caseSections = [
    { id: 'case-about', label: 'О проекте' },
    { id: 'case-ux', label: 'Логика (UX)' },
    { id: 'case-ui', label: 'Концепция (UI)' },
    { id: 'case-showcase', label: 'Ключевые экраны' }
  ];

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
        className="lg:hidden flex items-center justify-between px-6 py-4 sticky top-0 bg-white/85 backdrop-blur-md border-b border-zinc-100 z-[200]"
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

          {/* 4 case sections */}
          {caseSections.map((item, idx) => {
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

        {/* Mobile footer telegram link */}
        <div className="mt-auto mb-10 pt-6 border-t border-zinc-100 w-2/3 flex justify-center">
          <a
            href={socialLinks.telegram}
            className="inline-flex items-center gap-1.5 group cursor-pointer text-[14px] font-normal text-zinc-900 whitespace-nowrap no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="border-b border-zinc-900 pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
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
          <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-md overflow-hidden mb-4 border border-zinc-200/30 bg-zinc-50">
            <img src={profile.avatarUrl} alt={profile.altText} className="w-full h-full object-cover" />
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
                className="block px-0 py-2 xl:py-2.5 text-[13px] xl:text-[14px] text-neutral-450 hover:text-black font-normal transition-colors duration-200 no-underline"
              >
                На главную
              </Link>
            </li>

            {/* Разделитель 1 */}
            <li className="my-2 border-t border-zinc-100" />

            {/* 4 case sections */}
            {caseSections.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="relative flex items-center list-none">
                  <span
                    className={`absolute left-0 w-1.5 h-1.5 rounded-full bg-[#FF5B23] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                    }`}
                  />
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block pl-4 py-2 xl:py-2.5 text-[13px] xl:text-[14px] transition-colors duration-200 no-underline ${
                      isActive
                        ? 'text-black font-medium'
                        : 'text-neutral-450 hover:text-black font-normal'
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
                className="block px-0 py-2 xl:py-2.5 text-[13px] xl:text-[14px] text-neutral-450 hover:text-black font-normal transition-colors duration-200 no-underline"
              >
                Обсудить проект
              </a>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer — telegram connection */}
        <div className="shrink-0 mt-auto border-t border-neutral-100/60 pt-4 sidebar-footer">
          <a
            href={socialLinks.telegram}
            className="inline-flex items-center gap-1.5 group cursor-pointer text-[13px] font-normal text-[#111111] whitespace-nowrap no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="border-b border-[#111111] pb-0.5 group-hover:border-[#FF5B23] transition-colors duration-300">
              Связь в Telegram
            </span>
            <span className="text-[#FF5B23] font-medium transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </motion.aside>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CASE TEMPLATE — Главный компонент
// ══════════════════════════════════════════════════════════════════════════════
export default function CaseTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = mockCaseData; // В будущем: загрузка по id из API/админки
  const [activeSection, setActiveSection] = useState('case-about');

  // Scroll to top when entering case page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = ['case-about', 'case-ux', 'case-ui', 'case-showcase'];

      let currentSection = 'case-about';
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
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  // Determine next case id for navigation
  const cases = contentData.cases.items;
  const currentIndex = parseInt(id, 10) - 1;
  const nextIndex = (currentIndex + 1) % cases.length;
  const nextCaseId = nextIndex + 1;
  const nextCaseName = cases[nextIndex]?.name || "Следующий кейс";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
      {/* Fixed Sidebar on Left */}
      <CaseSidebar activeSection={activeSection} />

      {/* Scrollable Content on Right with Blur Reveal animation */}
      <motion.main
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.99 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
      >
        <div className="relative z-10 flex flex-col w-full">

      {/* ══════════════════════════════════════════════════════════
          1. HERO — крупный заголовок + полноэкранное изображение
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        className="relative bg-white"
      >
        {/* Back navigation button — fixed top-left */}
        <div className="absolute top-6 left-6 md:left-12 z-20">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>
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
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-tighter text-black leading-[0.92]"
            >
              {data.title}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-500 font-light max-w-2xl mb-0"
          >
            {data.subtitle}
          </motion.p>
        </div>

        {/* Hero image — full width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1.000], delay: 0.15 }}
          className="w-full px-6 md:px-12 lg:px-16 pb-12"
        >
          <div className="w-full overflow-hidden rounded-sm">
            <img
              src={data.heroImage}
              alt={data.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          2. META PANEL — 4 плашки
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        className="border-t border-b border-zinc-100 bg-white"
      >
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: "Сфера", value: data.meta.sphere },
            { label: "Тип проекта", value: data.meta.type },
            { label: "Стек", value: data.meta.stack },
            { label: "Год", value: data.meta.year }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`px-6 md:px-12 lg:px-16 py-8 ${
                idx < 3 ? 'border-r border-zinc-100' : ''
              } ${idx < 2 ? 'border-b md:border-b-0 border-zinc-100' : idx === 2 ? 'border-b md:border-b-0 border-zinc-100' : ''}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                {item.label}
              </span>
              <span className="block text-[15px] font-medium text-zinc-900 tracking-tight">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          3. О ПРОЕКТЕ
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        id="case-about"
        className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white"
      >
        <div className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">
            {data.about.title}
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-zinc-700 tracking-tight">
            {data.about.text}
          </p>
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          4. UX (Смыслы) — текст + скриншот прототипа
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        id="case-ux"
        className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-white border-t border-zinc-100"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#E0FB4A] bg-zinc-900 inline-block px-3 py-1.5 rounded-sm mb-6">
              UX · Смыслы
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black mb-6 leading-tight">
              {data.ux.title}
            </h2>
            <p className="text-[15px] md:text-[16px] leading-relaxed text-zinc-600 max-w-lg">
              {data.ux.text}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
          >
            <img
              src={data.ux.image}
              alt={data.ux.title}
              className="w-full h-auto rounded-sm shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
            />
          </motion.div>
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          5. UI (Визуальная концепция) — приглушённый фон
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        id="case-ui"
        className="py-20 md:py-28 px-6 md:px-12 lg:px-16 bg-[#FAFAFA] border-t border-zinc-100"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="order-2 lg:order-1"
          >
            <img
              src={data.ui.image}
              alt={data.ui.title}
              className="w-full h-auto rounded-sm shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-zinc-100"
            />
          </motion.div>
          <div className="order-1 lg:order-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 bg-[#E0FB4A] inline-block px-3 py-1.5 rounded-sm mb-6">
              UI · Визуал
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black mb-6 leading-tight">
              {data.ui.title}
            </h2>
            <p className="text-[15px] md:text-[16px] leading-relaxed text-zinc-600 max-w-lg">
              {data.ui.text}
            </p>
          </div>
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          6. SHOWCASE — шахматная верстка ключевых фич
          ══════════════════════════════════════════════════════════ */}
      <section id="case-showcase" className="py-20 md:py-28 bg-white border-t border-zinc-100">
        <div className="px-6 md:px-12 lg:px-16 mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Ключевые экраны
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">
            Решения в деталях
          </h2>
        </div>

        <div className="flex flex-col gap-20 md:gap-28">
          {data.features.map((feature, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-6 md:px-12 lg:px-16 ${
                  isEven ? '' : 'lg:direction-rtl'
                }`}
              >
                {/* Text */}
                <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-3 block">
                    [ 0{idx + 1} ]
                  </span>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-black mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-zinc-600 max-w-md">
                    {feature.text}
                  </p>
                </div>

                {/* Image with floating shadow */}
                <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <motion.img
                    src={feature.image}
                    alt={feature.title}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-auto rounded-sm case-feature-shadow"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
          7. OUTRO — полноэкранный финальный рендер
          ══════════════════════════════════════════════════════════ */}
      <motion.section
        {...sectionReveal}
        className="bg-[#FAFAFA] border-t border-zinc-100"
      >
        <div className="px-6 md:px-12 lg:px-16 py-16 md:py-24">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Финальный результат
          </p>
        </div>
        <div className="w-full px-6 md:px-12 lg:px-16 pb-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="w-full overflow-hidden rounded-t-md"
          >
            <img
              src={data.outro.image}
              alt="Финальный рендер проекта"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════════════════════
          9. НАВИГАЦИЯ — возврат + следующий кейс
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-zinc-100/50">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Back to home */}
          <Link
            to="/"
            className="group flex items-center gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 border-b md:border-b-0 md:border-r border-zinc-100 transition-colors duration-300 hover:bg-zinc-50 no-underline"
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
          <Link
            to={`/case/${nextCaseId}`}
            className="group flex items-center justify-end gap-4 px-6 md:px-12 lg:px-16 py-10 md:py-14 transition-colors duration-300 hover:bg-zinc-50 text-right no-underline"
          >
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                Следующий кейс
              </span>
              <span className="block text-lg md:text-xl font-light tracking-tight text-zinc-900">
                {nextCaseName}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-[#FF5B23] transition-colors duration-300 shrink-0" />
          </Link>
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
