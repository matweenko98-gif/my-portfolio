import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Check, Copy, Clock, Shield } from 'lucide-react';
import contentData from '../contentData';

function buildMessage(topic) {
  return `Здравствуйте! Меня интересует ${topic}. Хочу обсудить проект.`;
}

function buildTelegramHref(baseUrl, message) {
  const url = baseUrl.replace(/\/$/, '');
  return `${url}?text=${encodeURIComponent(message)}`;
}

function buildMaxHref(baseUrl, message) {
  if (baseUrl.includes('/u/')) {
    return baseUrl;
  }
  return `https://max.ru/:share?text=${encodeURIComponent(message)}`;
}

export default function Contacts() {
  const { contacts } = contentData;
  const [activeIntentId, setActiveIntentId] = useState(contacts.intents[0].id);
  const [copied, setCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const activeIntent = useMemo(
    () => contacts.intents.find((item) => item.id === activeIntentId) ?? contacts.intents[0],
    [activeIntentId, contacts.intents]
  );

  const message = useMemo(
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
      id="contacts"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
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
        {/*
          Mobile layout (grid-cols-1):
            order-1 → Step 1 (heading + task buttons)
            order-2 → Step 2 card
            order-3 → trust checkmarks
            order-4 → phone number

          Desktop layout (lg:grid-cols-2):
            Left col  → Step 1 + trust + phone (all inside one column naturally)
            Right col → Step 2 card
        */}
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

            {/* Trust checkmarks — desktop only (shown on mobile as order-3 sibling below) */}
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

            {/* Phone — desktop only (shown on mobile as order-4 sibling below) */}
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

          {/* ── Col RIGHT: Step 2 card — mobile order-2 ── */}
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

          {/* ── Mobile only: trust checkmarks — order-3 ── */}
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

          {/* ── Mobile only: phone — order-4 ── */}
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
