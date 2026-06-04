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
  '02': Figma,
  '03': Code,
  '04': RefreshCw,
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

function Calculator({ service, onSendSuccess }) {
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
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55"
          >
            {loading ? 'Отправка...' : 'Подтвердить расчет'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('consultation')}
            className="border border-zinc-200 text-zinc-650 hover:bg-zinc-100/60 text-xs font-semibold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-55"
          >
            {loading ? 'Отправка...' : 'Нужна консультация'}
          </button>
        </div>
      </div>
    </div>
  );
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
    <div className="border border-zinc-100 rounded-2xl p-6 sm:p-8 hover:border-zinc-200 transition-colors bg-white shadow-sm">
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-zinc-100">
        <button
          onClick={onToggleCalc}
          className={`text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] ${
            isCalcOpen
              ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
              : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          {isCalcOpen ? 'Скрыть калькулятор' : 'Рассчитать стоимость'}
        </button>
        <button
          onClick={scrollToContacts}
          className="border border-zinc-200 text-zinc-900 hover:bg-zinc-50 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px]"
        >
          Рассказать о задаче
        </button>
      </div>

      {/* Smoothly Expanding Calculator Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCalcOpen ? 'max-h-[1500px] opacity-100 mt-6 pt-6 border-t border-zinc-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <Calculator service={service} onSendSuccess={onSendSuccess} />
      </div>
    </div>
  );
}

export default function Services() {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const services = contentData.services.items;

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
            onSendSuccess={() => setIsSuccessModalOpen(true)}
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
            onClick={() => setIsSuccessModalOpen(false)}
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
              Спасибо! Расчет стоимости или запрос на консультацию получен. Я свяжусь с вами в ближайшее время для обсуждения деталей.
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
