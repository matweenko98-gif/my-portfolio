import React, { useState, useMemo, useCallback } from 'react';
import { Send, MessageCircle, Calculator, Check, Copy, Clock, Shield } from 'lucide-react';
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

  const handleMaxClick = useCallback(async () => {
    if (maxOpensDirectChat) {
      await handleCopyMessage();
    }
  }, [maxOpensDirectChat, handleCopyMessage]);

  const openCalculator = () => {
    if (!activeIntent.calculatorServiceId) return;
    window.dispatchEvent(
      new CustomEvent('open-calculator', { detail: { serviceNumber: activeIntent.calculatorServiceId } })
    );
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="contacts"
      className="contact-section min-h-screen h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16 border-t border-zinc-100 bg-white overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-16 items-center">
        {/* Left: choice */}
        <div className="flex flex-col min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Шаг 1 · Выберите задачу
          </p>
          <h2 className="text-2xl sm:text-3xl xl:text-[2rem] font-bold tracking-tight text-zinc-900 mb-2 leading-tight">
            {contacts.title}
          </h2>
          <p className="text-[14px] sm:text-[15px] text-zinc-500 leading-relaxed mb-6 max-w-md">
            {contacts.subtitle}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {contacts.intents.map((intent) => {
              const isActive = intent.id === activeIntentId;
              return (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => setActiveIntentId(intent.id)}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {intent.label}
                </button>
              );
            })}
          </div>

          <ul className="flex flex-col gap-2.5 mb-6">
            {contacts.trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-[13px] text-zinc-500">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: result card */}
        <div
          key={activeIntent.id}
          className="flex flex-col bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-200/70 rounded-2xl p-5 sm:p-6 shadow-sm animate-fadeIn"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Шаг 2 · Отправьте сообщение
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              {activeIntent.timeline}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
              {activeIntent.priceHint}
            </span>
          </div>

          <ul className="flex flex-col gap-2 mb-5">
            {activeIntent.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-[13px] text-zinc-600 leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mb-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-semibold text-zinc-500">Готовый текст сообщения</span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
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
            <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[13px] text-zinc-700 leading-relaxed">
              {message}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-3 px-5 rounded-xl hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[1px] text-sm"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{contacts.messengers.telegram.text}</span>
            </a>
            <a
              href={maxHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMaxClick}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5B4FE8] text-white font-semibold py-3 px-5 rounded-xl hover:bg-[#4a3fd6] transition-all duration-200 hover:-translate-y-[1px] text-sm"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>{contacts.messengers.max.text}</span>
            </a>
          </div>

          {maxOpensDirectChat && (
            <p className="text-[11px] text-zinc-400 text-center mb-2">
              Текст сообщения скопируется автоматически — вставьте его в чат MAX
            </p>
          )}

          {activeIntent.calculatorServiceId && (
            <button
              type="button"
              onClick={openCalculator}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Сначала рассчитать стоимость</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
