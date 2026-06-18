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

const TELEGRAM_CONSULT_URL = 'https://t.me/ksen_web';

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


function TildaCalculator({ service, onSendSuccess, isCalcOpen }) {
  const [siteType, setSiteType] = useState(null);
  const [pagesCount, setPagesCount] = useState(null);
  const [contentReady, setContentReady] = useState(null);
  const [comments, setComments] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [cartBump, setCartBump] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState(null);
  const [collectedIds, setCollectedIds] = useState([]);
  const cartRef = useRef(null);
  const cartIconRef = useRef(null);
  const slotRefs = useRef({});

  // Reset state when closed
  useEffect(() => {
    if (!isCalcOpen) {
      setSiteType(null);
      setPagesCount(null);
      setContentReady(null);
      setComments('');
      setName('');
      setContact('');
      setErrors({});
      setCollectedIds([]);
    }
  }, [isCalcOpen]);

  const siteTypeOptions = [
    { value: 'individual_landing', label: 'Индивидуальный Лендинг', price: 30000, days: 7, description: 'одностраничный сайт с\u00a0уникальным дизайном в\u00a0Zero-блоках' },
    { value: 'template_site', label: 'Сайт на\u00a0шаблонах Tilda', price: 20000, days: 5, description: 'быстрый старт на\u00a0стандартных блоках с\u00a0кастомизацией под\u00a0стиль' },
    { value: 'multipage_shop', label: 'Многостраничный сайт / Магазин', price: 50000, days: 15, description: 'уникальный дизайн, сложная структура' }
  ];

  const pagesOptions = [
    { value: '1_page', label: '1 страница', multiplier: 1, extraDays: 0, description: 'подходит для\u00a0лендинга' },
    { value: '2_5_pages', label: 'От\u00a02 до\u00a05 страниц', multiplier: 1.3, extraDays: 5, description: '' },
    { value: '5_10_pages', label: 'От\u00a05 до\u00a010 страниц', multiplier: 1.6, extraDays: 10, description: '' },
    { value: 'more_10_pages', label: 'Более 10 страниц / Каталог', multiplier: 2.0, extraDays: 15, description: '' }
  ];

  const contentReadyOptions = [
    { value: 'ready', label: 'У\u00a0меня есть всё готовое', multiplier: 1, extraDays: 0, description: 'тексты, фотографии, фирменный стиль' },
    { value: 'partial', label: 'Материалы есть частично', multiplier: 1.2, extraDays: 3, description: 'потребуется помощь в\u00a0доработке или\u00a0структурировании' },
    { value: 'none', label: 'Ничего нет', multiplier: 1.4, extraDays: 7, description: 'нужна разработка структуры и\u00a0текстов с\u00a0нуля' }
  ];

  const activeSiteType = siteType ? siteTypeOptions.find((opt) => opt.value === siteType) : null;
  const activePages = pagesCount ? pagesOptions.find((opt) => opt.value === pagesCount) : null;
  const activeContentReady = contentReady ? contentReadyOptions.find((opt) => opt.value === contentReady) : null;

  const isCartComplete = Boolean(siteType && pagesCount && contentReady);
  const price = isCartComplete
    ? Math.round(activeSiteType.price * activePages.multiplier * activeContentReady.multiplier)
    : 0;
  const days = isCartComplete
    ? activeSiteType.days + activePages.extraDays + activeContentReady.extraDays
    : 0;

  const cartItems = [
    { id: 'siteType', step: 1, icon: Layout },
    { id: 'pagesCount', step: 2, icon: Files },
    { id: 'contentReady', step: 3, icon: FileText },
  ];

  const registerSlotRef = useCallback((id, el) => {
    if (el) slotRefs.current[id] = el;
  }, []);

  const handleOptionChange = (group, value, ev) => {
    if (group === 'siteType') setSiteType(value);
    if (group === 'pagesCount') setPagesCount(value);
    if (group === 'contentReady') setContentReady(value);

    const item = cartItems.find((entry) => entry.id === group);
    const src = ev?.currentTarget ?? ev?.target ?? null;
    const target = slotRefs.current[group] ?? cartRef.current;

    flyChipToCart(
      src,
      target,
      { step: item?.step ?? '•', iconKey: TILDA_CART_ICON_KEYS[group] },
      () => {
        setCollectedIds((prev) => (prev.includes(group) ? prev : [...prev, group]));
        setHighlightedSlot(group);
        setCartBump(true);
        setBadgeBump(true);
        setTimeout(() => {
          setHighlightedSlot(null);
          setCartBump(false);
          setBadgeBump(false);
        }, 450);
      }
    );
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!isCartComplete) {
      alert('Пожалуйста, выберите все параметры проекта в\u00a0конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';
    else if (!isValidContact(contact)) newErrors.contact = 'Пожалуйста, введите корректный номер телефона или никнейм Telegram (например, @username)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const siteTypeLabels = siteTypeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const pagesLabels = pagesOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const contentReadyLabels = contentReadyOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `🔔 *Новая заявка с сайта-портфолио (Расчет Tilda)*

  *Клиент:* ${name}
  *Контакт:* ${contact}

  *Услуга:* ${service.title}
  *Выбранные параметры:*
  • Тип сайта: *${siteTypeLabels[siteType]}*
  • Количество страниц: *${pagesLabels[pagesCount]}*
  • Готовность контента: *${contentReadyLabels[contentReady]}*
  • Дополнительные пожелания: *${comments || 'Нет'}*

  *Примерная стоимость:* от ${formatPrice(price)} руб.
  *Сроки:* от ${days} ${getDaysWord(days)}

  ✅ *Действие:* Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я свяжусь с вами в ближайшее время для уточнения деталей. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess();
        setName('');
        setContact('');
        setComments('');
        return;
      }
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } catch (e) {
      console.error(e);
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } finally {
      setLoading(false);
    }
  };

  const getTildaOptionButtonClass = (isSelected) => {
    if (isSelected) {
      return 'bg-white text-black font-semibold shadow-[0_3px_10px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)]';
    }
    return 'bg-white/50 text-neutral-700 hover:text-black font-normal';
  };

  return (
    <div className="bg-[#FFFFFF] border border-neutral-200/60 rounded-sm p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-[#111111] text-xl font-normal tracking-tight border-b\u00a0border-neutral-200 pb-3">
        Конфигуратор проекта
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 1: ТИП САЙТА И ДИЗАЙН-КОНЦЕПЦИЯ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {siteTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('siteType', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    siteType === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: siteType === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeSiteType?.description ?? siteTypeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 2: КОЛИЧЕСТВО СТРАНИЦ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {pagesOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('pagesCount', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    pagesCount === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: pagesCount === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activePages?.description ?? pagesOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 3: ГОТОВНОСТЬ КОНТЕНТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {contentReadyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('contentReady', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    contentReady === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: contentReady === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeContentReady?.description ?? contentReadyOptions[0].description}
            </span>
          </div>
        </div>

        <div className="h-full flex flex-col">
          <ProjectCart
            cartRef={cartRef}
            cartIconRef={cartIconRef}
            registerSlotRef={registerSlotRef}
            items={cartItems}
            collectedIds={collectedIds}
            price={price}
            days={days}
            isComplete={isCartComplete}
            bump={cartBump}
            badgeBump={badgeBump}
            highlightedSlot={highlightedSlot}
            isLight={true}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-neutral-200">
        <div className="flex flex-col gap-2">
          <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
            Свободные пожелания
          </span>
          <textarea
            rows={4}
            placeholder="Например: Нужна интеграция с CRM и личный кабинет..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-[#111111] rounded-sm px-4 py-3 text-sm focus:border-neutral-800 focus:outline-none focus:ring-0 transition-all placeholder-neutral-450 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Ваше имя *
            </label>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full bg-white border ${
                errors.name ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Телефон или Telegram *
            </label>
            <input
              type="text"
              placeholder="Телефон или Telegram"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: null }));
              }}
              className={`w-full bg-white border ${
                errors.contact ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-sm font-semibold py-3 rounded-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[#FF5B23]/30 text-[#111111] bg-transparent transition-all duration-300 hover:border-[#FF5B23] hover:text-black hover:bg-[#FF5B23]/5 text-sm font-semibold py-3 rounded-sm text-center"
          >
            Нужна консультация
          </a>
        </div>
        {submitError && (
          <div className="text-red-500 text-sm mt-3">{submitError}</div>
        )}
        {submitError && (
          <div className="text-red-500 text-sm mt-3">{submitError}</div>
        )}
      </div>
    </div>
  );
}

function RedesignCalculator({ service, onSendSuccess, isCalcOpen }) {
  const [problemType, setProblemType] = useState(null);
  const [volume, setVolume] = useState(null);
  const [depth, setDepth] = useState(null);
  const [comments, setComments] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState(null);
  const [collectedIds, setCollectedIds] = useState([]);
  const cartRef = useRef(null);
  const cartIconRef = useRef(null);
  const slotRefs = useRef({});

  // Reset state when closed
  useEffect(() => {
    if (!isCalcOpen) {
      setProblemType(null);
      setVolume(null);
      setDepth(null);
      setComments('');
      setName('');
      setContact('');
      setErrors({});
      setCollectedIds([]);
    }
  }, [isCalcOpen]);

  const problemOptions = [
    { value: 'outdated', label: 'Устарел дизайн', price: 20000, days: 0, description: 'обновим визуальный стиль сайта и\u00a0сделаем его современным' },
    { value: 'mobile_ux', label: 'Плохой мобильный UX', price: 25000, days: 2, description: 'исправим ошибки отображения на\u00a0телефонах и\u00a0планшетах' },
    { value: 'no_leads', label: 'Устарел контент / Новые блоки', price: 30000, days: 4, description: 'добавим новые разделы, страницы или обновим информацию под свежие задачи бизнеса' }
  ];

  const volumeOptions = [
    { value: 'landing', label: 'Одностраничный сайт', multiplier: 1.0, extraDays: 0, description: 'подходит для\u00a0лендинга' },
    { value: 'multipage', label: 'До\u00a05 страниц', multiplier: 1.4, extraDays: 3, description: 'подходит для\u00a0сайтов компаний' },
    { value: 'large', label: 'Крупный сайт / Магазин', multiplier: 1.8, extraDays: 7, description: 'более 5 страниц или\u00a0каталог' }
  ];

  const depthOptions = [
    { value: 'visual_update', label: 'Визуальное обновление', multiplier: 1.0, extraDays: 0, description: 'тексты и\u00a0структура остаются прежними, меняется только дизайн' },
    { value: 'full_redesign', label: 'Полный редизайн UX/UI', multiplier: 1.3, extraDays: 3, description: 'исправление логики, новая структура и\u00a0дизайн в\u00a0Figma с\u00a0нуля' },
    { value: 'full_rewrite', label: 'Полная переработка смыслов', multiplier: 1.6, extraDays: 5, description: 'пишем тексты и\u00a0структуру заново под\u00a0новые задачи' }
  ];

  const activeProblem = problemType ? problemOptions.find((opt) => opt.value === problemType) : null;
  const activeVolume = volume ? volumeOptions.find((opt) => opt.value === volume) : null;
  const activeDepth = depth ? depthOptions.find((opt) => opt.value === depth) : null;

  const isCartComplete = Boolean(problemType && volume && depth);
  const price = isCartComplete
    ? Math.round(activeProblem.price * activeVolume.multiplier * activeDepth.multiplier)
    : 0;
  const days = isCartComplete
    ? 5 + activeProblem.days + activeVolume.extraDays + activeDepth.extraDays
    : 0;

  const cartItems = [
    { id: 'problemType', step: 1, icon: RefreshCw },
    { id: 'volume', step: 2, icon: Files },
    { id: 'depth', step: 3, icon: FileText },
  ];

  const iconKeys = {
    problemType: 'layout',
    volume: 'files',
    depth: 'fileText',
  };

  const registerSlotRef = useCallback((id, el) => {
    if (el) slotRefs.current[id] = el;
  }, []);

  const handleOptionChange = (group, value, ev) => {
    if (group === 'problemType') setProblemType(value);
    if (group === 'volume') setVolume(value);
    if (group === 'depth') setDepth(value);

    const item = cartItems.find((entry) => entry.id === group);
    const src = ev?.currentTarget ?? ev?.target ?? null;
    const target = slotRefs.current[group] ?? cartRef.current;

    flyChipToCart(
      src,
      target,
      { step: item?.step ?? '•', iconKey: iconKeys[group] },
      () => {
        setCollectedIds((prev) => (prev.includes(group) ? prev : [...prev, group]));
        setHighlightedSlot(group);
        setCartBump(true);
        setBadgeBump(true);
        setTimeout(() => {
          setHighlightedSlot(null);
          setCartBump(false);
          setBadgeBump(false);
        }, 450);
      }
    );
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!isCartComplete) {
      alert('Пожалуйста, выберите все параметры проекта в\u00a0конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';
    else if (!isValidContact(contact)) newErrors.contact = 'Пожалуйста, введите корректный номер телефона или никнейм Telegram (например, @username)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const problemLabels = problemOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const volumeLabels = volumeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const depthLabels = depthOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `🔔 *Новая заявка с сайта-портфолио (Редизайн сайта)*

  *Клиент:* ${name}
  *Контакт:* ${contact}

  *Услуга:* ${service.title}
  *Выбранные параметры:*
  • Проблема сайта: *${problemLabels[problemType]}*
  • Объем страниц: *${volumeLabels[volume]}*
  • Глубина переработки: *${depthLabels[depth]}*
  • Дополнительные пожелания: *${comments || 'Нет'}*

  *Примерная стоимость:* от ${formatPrice(price)} руб.
  *Сроки:* от ${days} ${getDaysWord(days)}

  ✅ *Действие:* Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я изучу ваш текущий сайт и свяжусь в ближайшее время. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess();
        setName('');
        setContact('');
        setComments('');
        return;
      }
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } catch (e) {
      console.error(e);
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } finally {
      setLoading(false);
    }
  };

  const getTildaOptionButtonClass = (isSelected) => {
    if (isSelected) {
      return 'bg-white text-black font-semibold shadow-[0_3px_10px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)]';
    }
    return 'bg-white/50 text-neutral-700 hover:text-black font-normal';
  };

  return (
    <div className="bg-[#FFFFFF] border border-neutral-200/60 rounded-sm p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-[#111111] text-xl font-normal tracking-tight border-b\u00a0border-neutral-200 pb-3">
        Конфигуратор редизайна
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 1: ТЕКУЩИЕ ПРОБЛЕМЫ САЙТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {problemOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('problemType', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    problemType === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: problemType === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeProblem?.description ?? problemOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 2: ОБЪЕМ СТРАНИЦ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {volumeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('volume', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    volume === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: volume === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeVolume?.description ?? volumeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 3: ГЛУБИНА ПЕРЕРАБОТКИ СМЫСЛОВ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {depthOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('depth', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    depth === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: depth === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeDepth?.description ?? depthOptions[0].description}
            </span>
          </div>
        </div>

        <div className="h-full flex flex-col">
          <ProjectCart
            cartRef={cartRef}
            cartIconRef={cartIconRef}
            registerSlotRef={registerSlotRef}
            items={cartItems}
            collectedIds={collectedIds}
            price={price}
            days={days}
            isComplete={isCartComplete}
            bump={cartBump}
            badgeBump={badgeBump}
            highlightedSlot={highlightedSlot}
            isLight={true}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-neutral-200">
        <div className="flex flex-col gap-2">
          <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
            Дополнительные пожелания и ссылка на текущий сайт
          </span>
          <textarea
            rows={4}
            placeholder="Укажите ссылку на текущий сайт и напишите пожелания..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-[#111111] rounded-sm px-4 py-3 text-sm focus:border-neutral-800 focus:outline-none focus:ring-0 transition-all placeholder-neutral-450 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Ваше имя *
            </label>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full bg-white border ${
                errors.name ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Телефон или Telegram *
            </label>
            <input
              type="text"
              placeholder="Телефон или Telegram"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: null }));
              }}
              className={`w-full bg-white border ${
                errors.contact ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-sm font-semibold py-3 rounded-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[#FF5B23]/30 text-[#111111] bg-transparent transition-all duration-300 hover:border-[#FF5B23] hover:text-black hover:bg-[#FF5B23]/5 text-sm font-semibold py-3 rounded-sm text-center"
          >
            Нужна консультация
          </a>
        </div>
      </div>
    </div>
  );
}

function FigmaCalculator({ service, onSendSuccess, isCalcOpen }) {
  const [designType, setDesignType] = useState(null);
  const [complexity, setComplexity] = useState(null);
  const [specStatus, setSpecStatus] = useState(null);
  const [comments, setComments] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState(null);
  const [collectedIds, setCollectedIds] = useState([]);
  const cartRef = useRef(null);
  const cartIconRef = useRef(null);
  const slotRefs = useRef({});

  // Reset state when closed
  useEffect(() => {
    if (!isCalcOpen) {
      setDesignType(null);
      setComplexity(null);
      setSpecStatus(null);
      setComments('');
      setName('');
      setContact('');
      setErrors({});
      setCollectedIds([]);
    }
  }, [isCalcOpen]);

  const typeOptions = [
    { value: 'website_design', label: 'Дизайн веб-сайта', price: 20000, days: 0, description: 'уникальный стиль, адаптивные макеты для\u00a0ПК и\u00a0мобильных устройств' },
    { value: 'app_interface', label: 'Интерфейс приложения', price: 35000, days: 5, description: 'UX-сценарии, личные кабинеты, дашборды и\u00a0экраны MVP' }
  ];

  const complexityOptions = [
    { value: 'small', label: 'До\u00a05 экранов', multiplier: 1.0, extraDays: 0, description: 'подходит для\u00a0простых сайтов и\u00a0лендингов' },
    { value: 'medium', label: 'От\u00a05 до\u00a015 экранов', multiplier: 1.4, extraDays: 5, description: 'подходит для\u00a0сайтов компаний и\u00a0небольших сервисов' },
    { value: 'ecosystem', label: 'Более 15 экранов', multiplier: 1.8, extraDays: 10, description: 'сложная экосистема, детальный интерактивный прототип' }
  ];

  const specOptions = [
    { value: 'has_spec', label: 'Есть готовый UI-кит / ТЗ', multiplier: 1.0, extraDays: 0, description: 'работа по\u00a0готовым компонентам и\u00a0готовой структуре' },
    { value: 'no_spec', label: 'Без\u00a0UI-кита / ТЗ с\u00a0нуля', multiplier: 1.3, extraDays: 5, description: 'совместная разработка дизайн-системы и\u00a0проектирование логики' }
  ];

  const activeType = designType ? typeOptions.find((opt) => opt.value === designType) : null;
  const activeComplexity = complexity ? complexityOptions.find((opt) => opt.value === complexity) : null;
  const activeSpec = specStatus ? specOptions.find((opt) => opt.value === specStatus) : null;

  const isCartComplete = Boolean(designType && complexity && specStatus);
  const price = isCartComplete
    ? Math.round(activeType.price * activeComplexity.multiplier * activeSpec.multiplier)
    : 0;
  const days = isCartComplete
    ? 10 + activeType.days + activeComplexity.extraDays + activeSpec.extraDays
    : 0;

  const cartItems = [
    { id: 'designType', step: 1, icon: Figma },
    { id: 'complexity', step: 2, icon: Files },
    { id: 'specStatus', step: 3, icon: FileText },
  ];

  const iconKeys = {
    designType: 'layout',
    complexity: 'files',
    specStatus: 'fileText',
  };

  const registerSlotRef = useCallback((id, el) => {
    if (el) slotRefs.current[id] = el;
  }, []);

  const handleOptionChange = (group, value, ev) => {
    if (group === 'designType') setDesignType(value);
    if (group === 'complexity') setComplexity(value);
    if (group === 'specStatus') setSpecStatus(value);

    const item = cartItems.find((entry) => entry.id === group);
    const src = ev?.currentTarget ?? ev?.target ?? null;
    const target = slotRefs.current[group] ?? cartRef.current;

    flyChipToCart(
      src,
      target,
      { step: item?.step ?? '•', iconKey: iconKeys[group] },
      () => {
        setCollectedIds((prev) => (prev.includes(group) ? prev : [...prev, group]));
        setHighlightedSlot(group);
        setCartBump(true);
        setBadgeBump(true);
        setTimeout(() => {
          setHighlightedSlot(null);
          setCartBump(false);
          setBadgeBump(false);
        }, 450);
      }
    );
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!isCartComplete) {
      alert('Пожалуйста, выберите все параметры проекта в\u00a0конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';
    else if (!isValidContact(contact)) newErrors.contact = 'Пожалуйста, введите корректный номер телефона или никнейм Telegram (например, @username)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const typeLabels = typeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const complexityLabels = complexityOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const specLabels = specOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `🔔 *Новая заявка с сайта-портфолио (Дизайн в Figma)*

  *Клиент:* ${name}
  *Контакт:* ${contact}

  *Услуга:* ${service.title}
  *Выбранные параметры:*
  • Тип дизайна: *${typeLabels[designType]}*
  • Объем и сложность: *${complexityLabels[complexity]}*
  • UI-кит / ТЗ: *${specLabels[specStatus]}*
  • Дополнительные пожелания: *${comments || 'Нет'}*

  *Примерная стоимость (только дизайн):* от ${formatPrice(price)} руб.
  *Сроки:* от ${days} ${getDaysWord(days)}

  ✅ *Действие:* Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я проанализирую вашу задачу и свяжусь в ближайшее время для обсуждения концепции. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess();
        setName('');
        setContact('');
        setComments('');
        return;
      }
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } catch (e) {
      console.error(e);
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } finally {
      setLoading(false);
    }
  };

  const getTildaOptionButtonClass = (isSelected) => {
    if (isSelected) {
      return 'bg-white text-black font-semibold shadow-[0_3px_10px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)]';
    }
    return 'bg-white/50 text-neutral-700 hover:text-black font-normal';
  };

  return (
    <div className="bg-[#FFFFFF] border border-neutral-200/60 rounded-sm p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-[#111111] text-xl font-normal tracking-tight border-b\u00a0border-neutral-200 pb-3">
        Конфигуратор дизайна в Figma
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 1: ТИП ИНТЕРФЕЙСА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('designType', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    designType === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: designType === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeType?.description ?? typeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 2: КОЛИЧЕСТВО УНИКАЛЬНЫХ ЭКРАНОВ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {complexityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('complexity', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    complexity === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: complexity === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeComplexity?.description ?? complexityOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
              ШАГ 3: НАЛИЧИЕ ГОТОВОГО UI-КИТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5 bg-neutral-100 rounded-sm border border-transparent">
              {specOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('specStatus', opt.value, e)}
                  className={`text-center py-2 px-3 rounded-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getTildaOptionButtonClass(
                    specStatus === opt.value
                  )}`}
                  style={{ borderWidth: '0.4px', borderColor: specStatus === opt.value ? '#FF5B23' : 'transparent', borderStyle: 'solid' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-neutral-500 text-xs font-light px-1">
              {activeSpec?.description ?? specOptions[0].description}
            </span>
          </div>
        </div>

        <div className="h-full flex flex-col">
          <ProjectCart
            cartRef={cartRef}
            cartIconRef={cartIconRef}
            registerSlotRef={registerSlotRef}
            items={cartItems}
            collectedIds={collectedIds}
            price={price}
            days={days}
            isComplete={isCartComplete}
            bump={cartBump}
            badgeBump={badgeBump}
            highlightedSlot={highlightedSlot}
            isLight={true}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-neutral-200">
        <div className="flex flex-col gap-2">
          <span className="text-[#111111] text-[12px] font-medium tracking-wider uppercase">
            Описание проекта и ссылки на референсы
          </span>
          <textarea
            rows={4}
            placeholder="Опишите ваши пожелания, стиль, референсы..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-[#111111] rounded-sm px-4 py-3 text-sm focus:border-neutral-800 focus:outline-none focus:ring-0 transition-all placeholder-neutral-450 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Ваше имя *
            </label>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full bg-white border ${
                errors.name ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[#111111] text-[12px] font-medium tracking-wider uppercase mb-1.5">
              Телефон или Telegram *
            </label>
            <input
              type="text"
              placeholder="Телефон или Telegram"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: null }));
              }}
              className={`w-full bg-white border ${
                errors.contact ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-800'
              } rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-[#111111] placeholder-neutral-450`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-sm font-semibold py-3 rounded-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[#FF5B23]/30 text-[#111111] bg-transparent transition-all duration-300 hover:border-[#FF5B23] hover:text-black hover:bg-[#FF5B23]/5 text-sm font-semibold py-3 rounded-sm text-center"
          >
            Нужна консультация
          </a>
        </div>
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
      <div id="tariffs-heading" className="text-sm font-semibold text-white border-b\u00a0border-neutral-850 pb-3 flex justify-between items-center flex-wrap gap-2 scroll-mt-24">
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
          href={TELEGRAM_CONSULT_URL}
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

function DefaultCalculator({ service, onSendSuccess }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Инициализация значений по умолчанию
  useEffect(() => {
    if (service.calculator && service.calculator.options) {
      const initial = {};
      service.calculator.options.forEach(opt => {
        initial[opt.id] = opt.choices[0].value;
      });
      setSelectedOptions(initial);
    }
  }, [service]);

  if (!service.calculator) return null;

  const basePrice = service.calculator.basePrice;
  const baseDays = service.calculator.baseDays || 0;

  // Рассчет цены и сроков
  let price = basePrice;
  let days = baseDays;

  if (service.calculator.options) {
    service.calculator.options.forEach(opt => {
      const selectedValue = selectedOptions[opt.id];
      const choice = opt.choices.find(c => c.value === selectedValue);
      if (choice) {
        price += choice.price;
        days += choice.days || 0;
      }
    });
  }

  const handleOptionChange = (optionId, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';
    else if (!isValidContact(contact)) newErrors.contact = 'Пожалуйста, введите корректный номер телефона или никнейм Telegram (например, @username)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setSubmitError(null);

    // Сбор выбранных опций для сообщения
    let selectedOptionsList = '';
    if (service.calculator.options) {
      service.calculator.options.forEach(opt => {
        const selectedVal = selectedOptions[opt.id];
        const choice = opt.choices.find(c => c.value === selectedVal);
        if (choice) {
          selectedOptionsList += `• ${opt.label}: *${choice.label}* (+${formatPrice(choice.price)} ₽)\n`;
        }
      });
    }

    const messageText = `🔔 *Новая заявка с сайта-портфолио*

*Клиент:* ${name}
*Контакт:* ${contact}

*Услуга:* ${service.title}
*Выбранные опции:*
${selectedOptionsList || 'Нет дополнительных опций'}

*Итоговая цена:* от ${formatPrice(price)} руб.
*Сроки:* от ${days} ${getDaysWord(days)}

✅ *Действие:* Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        onSendSuccess();
        setName('');
        setContact('');
        return;
      }
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } catch (e) {
      console.error(e);
      setSubmitError('Не удалось отправить данные автоматически. Пожалуйста, напишите мне напрямую в Telegram @ksen_web');
    } finally {
      setLoading(false);
    }
  };

  // Проверка, является ли опция булевым переключателем (Да/Нет)
  const isYesNoOption = (opt) => {
    return opt.choices.length === 2 && 
           opt.choices[0].value === 'no' && 
           opt.choices[1].value === 'yes';
  };

  return (
    <div className="bg-[#1E1E1E] border border-neutral-850 rounded-lg p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-white text-xl font-normal tracking-tight border-b\u00a0border-neutral-850 pb-3">
        Конфигуратор проекта
      </div>

      <div className="flex flex-col gap-5">
        {service.calculator.options && service.calculator.options.map((opt) => {
          if (isYesNoOption(opt)) {
            const isChecked = selectedOptions[opt.id] === 'yes';
            const yesChoice = opt.choices[1];
            return (
              <div key={opt.id} className="flex flex-col gap-1.5">
                <label className="flex items-start gap-3 p-3.5 bg-[#1A1A1A] border border-neutral-850 rounded-sm hover:border-neutral-750 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleOptionChange(opt.id, e.target.checked ? 'yes' : 'no')}
                    className="w-4 h-4 text-[#FF5B23] bg-neutral-900 border-neutral-800 rounded focus:ring-0 focus:outline-none mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{opt.label}</span>
                    {yesChoice.price > 0 && (
                      <span className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                        +{formatPrice(yesChoice.price)} ₽ {yesChoice.days > 0 ? `• +${yesChoice.days} ${getDaysWord(yesChoice.days)}` : ''}
                      </span>
                    )}
                  </div>
                </label>
              </div>
            );
          } else {
            return (
              <SegmentedControl
                key={opt.id}
                label={opt.label}
                val={selectedOptions[opt.id]}
                setVal={(val) => handleOptionChange(opt.id, val)}
                options={opt.choices}
              />
            );
          }
        })}
      </div>

      {/* Поля ввода контактов */}
      <div className="flex flex-col gap-4 pt-4 border-t border-neutral-850">
        <div className="text-xs font-semibold text-white">
          Контактные данные для расчета
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-[10px] font-medium tracking-wider uppercase mb-1.5">
              Ваше имя *
            </label>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full bg-[#1A1A1A] border ${
                errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-neutral-850 focus:border-neutral-700'
              } rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-0 transition-all text-white placeholder-neutral-500`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-white text-[10px] font-medium tracking-wider uppercase mb-1.5">
              Телефон или Telegram *
            </label>
            <input
              type="text"
              placeholder="Телефон или Telegram"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: null }));
              }}
              className={`w-full bg-[#1A1A1A] border ${
                errors.contact ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-neutral-850 focus:border-neutral-700'
              } rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-0 transition-all text-white placeholder-neutral-500`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>
      </div>

      {/* Итоговая стоимость и кнопки */}
      <div className="pt-4 border-t border-neutral-850 flex flex-col gap-4">
        <div className="text-[13px] text-neutral-350 leading-relaxed font-medium bg-neutral-900/40 border border-neutral-800 rounded-md px-4 py-2.5">
          Примерная стоимость: <span className="font-semibold text-[#E0FB4A] text-sm">от {formatPrice(price)} ₽</span>
          <span className="mx-2 text-neutral-600">•</span>
          Сроки: <span className="font-semibold text-white text-sm">от {days} {getDaysWord(days)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-[#FF5B23] text-white hover:bg-[#e04f1e] text-xs font-semibold py-3 px-5 rounded-sm transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[#FF5B23]/30 text-white bg-transparent transition-all duration-300 hover:border-[#FF5B23] hover:text-white hover:bg-[#FF5B23]/5 text-xs font-semibold py-3 px-5 rounded-sm text-center"
          >
            Нужна консультация
          </a>
        </div>
        {submitError && (
          <div className="text-red-500 text-sm mt-3">{submitError}</div>
        )}
      </div>
    </div>
  );
}

function Calculator({ service, onSendSuccess, isCalcOpen }) {
  if (service.number === '01') {
    return <TildaCalculator service={service} onSendSuccess={onSendSuccess} isCalcOpen={isCalcOpen} />;
  }
  if (service.number === '02') {
    return <RedesignCalculator service={service} onSendSuccess={onSendSuccess} isCalcOpen={isCalcOpen} />;
  }
  if (service.number === '03') {
    return <AICalculator service={service} />;
  }
  if (service.number === '04') {
    return <FigmaCalculator service={service} onSendSuccess={onSendSuccess} isCalcOpen={isCalcOpen} />;
  }
  return <DefaultCalculator service={service} onSendSuccess={onSendSuccess} />;
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
              {isCalcOpen 
                ? 'Скрыть подробности' 
                : service.number === '03' ? 'Посмотреть тарифы' : 'Рассчитать стоимость'}
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
        if (activeCalculator === '03') {
          const target = document.getElementById('tariffs-heading');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          const target = document.getElementById(`service-card-${activeCalculator}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
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
      viewport={{ once: true, margin: "-100px" }}
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
          viewport={{ once: true, margin: "-100px" }}
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
        viewport={{ once: true, margin: "-100px" }}
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
