import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Code, RefreshCw, Send, X, CheckCircle2, Layout, Files, FileText } from 'lucide-react';
import contentData from '../contentData';
import ProjectCart from './ProjectCart';
import { flyChipToCart } from '../utils/flyToCart';

const TILDA_CART_ICON_KEYS = {
  siteType: 'layout',
  pagesCount: 'files',
  contentReady: 'fileText',
};

// НАСТРОЙКА TELEGRAM БОТА
// Вставьте ваш токен бота и ID чата для активации отправки заявок в Telegram
const TG_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
const TG_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";
const TELEGRAM_CONSULT_URL = 'https://t.me/ksen_web';

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

const sendTelegramMessage = async (messageText) => {
  if (!TG_TOKEN || TG_TOKEN.startsWith("YOUR_")) {
    console.warn("Telegram Bot token is not configured. Simulating success...");
    return new Promise((resolve) => setTimeout(() => resolve(true), 800));
  }
  
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });
    return response.ok;
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
    return false;
  }
};

const SegmentedControl = ({ label, options, val, setVal }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
    <div
      className="grid gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setVal(opt.value)}
          className={`text-center py-2 px-1 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
            val === opt.value
              ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

function getOptionButtonClass(isSelected, isFirstHint) {
  if (isSelected) {
    return 'bg-white text-zinc-950 shadow-sm border border-zinc-900';
  }
  if (isFirstHint) {
    return 'text-zinc-600 border-2 border-dashed border-zinc-300 bg-transparent hover:border-zinc-400 hover:text-zinc-900';
  }
  return 'text-zinc-500 border border-transparent hover:text-zinc-900 hover:bg-zinc-200/40';
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
    { value: 'individual_landing', label: 'Индивидуальный Лендинг', price: 30000, days: 7, description: 'одностраничный сайт с уникальным дизайном в Zero-блоках' },
    { value: 'template_site', label: 'Сайт на шаблонах Tilda', price: 20000, days: 5, description: 'быстрый старт на стандартных блоках с кастомизацией под стиль' },
    { value: 'multipage_shop', label: 'Многостраничный сайт / Магазин', price: 50000, days: 15, description: 'уникальный дизайн, сложная структура' }
  ];

  const pagesOptions = [
    { value: '1_page', label: '1 страница', multiplier: 1, extraDays: 0, description: 'подходит для лендинга' },
    { value: '2_5_pages', label: 'От 2 до 5 страниц', multiplier: 1.3, extraDays: 5, description: '' },
    { value: '5_10_pages', label: 'От 5 до 10 страниц', multiplier: 1.6, extraDays: 10, description: '' },
    { value: 'more_10_pages', label: 'Более 10 страниц / Каталог', multiplier: 2.0, extraDays: 15, description: '' }
  ];

  const contentReadyOptions = [
    { value: 'ready', label: 'У меня есть всё готовое', multiplier: 1, extraDays: 0, description: 'тексты, фотографии, фирменный стиль' },
    { value: 'partial', label: 'Материалы есть частично', multiplier: 1.2, extraDays: 3, description: 'потребуется помощь в доработке или структурировании' },
    { value: 'none', label: 'Ничего нет', multiplier: 1.4, extraDays: 7, description: 'нужна разработка структуры и текстов с нуля' }
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
      alert('Пожалуйста, выберите все параметры проекта в конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const siteTypeLabels = siteTypeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const pagesLabels = pagesOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const contentReadyLabels = contentReadyOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Расчет Tilda)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

<b>Услуга:</b> ${service.title}
<b>Выбранные параметры:</b>
• Тип сайта: <b>${siteTypeLabels[siteType]}</b>
• Количество страниц: <b>${pagesLabels[pagesCount]}</b>
• Готовность контента: <b>${contentReadyLabels[contentReady]}</b>
• Дополнительные пожелания: <b>${comments || 'Нет'}</b>

<b>Примерная стоимость:</b> от ${formatPrice(price)} руб.
<b>Сроки:</b> от ${days} ${getDaysWord(days)}

✅ <b>Действие:</b> Подтверждение расчета
    `.trim();

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я свяжусь с вами в ближайшее время для уточнения деталей. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess(customSuccessMsg);
        setName('');
        setContact('');
        setComments('');
      } else {
        alert('Ошибка при отправке. Пожалуйста, проверьте настройки токена бота.');
      }
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при отправке заявки.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-950 border-b border-zinc-200/50 pb-3">
        Конфигуратор проекта
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 1: ТИП САЙТА И ДИЗАЙН-КОНЦЕПЦИЯ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {siteTypeOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('siteType', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    siteType === opt.value,
                    siteType === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activeSiteType?.description ?? siteTypeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 2: КОЛИЧЕСТВО СТРАНИЦ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {pagesOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('pagesCount', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    pagesCount === opt.value,
                    pagesCount === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activePages?.description ?? pagesOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 3: ГОТОВНОСТЬ КОНТЕНТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {contentReadyOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('contentReady', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    contentReady === opt.value,
                    contentReady === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-zinc-200/50">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Свободные пожелания
          </span>
          <textarea
            rows={4}
            placeholder="Например: Нужна интеграция с CRM и личный кабинет..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.contact ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-zinc-950 text-white hover:bg-zinc-800 text-sm font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100 text-sm font-semibold py-3 rounded-lg transition-all duration-200 text-center"
          >
            Нужна консультация
          </a>
        </div>
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
    { value: 'outdated', label: 'Устарел дизайн', price: 20000, days: 0, description: 'обновим визуальный стиль сайта и сделаем его современным' },
    { value: 'mobile_ux', label: 'Плохой мобильный UX', price: 25000, days: 2, description: 'исправим ошибки отображения на телефонах и планшетах' },
    { value: 'no_leads', label: 'Нет заявок', price: 30000, days: 4, description: 'проработаем структуру, логику и офферы для роста конверсии' }
  ];

  const volumeOptions = [
    { value: 'landing', label: 'Одностраничный сайт', multiplier: 1.0, extraDays: 0, description: 'подходит для лендинга' },
    { value: 'multipage', label: 'До 5 страниц', multiplier: 1.4, extraDays: 3, description: 'подходит для сайтов компаний' },
    { value: 'large', label: 'Крупный сайт / Магазин', multiplier: 1.8, extraDays: 7, description: 'более 5 страниц или каталог' }
  ];

  const depthOptions = [
    { value: 'visual_update', label: 'Визуальное обновление', multiplier: 1.0, extraDays: 0, description: 'тексты и структура остаются прежними, меняется только дизайн' },
    { value: 'full_redesign', label: 'Полный редизайн UX/UI', multiplier: 1.3, extraDays: 3, description: 'исправление логики, новая структура и дизайн в Figma с нуля' },
    { value: 'full_rewrite', label: 'Полная переработка смыслов', multiplier: 1.6, extraDays: 5, description: 'пишем тексты и структуру заново под новые задачи' }
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
      alert('Пожалуйста, выберите все параметры проекта в конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const problemLabels = problemOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const volumeLabels = volumeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const depthLabels = depthOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `<b>🔔 Новая заявка с сайта-портфолио (Редизайн сайта)</b>\n\n<b>Клиент:</b> ${name}\n<b>Контакт:</b> ${contact}\n\n<b>Услуга:</b> ${service.title}\n<b>Выбранные параметры:</b>\n• Проблема сайта: <b>${problemLabels[problemType]}</b>\n• Объем страниц: <b>${volumeLabels[volume]}</b>\n• Глубина переработки: <b>${depthLabels[depth]}</b>\n• Дополнительные пожелания: <b>${comments || 'Нет'}</b>\n\n<b>Примерная стоимость:</b> от ${formatPrice(price)} руб.\n<b>Сроки:</b> от ${days} ${getDaysWord(days)}\n\n✅ <b>Действие:</b> Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я изучу ваш текущий сайт и свяжусь в ближайшее время. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess(customSuccessMsg);
        setName('');
        setContact('');
        setComments('');
      } else {
        alert('Ошибка при отправке. Пожалуйста, проверьте настройки токена бота.');
      }
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при отправке заявки.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-955 border-b border-zinc-200/50 pb-3">
        Конфигуратор редизайна
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 1: ТЕКУЩИЕ ПРОБЛЕМЫ САЙТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {problemOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('problemType', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    problemType === opt.value,
                    problemType === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activeProblem?.description ?? problemOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 2: ОБЪЕМ СТРАНИЦ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {volumeOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('volume', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    volume === opt.value,
                    volume === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activeVolume?.description ?? volumeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 3: ГЛУБИНА ПЕРЕРАБОТКИ СМЫСЛОВ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {depthOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('depth', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    depth === opt.value,
                    depth === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-zinc-200/50">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Дополнительные пожелания и ссылка на текущий сайт
          </span>
          <textarea
            rows={4}
            placeholder="Укажите ссылку на текущий сайт и напишите пожелания..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.contact ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-zinc-950 text-white hover:bg-zinc-800 text-sm font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100 text-sm font-semibold py-3 rounded-lg transition-all duration-200 text-center"
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
    { value: 'website_design', label: 'Дизайн веб-сайта', price: 20000, days: 0, description: 'уникальный стиль, адаптивные макеты для ПК и мобильных устройств' },
    { value: 'app_interface', label: 'Интерфейс приложения', price: 35000, days: 5, description: 'UX-сценарии, личные кабинеты, дашборды и экраны MVP' }
  ];

  const complexityOptions = [
    { value: 'small', label: 'До 5 экранов', multiplier: 1.0, extraDays: 0, description: 'подходит для простых сайтов и лендингов' },
    { value: 'medium', label: 'От 5 до 15 экранов', multiplier: 1.4, extraDays: 5, description: 'подходит для сайтов компаний и небольших сервисов' },
    { value: 'ecosystem', label: 'Более 15 экранов', multiplier: 1.8, extraDays: 10, description: 'сложная экосистема, детальный интерактивный прототип' }
  ];

  const specOptions = [
    { value: 'has_spec', label: 'Есть готовый UI-кит / ТЗ', multiplier: 1.0, extraDays: 0, description: 'работа по готовым компонентам и готовой структуре' },
    { value: 'no_spec', label: 'Без UI-кита / ТЗ с нуля', multiplier: 1.3, extraDays: 5, description: 'совместная разработка дизайн-системы и проектирование логики' }
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
      alert('Пожалуйста, выберите все параметры проекта в конфигураторе.');
      return;
    }
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const typeLabels = typeOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const complexityLabels = complexityOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});
    const specLabels = specOptions.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

    const messageText = `<b>🔔 Новая заявка с сайта-портфолио (Дизайн в Figma)</b>\n\n<b>Клиент:</b> ${name}\n<b>Контакт:</b> ${contact}\n\n<b>Услуга:</b> ${service.title}\n<b>Выбранные параметры:</b>\n• Тип дизайна: <b>${typeLabels[designType]}</b>\n• Объем и сложность: <b>${complexityLabels[complexity]}</b>\n• UI-кит / ТЗ: <b>${specLabels[specStatus]}</b>\n• Дополнительные пожелания: <b>${comments || 'Нет'}</b>\n\n<b>Примерная стоимость (только дизайн):</b> от ${formatPrice(price)} руб.\n<b>Сроки:</b> от ${days} ${getDaysWord(days)}\n\n✅ <b>Действие:</b> Подтверждение расчета`;

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        const customSuccessMsg = `Расчет получен! Я проанализирую вашу задачу и свяжусь в ближайшее время для обсуждения концепции. Мой номер телефона: ${contentData.contacts.phone}, Telegram: ${TELEGRAM_CONSULT_URL}`;
        onSendSuccess(customSuccessMsg);
        setName('');
        setContact('');
        setComments('');
      } else {
        alert('Ошибка при отправке. Пожалуйста, проверьте настройки токена бота.');
      }
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при отправке заявки.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-955 border-b border-zinc-200/50 pb-3">
        Конфигуратор дизайна в Figma
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:min-h-[420px]">
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 1: ТИП ИНТЕРФЕЙСА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {typeOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('designType', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    designType === opt.value,
                    designType === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activeType?.description ?? typeOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 2: КОЛИЧЕСТВО УНИКАЛЬНЫХ ЭКРАНОВ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {complexityOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('complexity', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    complexity === opt.value,
                    complexity === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
              {activeComplexity?.description ?? complexityOptions[0].description}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              ШАГ 3: НАЛИЧИЕ ГОТОВОГО UI-КИТА
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-200/30">
              {specOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleOptionChange('specStatus', opt.value, e)}
                  className={`text-center py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${getOptionButtonClass(
                    specStatus === opt.value,
                    specStatus === null && index === 0
                  )}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium px-1">
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2 border-t border-zinc-200/50">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Описание проекта и ссылки на референсы
          </span>
          <textarea
            rows={4}
            placeholder="Опишите ваши пожелания, стиль, референсы..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.contact ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100 text-sm font-semibold py-3 rounded-lg transition-all duration-200 text-center"
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
      price: 'от 40 000 ₽',
      desc: 'Создание личных кабинетов, баз данных, дашбордов и сложных интерактивных систем.',
      features: ['Кастомный Frontend и Backend', 'Интеграция баз данных (PostgreSQL/Supabase)', 'Личные кабинеты пользователей', 'Админ-панель управления']
    },
    {
      title: 'Мобильное MVP',
      price: 'от 40 000 ₽',
      desc: 'Разработка первых версий мобильных приложений для тестов гипотез на реальных пользователях.',
      features: ['Адаптивное PWA/мобильное решение', 'Базовые функции авторизации', 'Push-уведомления и формы ввода', 'Быстрый запуск для тестирования']
    },
    {
      title: 'Платформа / SaaS',
      price: 'от 55 000 ₽',
      desc: 'Разработка многопользовательских сервисов, обучающих ИТ-платформ с разветвленной логикой.',
      features: ['Сложные алгоритмы и сценарии', 'Интеграция платежных шлюзов', 'Разделение прав доступа', 'Подготовка к масштабированию']
    }
  ];

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6 w-full">
      <div className="text-sm font-semibold text-zinc-955 border-b border-zinc-200/50 pb-3 flex justify-between items-center flex-wrap gap-2">
        <span>Тарифы и направления разработки</span>
        <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200/30 px-2.5 py-1 rounded-lg">
          Срок: Рассчитывается индивидуально
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-white border border-zinc-200/60 rounded-2xl p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-zinc-300 transition-all duration-300">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-1">{p.title}</h4>
              <span className="inline-block text-xs font-extrabold text-zinc-955 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1 mb-3">
                {p.price}
              </span>
              <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed mb-4">{p.desc}</p>
            </div>
            <ul className="space-y-2 border-t border-zinc-150/50 pt-3">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[10.5px] text-zinc-650 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-200/50 flex flex-col items-center gap-3">
        <p className="text-xs text-zinc-500 font-medium text-center">
          Разработка сложных цифровых продуктов требует детального обсуждения технического задания и архитектуры.
        </p>
        <a
          href={TELEGRAM_CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Сбор выбранных опций для сообщения
    let selectedOptionsList = '';
    if (service.calculator.options) {
      service.calculator.options.forEach(opt => {
        const selectedVal = selectedOptions[opt.id];
        const choice = opt.choices.find(c => c.value === selectedVal);
        if (choice) {
          selectedOptionsList += `• ${opt.label}: <b>${choice.label}</b> (+${formatPrice(choice.price)} ₽)\n`;
        }
      });
    }

    const messageText = `
<b>🔔 Новая заявка с сайта-портфолио</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

<b>Услуга:</b> ${service.title}
<b>Выбранные опции:</b>
${selectedOptionsList || 'Нет дополнительных опций'}
<b>Итоговая цена:</b> от ${formatPrice(price)} руб.
<b>Сроки:</b> от ${days} ${getDaysWord(days)}

✅ <b>Действие:</b> Подтверждение расчета
    `.trim();

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        onSendSuccess();
        setName('');
        setContact('');
      } else {
        alert('Ошибка при отправке. Пожалуйста, проверьте настройки токена бота.');
      }
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при отправке заявки.');
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
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-950 border-b border-zinc-200/50 pb-3">
        Конфигуратор проекта
      </div>

      <div className="flex flex-col gap-5">
        {service.calculator.options && service.calculator.options.map((opt) => {
          if (isYesNoOption(opt)) {
            const isChecked = selectedOptions[opt.id] === 'yes';
            const yesChoice = opt.choices[1];
            return (
              <div key={opt.id} className="flex flex-col gap-1.5">
                <label className="flex items-start gap-3 p-3.5 bg-white border border-zinc-200/40 rounded-xl hover:border-zinc-300 cursor-pointer transition-all shadow-sm">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleOptionChange(opt.id, e.target.checked ? 'yes' : 'no')}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 focus:ring-offset-0 focus:outline-none mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-850">{opt.label}</span>
                    {yesChoice.price > 0 && (
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
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
      <div className="flex flex-col gap-4 pt-4 border-t border-zinc-200/50">
        <div className="text-xs font-semibold text-zinc-950">
          Контактные данные для расчета
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                errors.contact ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400'
              } rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400`}
            />
            {errors.contact && <span className="text-red-500 text-[10px] mt-1 block">{errors.contact}</span>}
          </div>
        </div>
      </div>

      {/* Итоговая стоимость и кнопки */}
      <div className="pt-4 border-t border-zinc-200/50 flex flex-col gap-4">
        <div className="text-[13px] text-zinc-600 leading-relaxed font-medium bg-zinc-100/50 border border-zinc-200/20 rounded-xl px-4 py-2.5">
          Примерная стоимость: <span className="font-semibold text-zinc-950 text-sm">от {formatPrice(price)} руб.</span>
          <span className="mx-2 text-zinc-350">•</span>
          Сроки: <span className="font-semibold text-zinc-950 text-sm">от {days} {getDaysWord(days)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <a
            href={TELEGRAM_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-zinc-200 text-zinc-650 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-center"
          >
            Нужна консультация
          </a>
        </div>
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
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-2xl border border-zinc-200/30 flex flex-col justify-between p-4 overflow-hidden select-none">
        {/* A mini-browser mockup */}
        <div className="w-full bg-white border border-zinc-200/60 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200/60 px-3 py-2 flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
          </div>
          <div className="p-3 flex-1 flex flex-col gap-2">
            <div className="h-3 bg-zinc-100 rounded-md w-3/4 animate-pulse" />
            <div className="h-2 bg-zinc-50 rounded-md w-1/2" />
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="h-8 bg-zinc-50 rounded-md border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-medium">zero</div>
              <div className="h-8 bg-zinc-50 rounded-md border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-medium">zero</div>
              <div className="h-8 bg-zinc-50 rounded-md border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-medium">zero</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '02') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-2xl border border-zinc-200/30 flex items-center justify-center p-4 overflow-hidden select-none">
        <div className="relative w-full h-full flex items-center justify-center gap-2">
          {/* Left: Old site mockup */}
          <div className="w-5/12 bg-white border border-zinc-100 rounded-lg shadow-sm p-2 rotate-[-4deg] opacity-60 scale-90 flex flex-col gap-1.5 animate-pulse">
            <div className="h-2 bg-zinc-200 rounded w-4/5" />
            <div className="h-1.5 bg-zinc-100 rounded w-3/5" />
            <div className="h-8 bg-zinc-50 rounded border border-dashed border-zinc-200" />
          </div>
          {/* Arrow in middle */}
          <div className="text-zinc-300 font-light text-base shrink-0">→</div>
          {/* Right: New redesigned site mockup */}
          <div className="w-5/12 bg-white border border-zinc-200 rounded-lg shadow-md p-2.5 rotate-[2deg] scale-100 flex flex-col gap-2 relative z-10">
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
            <div className="h-2 bg-zinc-800 rounded w-4/5" />
            <div className="h-1 bg-zinc-450 rounded w-2/5" />
            <div className="h-8 bg-zinc-900 rounded flex items-center justify-center text-[9px] text-white font-bold">
              10%
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '03') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-2xl border border-zinc-200/30 flex flex-col justify-between p-4 overflow-hidden select-none">
        {/* A dashboard UI with code info */}
        <div className="w-full bg-white border border-zinc-200/60 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200/60 px-3 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-zinc-500 font-mono">ai-agent.js</span>
            </div>
            <div className="w-2 h-2 rounded bg-zinc-200" />
          </div>
          <div className="p-3 flex-1 flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 text-xs shrink-0">⚡</div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-2 bg-zinc-800 rounded w-1/3" />
                <div className="h-1.5 bg-zinc-400 rounded w-2/3" />
              </div>
            </div>
            <div className="border-t border-zinc-100 my-0.5" />
            <div className="flex justify-between items-center text-[9px] text-zinc-500">
              <span>Prompt processing...</span>
              <span className="font-mono text-zinc-400">120ms</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (number === '04') {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-2xl border border-zinc-200/30 flex items-center justify-center p-4 overflow-hidden select-none">
        <div className="w-full h-full bg-white border border-zinc-200/60 rounded-lg shadow-sm p-3 flex flex-col gap-2 relative">
          {/* Visual designer vector mockup */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
            <span className="text-[9px] text-zinc-400 font-mono">Figma Artboard</span>
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {/* Overlapping vector shapes */}
            <div className="absolute w-10 h-10 rounded-full border border-indigo-500 bg-indigo-50/20 flex items-center justify-center">
              <div className="w-1 h-1 bg-white border border-indigo-500 absolute -top-0.5 left-[17px]" />
              <div className="w-1 h-1 bg-white border border-indigo-500 absolute -bottom-0.5 left-[17px]" />
              <div className="w-1 h-1 bg-white border border-indigo-500 absolute -left-0.5 top-[17px]" />
              <div className="w-1 h-1 bg-white border border-indigo-500 absolute -right-0.5 top-[17px]" />
            </div>
            <div className="absolute w-7 h-7 rotate-45 border border-dashed border-emerald-500 bg-emerald-50/10" />
            
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
    <div id={`service-card-${service.number}`} className="group border border-zinc-100 rounded-2xl p-6 sm:p-8 hover:border-zinc-200 transition-all bg-white shadow-sm duration-300">
      {/* Two-column layout grid for header and parameters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
        
        {/* Left column (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div className="inline-flex items-center justify-center p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50 shrink-0">
                <IconComponent className="w-5 h-5 text-zinc-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider mb-0.5">{service.number}</span>
                <h3 className="text-xl md:text-2xl font-light text-zinc-900 leading-tight">{service.title}</h3>
              </div>
            </div>
            
            <p className="text-[14px] text-zinc-600 leading-relaxed max-w-[640px] mb-6">{service.brief}</p>
            
            {/* Mobile-only parameters (displayed statically, vertical stream) */}
            <div className="block md:hidden space-y-4 border-t border-zinc-100 pt-5 mt-5">
              {service.details.map((detail, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                    {detail.label}
                  </span>
                  <span className={`text-[13px] leading-relaxed ${
                    detail.label.toLowerCase().includes('срок') ? 'font-semibold text-zinc-900' : 'text-zinc-600'
                  }`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (always visible at bottom of left column) */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-zinc-100">
            <button
              onClick={onToggleCalc}
              className={`text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer ${
                isCalcOpen
                  ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {isCalcOpen 
                ? 'Скрыть подробности' 
                : service.number === '03' ? 'Посмотреть тарифы' : 'Рассчитать стоимость'}
            </button>
            <button
              onClick={() => window.open('https://t.me/ksen_web', '_blank')}
              className="border border-zinc-200 text-zinc-900 hover:bg-zinc-50 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
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
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 h-full flex flex-col justify-center space-y-4">
              {service.details.map((detail, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                    {detail.label}
                  </span>
                  <span className={`text-[13px] leading-relaxed ${
                    detail.label.toLowerCase().includes('срок') ? 'font-semibold text-zinc-900' : 'text-zinc-600'
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
          isCalcOpen ? 'max-h-[1500px] opacity-100 mt-6 pt-6 border-t border-zinc-100' : 'max-h-0 opacity-0 pointer-events-none'
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
      
      // Delay scroll to allow the calculator height to expand and DOM to update
      setTimeout(() => {
        const target = document.getElementById(`service-card-${targetNumber}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };
    
    window.addEventListener('open-calculator', handleOpenCalc);
    return () => window.removeEventListener('open-calculator', handleOpenCalc);
  }, []);

  return (
    <section id="services" className="py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
        {contentData.services.title}
      </h2>
      <p className="text-[15px] text-zinc-500 max-w-[640px] mb-12">
        {contentData.services.subtitle}
      </p>

      <div className="flex flex-col gap-6">
        {services.map((service) => (
          <ServiceCard 
            key={service.number} 
            service={service} 
            isCalcOpen={activeCalculator === service.number}
            onToggleCalc={() => {
              setActiveCalculator(prev => prev === service.number ? null : service.number);
            }}
            onSendSuccess={(message) => {
              setSuccessModalContent(message);
              setIsSuccessModalOpen(true);
            }}
          />
        ))}
      </div>

      {/* ===== ОКНО УСПЕХА (SUCCESS MODAL) ===== */}
      <div 
        className={`fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
          isSuccessModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`bg-white border border-zinc-100 rounded-2xl p-6 sm:p-8 max-w-[440px] w-full shadow-2xl relative flex flex-col items-center text-center gap-5 transition-all duration-300 transform ${
            isSuccessModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Кнопка закрытия */}
          <button 
            onClick={() => {
              setIsSuccessModalOpen(false);
              setSuccessModalContent(null);
            }}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Иконка успеха */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-zinc-950 mb-2">Заявка успешно отправлена!</h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              {successModalContent || 'Спасибо! Расчет стоимости или запрос на консультацию получен. Я свяжусь с вами в ближайшее время для обсуждения деталей.'}
            </p>
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col gap-3.5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Позвонить напрямую</span>
              <a href={`tel:${contentData.contacts.phone}`} className="text-sm sm:text-base font-bold text-zinc-950 hover:underline">
                {contentData.contacts.phone}
              </a>
            </div>
            <div className="border-t border-zinc-200/50 w-full"></div>
            <a
              href={contentData.contacts.buttons.telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-3 px-5 rounded-xl cursor-pointer w-full hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[0.5px] text-xs sm:text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Написать в Telegram напрямую</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
