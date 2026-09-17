import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Layers, Code, RefreshCw, Send, X, Layout, Files, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import contentData from '../contentData';
import ProjectCart from './ProjectCart';
import { flyChipToCart } from '../utils/flyToCart';

const TILDA_CART_ICON_KEYS = {
  siteType: 'layout',
  pagesCount: 'files',
  contentReady: 'fileText',
};

// Отправка сообщения в Telegram через переменные окружения Vite
const sendTelegramMessage = async (messageText) => {
  try {
    const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      console.warn('Telegram Bot token or chat id is not configured. Skipping send.');
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });
    const data = await response.json();
    return response.ok && data?.ok;
  } catch (e) {
    console.error('Failed to send Telegram message:', e);
    return false;
  }
};

// Валидация контакта: телефон или Telegram-username
const isValidContact = (val) => {
  if (!val) return false;
  const s = val.trim();
  const phone = /^\+?[0-9\s\-()]{7,15}$/;
  const tg = /^@?[A-Za-z0-9_]{5,32}$/;
  return phone.test(s) || tg.test(s);
};

const Figma = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/>
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
  </svg>
);

const ICON_MAP = {
  '01': Layers,
  '02': RefreshCw,
  '03': Code,
  '04': Figma,
};

const getDaysWord = (n) => {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 19) {
    return 'рабочих дней';
  }
  if (rem10 === 1) {
    return 'рабочий день';
  }
  if (rem10 >= 2 && rem10 <= 4) {
    return 'рабочих дня';
  }
  return 'рабочих дней';
};

const formatPrice = (price) => {
  return price.toLocaleString('ru-RU');
};


