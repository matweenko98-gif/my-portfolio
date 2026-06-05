import React, { useState, useEffect } from 'react';
import { Layers, Code, RefreshCw, Send, X, CheckCircle2 } from 'lucide-react';
import contentData from '../contentData';

// НАСТРОЙКА TELEGRAM БОТА
// Вставьте ваш токен бота и ID чата для активации отправки заявок в Telegram
const TG_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
const TG_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";

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

function TildaCalculator({ service, onSendSuccess }) {
  const [siteType, setSiteType] = useState('individual_landing');
  const [pagesCount, setPagesCount] = useState('1_page');
  const [contentReady, setContentReady] = useState('ready');
  const [comments, setComments] = useState('');
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getTildaPriceAndDays = (siteType, pagesCount, contentReady) => {
    let basePrice = 30000;
    let baseDays = 7;
    
    if (siteType === 'template_site') {
      basePrice = 20000;
      baseDays = 5;
    } else if (siteType === 'multipage_shop') {
      basePrice = 50000;
      baseDays = 15;
    }

    let pagesMultiplier = 1.0;
    let pagesDays = 0;
    if (pagesCount === '2_5_pages') {
      pagesMultiplier = 1.3;
      pagesDays = 5;
    } else if (pagesCount === '5_10_pages') {
      pagesMultiplier = 1.6;
      pagesDays = 10;
    } else if (pagesCount === 'more_10_pages') {
      pagesMultiplier = 2.0;
      pagesDays = 15;
    }

    let contentMultiplier = 1.0;
    let contentDays = 0;
    if (contentReady === 'partial') {
      contentMultiplier = 1.2;
      contentDays = 3;
    } else if (contentReady === 'none') {
      contentMultiplier = 1.4;
      contentDays = 7;
    }

    const price = Math.round(basePrice * pagesMultiplier * contentMultiplier);
    const days = baseDays + pagesDays + contentDays;

    return { price, days };
  };

  const { price, days } = getTildaPriceAndDays(siteType, pagesCount, contentReady);

  const handleSubmit = async (type) => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const siteTypeLabels = {
      individual_landing: 'Индивидуальный Лендинг',
      template_site: 'Сайт на шаблонах Tilda',
      multipage_shop: 'Многостраничный сайт / Магазин'
    };

    const pagesLabels = {
      '1_page': '1 страница',
      '2_5_pages': 'От 2 до 5 страниц',
      '5_10_pages': 'От 5 до 10 страниц',
      'more_10_pages': 'Более 10 страниц / Каталог товаров'
    };

    const contentReadyLabels = {
      ready: 'У меня есть всё готовое',
      partial: 'Материалы есть частично',
      none: 'Ничего нет'
    };

    let messageText = '';
    if (type === 'consultation') {
      messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Консультация)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

⚠️ <b>Примечание:</b> Клиент сомневается в выборе, нужна консультация.
      `.trim();
    } else {
      messageText = `
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
    }

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        if (type === 'consultation') {
          window.open('https://t.me/ksen_web', '_blank');
          setName('');
          setContact('');
        } else {
          const customSuccessMsg = `Расчет получен! Я свяжусь с вами в ближайшее время для уточнения деталей. Мой номер телефона: ${contentData.contacts.phone}, Telegram: https://t.me/ksen_web`;
          onSendSuccess(customSuccessMsg);
          setName('');
          setContact('');
          setComments('');
        }
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

  const siteTypeDescriptions = {
    individual_landing: 'одностраничный сайт с уникальным дизайном в Zero-блоках',
    template_site: 'быстрый старт на стандартных блоках с кастомизацией под стиль',
    multipage_shop: 'уникальный дизайн, сложная структура'
  };

  const pagesDescriptions = {
    '1_page': 'подходит для лендинга',
    '2_5_pages': '',
    '5_10_pages': '',
    'more_10_pages': ''
  };

  const contentReadyDescriptions = {
    ready: 'тексты, фотографии, фирменный стиль',
    partial: 'потребуется помощь в доработке или структурировании',
    none: 'нужна разработка структуры и текстов с нуля'
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-950 border-b border-zinc-200/50 pb-3">
        Конфигуратор проекта
      </div>

      <div className="flex flex-col gap-5">
        {/* ШАГ 1: ТИП САЙТА И ДИЗАЙН-КОНЦЕПЦИЯ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 1: ТИП САЙТА И ДИЗАЙН-КОНЦЕПЦИЯ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'individual_landing', label: 'Индивидуальный Лендинг' },
              { value: 'template_site', label: 'Сайт на шаблонах Tilda' },
              { value: 'multipage_shop', label: 'Многостраничный сайт / Магазин' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSiteType(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  siteType === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {siteTypeDescriptions[siteType] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {siteTypeDescriptions[siteType]}
            </span>
          )}
        </div>

        {/* ШАГ 2: КОЛИЧЕСТВО СТРАНИЦ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 2: КОЛИЧЕСТВО СТРАНИЦ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: '1_page', label: '1 страница' },
              { value: '2_5_pages', label: 'От 2 до 5 страниц' },
              { value: '5_10_pages', label: 'От 5 до 10 страниц' },
              { value: 'more_10_pages', label: 'Более 10 страниц / Каталог' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPagesCount(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  pagesCount === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {pagesDescriptions[pagesCount] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {pagesDescriptions[pagesCount]}
            </span>
          )}
        </div>

        {/* ШАГ 3: ГОТОВНОСТЬ КОНТЕНТА */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 3: ГОТОВНОСТЬ КОНТЕНТА
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'ready', label: 'У меня есть всё готовое' },
              { value: 'partial', label: 'Материалы есть частично' },
              { value: 'none', label: 'Ничего нет' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContentReady(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  contentReady === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {contentReadyDescriptions[contentReady] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {contentReadyDescriptions[contentReady]}
            </span>
          )}
        </div>

        {/* ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ
          </span>
          <label className="block text-[11px] text-zinc-500 font-medium leading-relaxed px-1">
            Расскажите коротко о вашем проекте или укажите детали, которых нет в списке (например, ссылки на примеры сайтов)
          </label>
          <textarea
            rows={3}
            placeholder="Например: Нужна интеграция с CRM и личный кабинет..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none h-24"
          />
        </div>
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

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('calculation')}
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('consultation')}
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Нужна консультация'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RedesignCalculator({ service, onSendSuccess }) {
  const [redesignDepth, setRedesignDepth] = useState('visual_update');
  const [projectVolume, setProjectVolume] = useState('landing');
  const [contentStatus, setContentStatus] = useState('keep_all');
  const [comments, setComments] = useState('');
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getPrice = (depth, volume, content) => {
    let basePrice = 20000;
    if (depth === 'full_redesign') {
      basePrice = 30000;
    }

    let volumeMultiplier = 1.0;
    if (volume === 'multipage') {
      volumeMultiplier = 1.5;
    } else if (volume === 'large') {
      volumeMultiplier = 2.0;
    }

    let contentMultiplier = 1.0;
    if (content === 'partial_edit') {
      contentMultiplier = 1.2;
    } else if (content === 'full_rewrite') {
      contentMultiplier = 1.5;
    }

    return Math.round(basePrice * volumeMultiplier * contentMultiplier);
  };

  const price = getPrice(redesignDepth, projectVolume, contentStatus);

  const handleSubmit = async (type) => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const depthLabels = {
      visual_update: 'Визуальное обновление стиля',
      full_redesign: 'Полный редизайн с перепроектированием (UX/UI)'
    };

    const volumeLabels = {
      landing: 'Одностраничный сайт (Лендинг)',
      multipage: 'Многостраничный сайт (До 5 страниц)',
      large: 'Крупный сайт / Интернет-магазин (Более 5 страниц или большой каталог)'
    };

    const contentLabels = {
      keep_all: 'Контент переносим полностью',
      partial_edit: 'Нужна частичная доработка',
      full_rewrite: 'Полная переработка смыслов'
    };

    let messageText = '';
    if (type === 'consultation') {
      messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Консультация - Редизайн)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

⚠️ <b>Примечание:</b> Клиент хочет обсудить аудит старого сайта голосом.
      `.trim();
    } else {
      messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Редизайн сайта)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

<b>Услуга:</b> ${service.title}
<b>Выбранные параметры:</b>
• Формат и глубина редизайна: <b>${depthLabels[redesignDepth]}</b>
• Объем текущего проекта: <b>${volumeLabels[projectVolume]}</b>
• Наличие контента и структуры: <b>${contentLabels[contentStatus]}</b>
• Ссылка и пожелания: <b>${comments || 'Не указаны'}</b>

<b>Примерная стоимость:</b> от ${formatPrice(price)} руб.

✅ <b>Действие:</b> Подтверждение расчета
      `.trim();
    }

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        if (type === 'consultation') {
          window.open('https://t.me/ksen_web', '_blank');
          setName('');
          setContact('');
        } else {
          const customSuccessMsg = `Расчет получен! Я изучу ваш текущий сайт и свяжусь в ближайшее время. Мой номер телефона: ${contentData.contacts.phone}, Telegram: https://t.me/ksen_web`;
          onSendSuccess(customSuccessMsg);
          setName('');
          setContact('');
          setComments('');
        }
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

  const depthDescriptions = {
    visual_update: 'перенос структуры на Tilda, освежение дизайна, настройка шрифтов, цветов и адаптивности',
    full_redesign: 'глубокий анализ, новая структура в Figma с нуля, исправление логики и сборка на Tilda'
  };

  const volumeDescriptions = {
    landing: 'одностраничный сайт (лендинг)',
    multipage: 'многостраничный сайт (до 5 страниц)',
    large: 'крупный сайт / интернет-магазин (более 5 страниц или каталог)'
  };

  const contentDescriptions = {
    keep_all: 'тексты, фото и структура остаются прежними, меняется только визуал',
    partial_edit: 'часть текстов обновим, добавим новые блоки или разделы',
    full_rewrite: 'тексты и структура пишем заново под новые задачи бизнеса'
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-950 border-b border-zinc-200/50 pb-3">
        Конфигуратор редизайна
      </div>

      <div className="flex flex-col gap-5">
        {/* ШАГ 1: ФОРМАТ И ГЛУБИНА РЕДИЗАЙНА */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 1: ФОРМАТ И ГЛУБИНА РЕДИЗАЙНА
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'visual_update', label: 'Визуальное обновление стиля' },
              { value: 'full_redesign', label: 'Полный редизайн (UX/UI)' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRedesignDepth(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  redesignDepth === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {depthDescriptions[redesignDepth] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {depthDescriptions[redesignDepth]}
            </span>
          )}
        </div>

        {/* ШАГ 2: ОБЪЕМ ТЕКУЩЕГО ПРОЕКТА */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 2: ОБЪЕМ ТЕКУЩЕГО ПРОЕКТА
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'landing', label: 'Лендинг' },
              { value: 'multipage', label: 'До 5 страниц' },
              { value: 'large', label: 'Крупный сайт / Магазин' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProjectVolume(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  projectVolume === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {volumeDescriptions[projectVolume] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {volumeDescriptions[projectVolume]}
            </span>
          )}
        </div>

        {/* ШАГ 3: НАЛИЧИЕ КОНТЕНТА И СТРУКТУРЫ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 3: НАЛИЧИЕ КОНТЕНТА И СТРУКТУРЫ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'keep_all', label: 'Контент переносим' },
              { value: 'partial_edit', label: 'Частичная доработка' },
              { value: 'full_rewrite', label: 'Полная переработка' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContentStatus(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  contentStatus === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {contentDescriptions[contentStatus] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {contentDescriptions[contentStatus]}
            </span>
          )}
        </div>

        {/* ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ И ССЫЛКА */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ И ССЫЛКА
          </span>
          <label className="block text-[11px] text-zinc-500 font-medium leading-relaxed px-1">
            Укажите ссылку на ваш текущий сайт и расскажите, что именно вас в нем не устраивает или какие задачи нужно решить
          </label>
          <textarea
            rows={3}
            placeholder="Например: www.mysite.com. Сайт долго грузится, не работает с мобильных и дизайн выглядит устаревшим..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none h-24"
          />
        </div>
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
          Примерная стоимость редизайна: <span className="font-semibold text-zinc-950 text-sm">от {formatPrice(price)} руб.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('calculation')}
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('consultation')}
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Нужна консультация'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FigmaCalculator({ service, onSendSuccess }) {
  const [figmaType, setFigmaType] = useState('website_design');
  const [figmaComplexity, setFigmaComplexity] = useState('small');
  const [figmaSpec, setFigmaSpec] = useState('has_spec');
  const [comments, setComments] = useState('');
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getPrice = (type, complexity, spec) => {
    let basePrice = 20000;
    if (type === 'app_interface') {
      basePrice = 35000;
    }

    let complexityMultiplier = 1.0;
    if (complexity === 'medium') {
      complexityMultiplier = 1.4;
    } else if (complexity === 'ecosystem') {
      complexityMultiplier = 1.8;
    }

    let specMultiplier = 1.0;
    if (spec === 'no_spec') {
      specMultiplier = 1.3;
    }

    return Math.round(basePrice * complexityMultiplier * specMultiplier);
  };

  const price = getPrice(figmaType, figmaComplexity, figmaSpec);

  const handleSubmit = async (type) => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Пожалуйста, введите имя';
    if (!contact.trim()) newErrors.contact = 'Пожалуйста, укажите Telegram или телефон';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const typeLabels = {
      website_design: 'Дизайн веб-сайта / Лендинга',
      app_interface: 'Интерфейс приложения / Платформы'
    };

    const complexityLabels = {
      small: 'Небольшой проект (До 5 ключевых экранов или страниц сайта)',
      medium: 'Средний проект (От 5 до 15 экранов, базовая интерактивная карта переходов)',
      ecosystem: 'Сложная экосистема (Более 15 экранов, детальный интерактивный прототип, развернутая дизайн-система)'
    };

    const specLabels = {
      has_spec: 'Есть четкое ТЗ и прототип (Структура страниц понятна, есть готовое описание логики и контент)',
      no_spec: 'Есть только идея и референсы (Потребуется совместное проведение аналитики, проектирование логики и структуры с нуля)'
    };

    let messageText = '';
    if (type === 'consultation') {
      messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Консультация - Дизайн в Figma)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

⚠️ <b>Примечание:</b> Клиент хочет обсудить проектирование интерфейса голосом.
      `.trim();
    } else {
      messageText = `
<b>🔔 Новая заявка с сайта-портфолио (Дизайн в Figma)</b>

<b>Клиент:</b> ${name}
<b>Контакт:</b> ${contact}

<b>Услуга:</b> ${service.title}
<b>Выбранные параметры:</b>
• Тип продукта: <b>${typeLabels[figmaType]}</b>
• Объем и сложность: <b>${complexityLabels[figmaComplexity]}</b>
• Исходные данные и ТЗ: <b>${specLabels[figmaSpec]}</b>
• Описание и референсы: <b>${comments || 'Не указаны'}</b>

<b>Примерная стоимость:</b> от ${formatPrice(price)} руб.

✅ <b>Действие:</b> Подтверждение расчета
      `.trim();
    }

    try {
      const success = await sendTelegramMessage(messageText);
      if (success) {
        if (type === 'consultation') {
          window.open('https://t.me/ksen_web', '_blank');
          setName('');
          setContact('');
        } else {
          const customSuccessMsg = `Расчет получен! Я проанализирую вашу задачу и свяжусь в ближайшее время для обсуждения концепции. Мой номер телефона: ${contentData.contacts.phone}, Telegram: https://t.me/ksen_web`;
          onSendSuccess(customSuccessMsg);
          setName('');
          setContact('');
          setComments('');
        }
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

  const typeDescriptions = {
    website_design: 'разработка уникальной визуальной концепции, UI-кита и адаптивных макетов для ПК и мобильных устройств. Базовая стоимость: от 20 000 руб.',
    app_interface: 'проектирование пользовательских сценариев, UX-логики, сложных личных кабинетов, дашбордов и экранов MVP. Базовая стоимость: от 35 000 руб.'
  };

  const complexityDescriptions = {
    small: 'до 5 ключевых экранов или страниц сайта',
    medium: 'от 5 до 15 экранов, базовая интерактивная карта переходов',
    ecosystem: 'более 15 экранов, детальный интерактивный прототип, развернутая дизайн-система'
  };

  const specDescriptions = {
    has_spec: 'структура страниц понятна, есть готовое описание логики и контент',
    no_spec: 'совместное проведение аналитики, проектирование логики и структуры с нуля'
  };

  return (
    <div className="bg-zinc-50/70 border border-zinc-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
      <div className="text-sm font-semibold text-zinc-950 border-b border-zinc-200/50 pb-3">
        Конфигуратор дизайна в Figma
      </div>

      <div className="flex flex-col gap-5">
        {/* ШАГ 1: ТИП ПРОДУКТА И ПРОЕКТИРОВАНИЕ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 1: ТИП ПРОДУКТА И ПРОЕКТИРОВАНИЕ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'website_design', label: 'Дизайн веб-сайта / Лендинга' },
              { value: 'app_interface', label: 'Интерфейс приложения / Платформы' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFigmaType(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  figmaType === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {typeDescriptions[figmaType] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {typeDescriptions[figmaType]}
            </span>
          )}
        </div>

        {/* ШАГ 2: ОБЪЕМ И СЛОЖНОСТЬ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 2: ОБЪЕМ И СЛОЖНОСТЬ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'small', label: 'Небольшой проект' },
              { value: 'medium', label: 'Средний проект' },
              { value: 'ecosystem', label: 'Сложная экосистема' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFigmaComplexity(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  figmaComplexity === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {complexityDescriptions[figmaComplexity] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {complexityDescriptions[figmaComplexity]}
            </span>
          )}
        </div>

        {/* ШАГ 3: ИСХОДНЫЕ ДАННЫЕ И ТЕХ. ЗАДАНИЕ */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 3: ИСХОДНЫЕ ДАННЫЕ И ТЕХ. ЗАДАНИЕ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/30">
            {[
              { value: 'has_spec', label: 'Есть четкое ТЗ и прототип' },
              { value: 'no_spec', label: 'Есть только идея и референсы' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFigmaSpec(opt.value)}
                className={`text-center py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  figmaSpec === opt.value
                    ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-250/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {specDescriptions[figmaSpec] && (
            <span className="text-[11px] text-zinc-400 font-medium px-1 mt-0.5">
              * {specDescriptions[figmaSpec]}
            </span>
          )}
        </div>

        {/* ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ И АНАЛИТИКА */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            ШАГ 4: ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ И АНАЛИТИКА
          </span>
          <label className="block text-[11px] text-zinc-500 font-medium leading-relaxed px-1">
            Опишите суть вашего сервиса или сайта, укажите ссылки на конкурентов или референсы, которые вам близки по стилистике
          </label>
          <textarea
            rows={3}
            placeholder="Например: Нужен современный Clean & Light дизайн для личного кабинета ИТ-платформы. Нравится минимализм и интерфейсы у Apple..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:ring-zinc-400 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none h-24"
          />
        </div>
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
          Примерная стоимость дизайна: <span className="font-semibold text-zinc-950 text-sm">от {formatPrice(price)} руб.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('calculation')}
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('consultation')}
            className="flex-1 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Нужна консультация'}
          </button>
        </div>
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

  const handleSubmit = async (type) => {
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

${type === 'consultation' ? '⚠️ <b>Примечание:</b> Клиент сомневается в выборе, нужна консультация' : '✅ <b>Действие:</b> Подтверждение расчета'}
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
            onClick={() => handleSubmit('calculation')}
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('consultation')}
            className="flex-1 border border-zinc-200 text-zinc-650 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55 cursor-pointer text-center"
          >
            {loading ? 'Отправка...' : 'Нужна консультация'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Calculator({ service, onSendSuccess }) {
  if (service.number === '01') {
    return <TildaCalculator service={service} onSendSuccess={onSendSuccess} />;
  }
  if (service.number === '02') {
    return <RedesignCalculator service={service} onSendSuccess={onSendSuccess} />;
  }
  if (service.number === '04') {
    return <FigmaCalculator service={service} onSendSuccess={onSendSuccess} />;
  }
  return <DefaultCalculator service={service} onSendSuccess={onSendSuccess} />;
}

function ServiceCard({ service, isCalcOpen, onToggleCalc, onSendSuccess }) {
  const IconComponent = ICON_MAP[service.number] || Layers;

  const scrollToContacts = () => {
    const el = document.getElementById('contacts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id={`service-card-${service.number}`} className="border border-zinc-100 rounded-2xl p-6 sm:p-8 hover:border-zinc-200 transition-colors bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <span className="text-xs font-bold text-zinc-400 tracking-wider mt-1">{service.number}</span>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="inline-flex items-center justify-center p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50">
              <IconComponent className="w-5 h-5 text-zinc-900" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">{service.title}</h3>
          </div>
          <p className="text-[14px] text-zinc-600 leading-relaxed max-w-[640px]">{service.brief}</p>
        </div>
      </div>

      {/* Details (Clean Block/Bullet list) */}
      <div className="pt-5 border-t border-zinc-100 flex flex-col gap-3">
        {service.details.map((detail, idx) => {
          const isDeadline = detail.label.toLowerCase().includes('срок');
          return (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider min-w-[140px] sm:min-w-[160px] block sm:inline">
                  {detail.label}:
                </span>
                {detail.link ? (
                  <a href={detail.link} className="text-zinc-900 hover:text-zinc-600 font-semibold underline underline-offset-2 text-[13.5px]">
                    {detail.value}
                  </a>
                ) : (
                  <span
                    className={`text-[13.5px] leading-relaxed ${
                      isDeadline ? 'font-semibold text-zinc-950' : 'text-zinc-600'
                    }`}
                  >
                    {detail.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {service.number === '03' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-zinc-100">
          {[
            { label: 'Веб-приложение / Сервис', price: 'от 40 000 ₽' },
            { label: 'MVP мобильного приложения', price: 'от 45 000 ₽' },
            { label: 'Платформа', price: 'от 55 000 ₽' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-zinc-50/60 border border-zinc-100/70 rounded-xl px-3 py-2.5 flex items-center justify-center text-center text-xs text-zinc-800"
            >
              <span>
                <strong className="font-semibold">{item.label}</strong> — <span style={{ fontSize: '0.9em', opacity: 0.7 }} className="font-semibold text-zinc-950">{item.price}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-zinc-100">
        {service.number === '03' ? (
          <a
            href="https://t.me/ksen_web"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
          >
            Рассказать о задаче
          </a>
        ) : (
          <>
            <button
              onClick={onToggleCalc}
              className={`text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer ${
                isCalcOpen
                  ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {isCalcOpen ? 'Скрыть калькулятор' : 'Рассчитать стоимость'}
            </button>
            <button
              onClick={() => window.open('https://t.me/ksen_web', '_blank')}
              className="border border-zinc-200 text-zinc-900 hover:bg-zinc-50 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"
            >
              Рассказать о задаче
            </button>
          </>
        )}
      </div>

      {/* Smoothly Expanding Calculator Panel */}
      {service.number !== '03' && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCalcOpen ? 'max-h-[1500px] opacity-100 mt-6 pt-6 border-t border-zinc-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <Calculator service={service} onSendSuccess={onSendSuccess} />
        </div>
      )}
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
          className={`bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 max-w-[440px] w-full shadow-2xl relative flex flex-col items-center text-center gap-5 transition-all duration-300 transform ${
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