const SegmentedControl = ({ label, options, val, setVal }) => (
  <div className="flex flex-col gap-2">
    <span className="text-white text-[10px] font-medium tracking-wider uppercase">{label}</span>
    <div
      className="grid gap-1.5 p-1 bg-neutral-900/50 rounded-sm border border-neutral-850"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setVal(opt.value)}
          className={`text-center py-2 px-1 sm:px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all ${
            val === opt.value
              ? 'bg-white text-black shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          style={{ borderWidth: '0.4px', borderColor: val === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

function getOptionButtonClass(isSelected, isFirstHint) {
  if (isSelected) {
    return 'bg-white text-black shadow-sm border border-transparent';
  }
  return 'text-neutral-400 border border-neutral-850 bg-transparent hover:border-neutral-750 hover:bg-neutral-800 hover:text-white';
}

function TildaTariffs({ service }) {
  const products = [
    {
      title: 'Лендинг',
      price: 'от\u00a030 000 ₽',
      desc: 'Одностраничный сайт с\u00a0уникальным дизайном в\u00a0Zero Block для\u00a0продажи услуги или\u00a0товара с\u00a0высоким фокусом на\u00a0конверсию.',
      features: [
        'Индивидуальный дизайн в\u00a0Figma',
        'Верстка на\u00a0Tilda в\u00a0Zero-блоках',
        'Полная адаптация под\u00a0смартфоны',
        'Базовая SEO-оптимизация и\u00a0формы'
      ]
    },
    {
      title: 'Корпоративный сайт',
      price: 'от\u00a045 000 ₽',
      desc: 'Многостраничный сайт компании с\u00a0детальным представлением услуг, информацией о\u00a0бренде и\u00a0контактами.',
      features: [
        'Разработка структуры до\u00a05-10 страниц',
        'Уникальный визуальный стиль',
        'Интеграция CRM и\u00a0Telegram-уведомлений',
        'Удобное самостоятельное управление'
      ]
    },
    {
      title: 'Интернет-магазин',
      price: 'от\u00a045 000 ₽',
      desc: 'Полноценный онлайн-магазин с\u00a0каталогом товаров, корзиной, приемом платежей и\u00a0удобными фильтрами.',
      features: [
        'Каталог товаров и\u00a0категорий',
        'Корзина и\u00a0подключение эквайринга',
        'Настройка вариантов и\u00a0фильтров',
        'Обучение работе с\u00a0каталогом Tilda'
      ]
    }
  ];

  return (
    <div className="bg-[#1E1E1E] border border-neutral-850 rounded-sm p-5 sm:p-6 flex flex-col gap-6 w-full">
      <div id="tariffs-heading-01" className="text-sm font-semibold text-white border-b border-neutral-850 pb-3 flex justify-between items-center flex-wrap gap-2 scroll-mt-24">
        <span>Тарифы на разработку сайтов на Tilda</span>
        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded-sm">
          Сроки: от 7 рабочих дней
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-[#1A1A1A] border border-neutral-850 rounded-sm p-5 flex flex-col justify-between hover:shadow-sm hover:border-neutral-750 transition-all duration-300">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{p.title}</h4>
              <span className="inline-block text-xs sm:text-sm font-extrabold text-[#E0FB4A] bg-neutral-900 border border-neutral-800 rounded-sm px-2.5 py-1 mb-3.5">
                {p.price}
              </span>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5">{p.desc}</p>
            </div>
            <ul className="space-y-2.5 border-t border-neutral-850 pt-4">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-850 flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-450 font-medium text-center">
          Подберем оптимальный формат и рассчитаем точные сроки под вашу задачу.
        </p>
        <a
          href={contentData.contacts.messengers.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-xs font-semibold py-3 px-8 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Обсудить проект в Telegram</span>
        </a>
      </div>
    </div>
  );
}

function RedesignTariffs({ service }) {
  const products = [
    {
      title: 'Визуальный редизайн',
      price: 'от\u00a020 000 ₽',
      desc: 'Обновление устаревшего стиля, шрифтов и\u00a0адаптивов без\u00a0кардинального изменения имеющейся структуры.',
      features: [
        'Освежение цвета, стилистики и\u00a0шрифтов',
        'Перенос сайта на\u00a0Tilda',
        'Полная мобильная адаптация',
        'Сохранение важного текстового контента'
      ]
    },
    {
      title: 'Полный редизайн (Лендинг)',
      price: 'от\u00a030 000 ₽',
      desc: 'Глубокая переработка одностраничного сайта: новая UX-структура, кастомный дизайн в\u00a0Figma и\u00a0верстка.',
      features: [
        'Анализ проблем текущего сайта',
        'Проектирование новой логики и\u00a0смыслов',
        'Уникальный дизайн блоков с\u00a0нуля',
        'Оптимизация конверсии под\u00a0рекламу'
      ]
    },
    {
      title: 'Полный редизайн (Сайт / Магазин)',
      price: 'от\u00a045 000 ₽',
      desc: 'Комплексное перепроектирование многостраничного сайта или\u00a0каталога с\u00a0устранением ошибок UX.',
      features: [
        'Проработка структуры всех страниц',
        'Новая визуальная концепция и\u00a0UI-кит',
        'Верстка на\u00a0Tilda и\u00a0перенос товаров',
        'Сохранение SEO-позиций и\u00a0ссылок'
      ]
    }
  ];

  return (
    <div className="bg-[#1E1E1E] border border-neutral-850 rounded-sm p-5 sm:p-6 flex flex-col gap-6 w-full">
      <div id="tariffs-heading-02" className="text-sm font-semibold text-white border-b border-neutral-850 pb-3 flex justify-between items-center flex-wrap gap-2 scroll-mt-24">
        <span>Тарифы на редизайн и оптимизацию</span>
        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded-sm">
          Сроки: от 5 рабочих дней
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-[#1A1A1A] border border-neutral-850 rounded-sm p-5 flex flex-col justify-between hover:shadow-sm hover:border-neutral-750 transition-all duration-300">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{p.title}</h4>
              <span className="inline-block text-xs sm:text-sm font-extrabold text-[#E0FB4A] bg-neutral-900 border border-neutral-800 rounded-sm px-2.5 py-1 mb-3.5">
                {p.price}
              </span>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5">{p.desc}</p>
            </div>
            <ul className="space-y-2.5 border-t border-neutral-850 pt-4">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-850 flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-450 font-medium text-center">
          Редизайн позволяет повысить конверсию и освежить внешний вид без потери накопленных результатов.
        </p>
        <a
          href={contentData.contacts.messengers.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-xs font-semibold py-3 px-8 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Обсудить редизайн в Telegram</span>
        </a>
      </div>
    </div>
  );
}

function AICalculator({ service }) {
  const products = [
    {
      title: 'Веб-приложение / Сервис',
      price: 'от\u00a040 000 ₽',
      desc: 'Создание личных кабинетов, баз данных, дашбордов и\u00a0сложных интерактивных систем.',
      features: ['Кастомный Frontend и\u00a0Backend', 'Интеграция баз данных (PostgreSQL/Supabase)', 'Личные кабинеты пользователей', 'Админ-панель управления']
    },
    {
      title: 'Мобильное MVP',
      price: 'от\u00a040 000 ₽',
      desc: 'Разработка первых версий мобильных приложений для\u00a0тестов гипотез на\u00a0реальных пользователях.',
      features: ['Адаптивное PWA/мобильное решение', 'Базовые функции авторизации', 'Push-уведомления и\u00a0формы ввода', 'Быстрый запуск для\u00a0тестирования']
    },
    {
      title: 'Платформа',
      price: 'от\u00a055 000 ₽',
      desc: 'Разработка многопользовательских сервисов, обучающих ИТ-платформ с\u00a0разветвленной логикой.',
      features: ['Сложные алгоритмы и\u00a0сценарии', 'Интеграция платежных шлюзов', 'Разделение прав доступа', 'Подготовка к\u00a0масштабированию']
    }
  ];

  return (
    <div className="bg-[#1E1E1E] border border-neutral-850 rounded-sm p-5 sm:p-6 flex flex-col gap-6 w-full">
      <div id="tariffs-heading-03" className="text-sm font-semibold text-white border-b border-neutral-850 pb-3 flex justify-between items-center flex-wrap gap-2 scroll-mt-24">
        <span>Тарифы и направления разработки</span>
        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded-sm">
          Срок: Рассчитывается индивидуально
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-[#1A1A1A] border border-neutral-850 rounded-sm p-5 flex flex-col justify-between hover:shadow-sm hover:border-neutral-750 transition-all duration-300">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{p.title}</h4>
              <span className="inline-block text-xs sm:text-sm font-extrabold text-[#E0FB4A] bg-neutral-900 border border-neutral-800 rounded-sm px-2.5 py-1 mb-3.5">
                {p.price}
              </span>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5">{p.desc}</p>
            </div>
            <ul className="space-y-2.5 border-t border-neutral-850 pt-4">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-850 flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-450 font-medium text-center">
          Разработка сложных цифровых продуктов требует детального обсуждения технического задания и архитектуры.
        </p>
        <a
          href={contentData.contacts.messengers.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-xs font-semibold py-3 px-8 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Обсудить проект в Telegram</span>
        </a>
      </div>
    </div>
  );
}

function FigmaTariffs({ service }) {
  const products = [
    {
      title: 'Дизайн сайтов и интерфейсов',
      price: 'от\u00a020 000 ₽',
      desc: 'Архитектура проекта и\u00a0уникальный кастомный UI/UX дизайн в\u00a0Figma под\u00a0индивидуальную разработку сайтов, сервисов или\u00a0приложений.',
      features: [
        'UX-прототипирование и\u00a0проработка логики',
        'Уникальная визуальная концепция',
        'Адаптивные макеты для\u00a0десктопа и\u00a0мобильных',
        'Готовый UI-кит компонентов для\u00a0передачи в\u00a0верстку'
      ]
    }
  ];

  return (
    <div className="bg-[#1E1E1E] border border-neutral-850 rounded-sm p-5 sm:p-6 flex flex-col gap-6 w-full">
      <div id="tariffs-heading-04" className="text-sm font-semibold text-white border-b border-neutral-850 pb-3 flex justify-between items-center flex-wrap gap-2 scroll-mt-24">
        <span>Стоимость дизайна в Figma</span>
        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded-sm">
          Сроки: от 5 рабочих дней
        </span>
      </div>

      <div className="grid grid-cols-1 max-w-xl gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-[#1A1A1A] border border-neutral-850 rounded-sm p-5 flex flex-col justify-between hover:shadow-sm hover:border-neutral-750 transition-all duration-300">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{p.title}</h4>
              <span className="inline-block text-xs sm:text-sm font-extrabold text-[#E0FB4A] bg-neutral-900 border border-neutral-800 rounded-sm px-2.5 py-1 mb-3.5">
                {p.price}
              </span>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5">{p.desc}</p>
            </div>
            <ul className="space-y-2.5 border-t border-neutral-850 pt-4">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-850 flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-450 font-medium text-center">
          Разработка макетов в Figma с подготовкой всех состояний и компонентов к верстке.
        </p>
        <a
          href={contentData.contacts.messengers.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-xs font-semibold py-3 px-8 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Обсудить дизайн в Telegram</span>
        </a>
      </div>
    </div>
  );
}

function Calculator({ service }) {
  if (service.number === '01') {
    return <TildaTariffs service={service} />;
  }
  if (service.number === '02') {
    return <RedesignTariffs service={service} />;
  }
  if (service.number === '03') {
    return <AICalculator service={service} />;
  }
  if (service.number === '04') {
    return <FigmaTariffs service={service} />;
  }
  return <AICalculator service={service} />;
}



function ServiceGraphic({ number }) {
  if (number === '01') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#262626] to-[#1E1E1E]/50 rounded-md border border-white/5 flex flex-col justify-between p-4 overflow-hidden select-none">
        {/* A mini-browser mockup */}
        <div className="w-full bg-[#111111] border border-neutral-800/50 rounded-md shadow-sm flex flex-col h-full overflow-hidden">
          <div className="bg-[#1A1A1A] border-b\u00a0border-neutral-800/50 px-3 py-2 flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
          </div>
          <div className="p-3 flex-1 flex flex-col gap-2">
            <div className="h-3 bg-neutral-800 rounded-md w-3/4 animate-pulse" />
            <div className="h-2 bg-neutral-850 rounded-md w-1/2" />
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="h-8 bg-[#1A1A1A] rounded-md border border-dashed border-neutral-800/60 flex items-center justify-center text-[10px] text-neutral-500 font-medium">zero</div>
              <div className="h-8 bg-[#1A1A1A] rounded-md border border-dashed border-neutral-800/60 flex items-center justify-center text-[10px] text-neutral-500 font-medium">zero</div>
              <div className="h-8 bg-[#1A1A1A] rounded-md border border-dashed border-neutral-800/60 flex items-center justify-center text-[10px] text-neutral-500 font-medium">zero</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '02') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#262626] to-[#1E1E1E]/50 rounded-md border border-white/5 flex items-center justify-center p-4 overflow-hidden select-none">
        <div className="relative w-full h-full flex items-center justify-center gap-2">
          {/* Left: Old site mockup */}
          <div className="w-5/12 bg-[#141414] border border-neutral-800/60 rounded-sm shadow-sm p-2 rotate-[-4deg] opacity-60 scale-90 flex flex-col gap-1.5 animate-pulse">
            <div className="h-2 bg-neutral-800 rounded w-4/5" />
            <div className="h-1.5 bg-neutral-850 rounded w-3/5" />
            <div className="h-8 bg-[#111111] rounded border border-dashed border-neutral-800/60" />
          </div>
          {/* Arrow in middle */}
          <div className="text-neutral-600 font-light text-base shrink-0">→</div>
          {/* Right: New redesigned site mockup */}
          <div className="w-5/12 bg-[#1A1A1A] border border-neutral-800/60 rounded-sm shadow-md p-2.5 rotate-[2deg] scale-100 flex flex-col gap-2 relative z-10">
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FF5B23] flex items-center justify-center text-[8px] text-white font-bold">✓</div>
            <div className="h-2 bg-neutral-800 rounded w-4/5" />
            <div className="h-1 bg-neutral-850 rounded w-2/5" />
            <div className="h-8 bg-[#FF5B23] text-white rounded flex items-center justify-center text-[9px] font-bold">
              10%
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '03') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#262626] to-[#1E1E1E]/50 rounded-md border border-white/5 flex flex-col justify-between p-4 overflow-hidden select-none">
        {/* A dashboard UI with code info */}
        <div className="w-full bg-[#111111] border border-neutral-800/50 rounded-md shadow-sm flex flex-col h-full overflow-hidden">
          <div className="bg-[#1A1A1A] border-b\u00a0border-neutral-800/50 px-3 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0FB4A] animate-pulse" />
              <span className="text-[9px] text-neutral-400 font-mono">ai-agent.js</span>
            </div>
            <div className="w-2 h-2 rounded bg-neutral-700" />
          </div>
          <div className="p-3 flex-1 flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FF5B23]/10 border border-[#FF5B23]/30 flex items-center justify-center text-[#FF5B23] text-xs shrink-0">⚡</div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-2 bg-neutral-800 rounded w-1/3" />
                <div className="h-1.5 bg-neutral-850 rounded w-2/3" />
              </div>
            </div>
            <div className="border-t border-neutral-800/60 my-0.5" />
            <div className="flex justify-between items-center text-[9px] text-neutral-500">
              <span>Prompt processing...</span>
              <span className="font-mono text-neutral-400">120ms</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '04') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#262626] to-[#1E1E1E]/50 rounded-md border border-white/5 flex items-center justify-center p-4 overflow-hidden select-none">
        <div className="w-full h-full bg-[#111111] border border-neutral-800/50 rounded-md shadow-sm p-3 flex flex-col gap-2 relative">
          {/* Visual designer vector mockup */}
          <div className="flex items-center justify-between border-b\u00a0border-neutral-800/50 pb-1.5">
            <span className="text-[9px] text-neutral-400 font-mono">Figma Artboard</span>
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {/* Overlapping vector shapes */}
            <div className="absolute w-10 h-10 rounded-full border border-indigo-500 bg-indigo-950/20 flex items-center justify-center">
              <div className="w-1 h-1 bg-[#1A1A1A] border border-indigo-500 absolute -top-0.5 left-[17px]" />
              <div className="w-1 h-1 bg-[#1A1A1A] border border-indigo-500 absolute -bottom-0.5 left-[17px]" />
              <div className="w-1 h-1 bg-[#1A1A1A] border border-indigo-500 absolute -left-0.5 top-[17px]" />
              <div className="w-1 h-1 bg-[#1A1A1A] border border-indigo-500 absolute -right-0.5 top-[17px]" />
            </div>
            <div className="absolute w-7 h-7 rotate-45 border border-dashed border-emerald-500 bg-emerald-950/10" />
            
            {/* cursor icon */}
            <svg className="absolute w-3.5 h-3.5 text-indigo-600 top-1/2 left-1/2 fill-indigo-600 shadow-sm" viewBox="0 0 24 24">
              <path d="M4.5 3v15.2l4.8-4.7 6.2 6.2 3.1-3.1-6.2-6.2 6.7-.4L4.5 3z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ServiceCard({ service, isCalcOpen, onToggleCalc, onSendSuccess }) {
  const IconComponent = ICON_MAP[service.number] || Layers;

  return (
    <div id={`service-card-${service.number}`} className="group relative border border-neutral-800 rounded-md p-6 sm:p-8 hover:border-neutral-600 hover:scale-[1.015] hover:shadow-2xl transition-all bg-[#1A1A1A] duration-300">
      {(service.number === '01' || service.number === '03') && (
        <div className="absolute inset-0 bg-orange-500/[0.02] pointer-events-none rounded-md" />
      )}
      {/* Two-column layout grid for header and parameters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
        
        {/* Left column (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div className="inline-flex items-center justify-center p-2.5 bg-neutral-900/30 rounded-sm border border-neutral-800 shrink-0">
                <IconComponent className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-wider text-[#E0FB4A] uppercase mb-0.5">[ Услуга {service.number} ]</span>
                <h3 className="text-xl md:text-2xl font-light tracking-tight text-white leading-tight">{service.title}</h3>
              </div>
            </div>
            
            <p className="text-[14px] text-neutral-400 leading-relaxed max-w-[640px] mb-6">{service.brief}</p>
            
            {/* Mobile-only parameters (displayed statically, vertical stream) */}
            <div className="block md:hidden space-y-4 border-t border-neutral-800 pt-5 mt-5">
              {service.details.filter((detail) => detail.label.toLowerCase() !== 'идеально для').map((detail, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500">
                    {detail.label}
                  </span>
                  <span className={`text-[13px] leading-relaxed ${
                    detail.label.toLowerCase().includes('срок') ? 'font-semibold text-white' : 'text-neutral-400'
                  }`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (always visible at bottom of left column) */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-neutral-800">
            <button
              onClick={onToggleCalc}
              className={`text-xs font-semibold py-2.5 px-5 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer ${
                isCalcOpen
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-[#FF5B23] text-white hover:bg-[#e04f1e]'
              }`}
            >
              {isCalcOpen ? 'Скрыть подробности' : 'Посмотреть тарифы'}
            </button>
            <button
              onClick={() => window.open('https://t.me/ksen_web', '_blank')}
              className="border border-[#FF5B23]/30 text-white bg-transparent transition-all duration-300 hover:border-[#FF5B23] hover:text-white hover:bg-[#FF5B23]/5 text-xs font-semibold py-2.5 px-5 rounded-sm hover:-translate-y-[0.5px] cursor-pointer"
            >
              Рассказать о задаче
            </button>
          </div>
        </div>

        {/* Right column (md:col-span-2) - interactive bento zone on desktop */}
        <div className="hidden md:block md:col-span-2 relative overflow-hidden w-full h-full min-h-[160px]">
          
          {/* Layer 1: Graphic Bento Placeholder (visible statically, fades on hover) */}
          <div className="absolute inset-0 w-full h-full transition-all duration-500 opacity-100 group-hover:opacity-0 group-hover:scale-95">
            <ServiceGraphic number={service.number} />
          </div>

          {/* Layer 2: Text Parameters (revealed on hover) */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-center transition-all duration-500 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100">
            <div className="bg-[#1E1E1E]/50 border border-neutral-800 rounded-md p-5 h-full flex flex-col justify-center space-y-4">
              {service.details.filter((detail) => detail.label.toLowerCase() !== 'идеально для').map((detail, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500">
                    {detail.label}
                  </span>
                  <span className={`text-[13px] leading-relaxed ${
                    detail.label.toLowerCase().includes('срок') ? 'font-semibold text-white' : 'text-neutral-400'
                  }`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Smoothly Expanding Calculator Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCalcOpen ? 'max-h-[2500px] opacity-100 mt-6 pt-6 border-t border-neutral-800' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <Calculator service={service} onSendSuccess={onSendSuccess} isCalcOpen={isCalcOpen} />
      </div>
    </div>
  );
}

export default function Services() {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState(null);
  const services = contentData.services.items;

  useEffect(() => {
    const handleOpenCalc = (e) => {
      const targetNumber = e.detail?.serviceNumber || '01';
      setActiveCalculator(targetNumber);
    };
    
    window.addEventListener('open-calculator', handleOpenCalc);
    return () => window.removeEventListener('open-calculator', handleOpenCalc);
  }, []);

  useEffect(() => {
    if (activeCalculator) {
      const timer = setTimeout(() => {
        const target = document.getElementById(`tariffs-heading-${activeCalculator}`) || document.getElementById(`tariffs-heading`) || document.getElementById(`service-card-${activeCalculator}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeCalculator]);

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
    <>
    <motion.section
      id="services"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b\u00a0border-neutral-800 bg-[#111111]"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
        <div className="border-l border-neutral-800/60 h-full" />
      </div>
      <div className="relative z-10">
      <div className="overflow-hidden mb-6">
        <motion.h2
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-0"
        >
          {contentData.services.title}
        </motion.h2>
      </div>
      <p className="text-[15px] text-neutral-400 max-w-[640px] mb-12">
        {contentData.services.subtitle}
      </p>

      <motion.div
        className="relative z-10 flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
      >
        {services.map((service) => (
          <motion.div key={service.number} variants={cardVariants}>
            <ServiceCard 
              service={service} 
              isCalcOpen={activeCalculator === service.number}
              onToggleCalc={() => {
                setActiveCalculator(prev => prev === service.number ? null : service.number);
              }}
              onSendSuccess={() => {
                setSuccessModalContent('Расчет успешно отправлен! Я свяжусь с вами в Telegram в течение 1 рабочего дня.');
                setIsSuccessModalOpen(true);
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      </div>
    </motion.section>

    {createPortal(
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-all duration-300 ease-in-out ${
          isSuccessModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`bg-white rounded-[1px] p-7 sm:p-9 max-w-[400px] w-full shadow-2xl relative flex flex-col items-center text-center gap-5 transition-all duration-300 transform ${
            isSuccessModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              setSuccessModalContent(null);
              setActiveCalculator(null);
            }}
            className="absolute top-3.5 right-3.5 text-neutral-300 hover:text-neutral-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="5,15 11.5,21 23,8" stroke="#FF5B23" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div>
            <h3 className="text-[17px] font-semibold text-[#111111] mb-2 tracking-tight">Расчет отправлен</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {successModalContent || 'Я свяжусь с вами в Telegram в течение 1 рабочего дня.'}
            </p>
          </div>

          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              setSuccessModalContent(null);
              setActiveCalculator(null);
            }}
            className="w-full mt-1 border border-neutral-200 text-[#111111] font-medium text-sm py-2.5 rounded-[1px] hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>,
      document.body
    )}
</>
  );
}
