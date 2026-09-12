import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Send, ArrowLeft, Clock, HelpCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import Contacts from './Contacts';
import KineticMarquee from './ui/KineticMarquee';
import { FlickeringGrid } from './ui/FlickeringGrid';
import contentData from '../contentData';

// Функция отправки бриф-сообщения в Telegram-бот
const sendTelegramBrief = async (formattedText) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram Bot token or chat id is not configured.');
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send brief to Telegram:', error);
    return false;
  }
};

export default function BriefPage() {
  useEffect(() => {
    document.title = 'Бриф на разработку сайта | Матвеенко Ксения';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Быстрый бриф на разработку сайта, UX/UI дизайн или веб-приложение.'
      );
    }
    window.scrollTo(0, 0);
  }, []);

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    currentSite: '',
    services: [],
    customService: '',
    goal: '',
    customGoal: '',
    productDesc: '',
    competitors: '',
    materials: [],
    style: '',
    budget: '',
    timeline: '',
    notes: '',
  });

  const [agreedToPolicy, setAgreedToPolicy] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Список услуг для выбора
  const serviceOptions = [
    'Одностраничный сайт',
    'Многостраничный сайт',
    'Интернет-магазин',
    'Редизайн сайта',
    'Веб-приложение/сервис/MVP',
    'Дизайн в Фигме',
    'Другое',
  ];

  // Варианты целей
  const goalOptions = [
    'Увеличить продажи и поток заявок',
    'Премиально презентовать компанию и услуги',
    'Запустить новый продукт или стартап',
    'Автоматизировать прием заявок, онлайн-запись или бронирование',
    'Обновить устаревший визуальный дизайн',
    'Другое',
  ];

  // Варианты имеющихся материалов
  const materialOptions = [
    'Логотип и брендбук',
    'Готовые тексты для сайта',
    'Фотографии и медиа-материалы',
    'Готовая структура или прототип',
    'Ничего нет, нужна помощь с нуля',
  ];

  // Варианты бюджета
  const budgetOptions = [
    'До $500 (~45 000 ₽)',
    '$500 – $1 000 (~45 000 – 90 000 ₽)',
    '$1 000 – $2 500 (~90 000 – 225 000 ₽)',
    'От $2 500 (от ~225 000 ₽)',
    'Обсудим индивидуально',
  ];

  // Варианты сроков
  const timelineOptions = [
    'Срочно (до 7 дней)',
    '2–3 недели',
    '1 месяц',
    'Не спешим / гибкие сроки',
  ];

  // Переключение чекбоксов
  const toggleCheckbox = (field, value) => {
    setFormData((prev) => {
      const currentArr = prev[field];
      if (currentArr.includes(value)) {
        return { ...prev, [field]: currentArr.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArr, value] };
      }
    });
  };

  // Валидация
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Укажите ваше имя';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Укажите Telegram, телефон или WhatsApp для связи';
    }
    if (!agreedToPolicy) {
      newErrors.policy = 'Подтвердите согласие с политикой конфиденциальности';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Форматирование текста сообщения для Telegram
  const buildBriefTelegramMessage = () => {
    const selectedServices = [...formData.services];
    if (selectedServices.includes('Другое') && formData.customService.trim()) {
      const idx = selectedServices.indexOf('Другое');
      selectedServices[idx] = `Другое (${formData.customService.trim()})`;
    }

    let finalGoal = formData.goal;
    if (formData.goal === 'Другое' && formData.customGoal.trim()) {
      finalGoal = `Другое (${formData.customGoal.trim()})`;
    }

    return `
📋 <b>НОВЫЙ БРИФ С САЙТА</b>
───────────────────────
👤 <b>Имя:</b> ${formData.name || 'Не указано'}
📱 <b>Контакт:</b> ${formData.contact}
🌐 <b>Текущий сайт:</b> ${formData.currentSite || 'Нет'}

🛠 <b>Услуги:</b> ${selectedServices.length > 0 ? selectedServices.join(', ') : 'Не выбрано'}
🎯 <b>Главная цель:</b> ${finalGoal || 'Не выбрано'}

📝 <b>О продукте/услуге:</b>
${formData.productDesc || 'Не заполнено'}

⚔️ <b>Конкуренты (прямые/косвенные):</b>
${formData.competitors || 'Не заполнено'}

📦 <b>Имеющиеся материалы:</b> ${formData.materials.length > 0 ? formData.materials.join(', ') : 'Не выбрано'}
🎨 <b>Пожелания по стилю:</b>
${formData.style || 'Не заполнено'}

💰 <b>Ориентировочный бюджет:</b> ${formData.budget || 'Не указан'}
⏳ <b>Желаемые сроки:</b> ${formData.timeline || 'Не указаны'}

💬 <b>Комментарии:</b>
${formData.notes || 'Нет'}
`.trim();
  };

  // Обработчик отправки
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      const firstErrEl = document.querySelector('.has-error');
      if (firstErrEl) {
        firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    const messageText = buildBriefTelegramMessage();
    const success = await sendTelegramBrief(messageText);

    setIsSubmitting(false);

    if (success) {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSubmitError(
        `Не удалось отправить бриф автоматически. Пожалуйста, напишите напрямую в Telegram ${contentData.sidebar.socialLinks.telegramUsername}`
      );
    }
  };

  return (
    <>
      {/* Background Flickering Grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.08} gridGap={6} maxOpacity={0.12} squareSize={4} />
      </div>

      {/* Main Content Layout */}
      <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
        <Sidebar activeSection="brief" />

        <motion.main
          initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.99 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
        >
          {/* Background Grid Lines */}
          <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
            <div className="border-l border-neutral-200/30 h-full" />
          </div>

          <div className="relative z-10 py-8 px-5 md:py-14 md:px-10 lg:px-14 flex flex-col w-full max-w-3xl">
            {/* Back link */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors duration-200 no-underline group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>На главную</span>
              </Link>
            </div>

            {/* Header & Clean Minimalist Time Badge */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#FF5B23]" />
                  <span>Время заполнения: ~5 мин</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight text-black mb-4 leading-tight">
                Заполните бриф
              </h1>

              {/* Clean Minimalist Notice Banner */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200/90 text-zinc-600 text-xs rounded-sm leading-relaxed font-normal">
                Заполнение всех полей не является обязательным — обязательно укажите только <b>Имя</b> и <b>Контакт для связи</b>, а остальные поля заполняйте по желанию.
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                /* Success State */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-zinc-900 text-white rounded-md p-8 md:p-12 border border-zinc-800 shadow-2xl my-8 text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#FF5B23] text-white flex items-center justify-center mb-6 shadow-lg">
                    <Check className="w-8 h-8" strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                    Бриф успешно отправлен!
                  </h2>
                  <p className="text-zinc-300 text-base max-w-lg leading-relaxed mb-8 font-light">
                    Спасибо! Я внимательно ознакомлюсь с вашими ответами и свяжусь с вами в ближайшее время.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          contact: '',
                          currentSite: '',
                          services: [],
                          customService: '',
                          goal: '',
                          customGoal: '',
                          productDesc: '',
                          competitors: '',
                          materials: [],
                          style: '',
                          budget: '',
                          timeline: '',
                          notes: '',
                        });
                      }}
                      className="px-6 py-3 bg-white text-zinc-900 font-semibold text-sm rounded-sm hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      Заполнить еще раз
                    </button>
                    <Link
                      to="/"
                      className="px-6 py-3 border border-zinc-700 text-white font-semibold text-sm rounded-sm hover:bg-zinc-800 transition-colors no-underline"
                    >
                      Вернуться на главную
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Compact Form State */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* БЛОК 1: Контакты */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        01
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Контактные данные
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={errors.name ? 'has-error' : ''}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Имя <span className="text-[#FF5B23]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ваше имя"
                          className={`w-full px-3.5 py-2.5 bg-zinc-200/50 border rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors ${
                            errors.name ? 'border-red-500 bg-red-50/40' : 'border-zinc-300/80'
                          }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      <div className={errors.contact ? 'has-error' : ''}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Telegram, телефон или WhatsApp <span className="text-[#FF5B23]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          placeholder="@username, +375 29 123-45-67"
                          className={`w-full px-3.5 py-2.5 bg-zinc-200/50 border rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors ${
                            errors.contact ? 'border-red-500 bg-red-50/40' : 'border-zinc-300/80'
                          }`}
                        />
                        {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Ссылка на текущий сайт (если есть)
                        </label>
                        <input
                          type="text"
                          value={formData.currentSite}
                          onChange={(e) => setFormData({ ...formData, currentSite: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full px-3.5 py-2.5 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                        />
                      </div>
                    </div>
                  </section>

                  {/* БЛОК 2: Услуги и цели */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        02
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Услуги и цель проекта
                      </h2>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                        Какие услуги вам необходимы? (выберите варианты)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {serviceOptions.map((service) => {
                          const isSelected = formData.services.includes(service);
                          return (
                            <button
                              key={service}
                              type="button"
                              onClick={() => toggleCheckbox('services', service)}
                              className={`flex items-center justify-between p-3 text-left text-xs md:text-sm rounded-sm border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#111111] text-white border-[#111111] font-medium shadow-xs'
                                  : 'bg-zinc-200/40 text-zinc-800 border-zinc-300/70 hover:border-zinc-400 hover:bg-white'
                              }`}
                            >
                              <span>{service}</span>
                              <div
                                className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-[#FF5B23] bg-[#FF5B23] text-white' : 'border-zinc-400'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {formData.services.includes('Другое') && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            value={formData.customService}
                            onChange={(e) => setFormData({ ...formData, customService: e.target.value })}
                            placeholder="Уточните услугу..."
                            className="w-full px-3.5 py-2 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                        Какова главная цель проекта?
                      </label>
                      <div className="flex flex-col gap-2">
                        {goalOptions.map((goal) => {
                          const isSelected = formData.goal === goal;
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => setFormData({ ...formData, goal: isSelected ? '' : goal })}
                              className={`flex items-center gap-3 p-2.5 text-left text-xs md:text-sm rounded-sm border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                                  : 'bg-zinc-200/40 text-zinc-800 border-zinc-300/70 hover:border-zinc-400 hover:bg-white'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-[#FF5B23] bg-[#FF5B23]' : 'border-zinc-400'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span>{goal}</span>
                            </button>
                          );
                        })}
                      </div>

                      {formData.goal === 'Другое' && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            value={formData.customGoal}
                            onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                            placeholder="Уточните цель вашего проекта..."
                            className="w-full px-3.5 py-2 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900"
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* БЛОК 3: Продукт и конкуренты */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        03
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Продукт и конкуренты
                      </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Опишите ваш продукт или услугу (чем занимаетесь, ключевые преимущества)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.productDesc}
                          onChange={(e) => setFormData({ ...formData, productDesc: e.target.value })}
                          placeholder="Направления, продукты, ключевые особенности бизнеса..."
                          className="w-full px-3.5 py-2.5 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Конкуренты (ссылки или названия)
                        </label>
                        <p className="text-[11px] text-zinc-500 font-normal mb-1.5">
                          Укажите главных конкурентов (как прямых, так и косвенных) и напишите, что именно вам в них нравится или не нравится
                        </p>
                        <textarea
                          rows={3}
                          value={formData.competitors}
                          onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                          placeholder="Например: site1.com (нравится визуал), site2.com (хорошая структура)..."
                          className="w-full px-3.5 py-2.5 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                        />
                      </div>
                    </div>
                  </section>

                  {/* БЛОК 4: Визуал и материалы */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        04
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Визуал и имеющиеся материалы
                      </h2>
                    </div>

                    <div className="mb-5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                        Что из материалов у вас уже есть в наличии?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {materialOptions.map((mat) => {
                          const isSelected = formData.materials.includes(mat);
                          return (
                            <button
                              key={mat}
                              type="button"
                              onClick={() => toggleCheckbox('materials', mat)}
                              className={`flex items-center justify-between p-3 text-left text-xs md:text-sm rounded-sm border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#111111] text-white border-[#111111] font-medium shadow-xs'
                                  : 'bg-zinc-200/40 text-zinc-800 border-zinc-300/70 hover:border-zinc-400 hover:bg-white'
                              }`}
                            >
                              <span>{mat}</span>
                              <div
                                className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-[#FF5B23] bg-[#FF5B23] text-white' : 'border-zinc-400'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Пожелания по стилистике и настроению сайта (минимализм, сочный/динамичный, премиум, строгий)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        placeholder="Пожелания по цветам, стилю, настроению..."
                        className="w-full px-3.5 py-2.5 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  </section>

                  {/* БЛОК 5: Бюджет и сроки */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        05
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Бюджет и сроки
                      </h2>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                        Планируемый бюджет на проект
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {budgetOptions.map((b) => {
                          const isSelected = formData.budget === b;
                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setFormData({ ...formData, budget: isSelected ? '' : b })}
                              className={`p-3 text-center text-xs font-medium rounded-sm border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#111111] text-[#E0FB4A] border-[#111111] font-bold shadow-xs'
                                  : 'bg-zinc-200/40 text-zinc-800 border-zinc-300/70 hover:border-zinc-400 hover:bg-white'
                              }`}
                            >
                              {b}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                        Желаемые сроки запуска
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {timelineOptions.map((t) => {
                          const isSelected = formData.timeline === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFormData({ ...formData, timeline: isSelected ? '' : t })}
                              className={`p-3 text-center text-xs font-medium rounded-sm border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#111111] text-[#E0FB4A] border-[#111111] font-bold shadow-xs'
                                  : 'bg-zinc-200/40 text-zinc-800 border-zinc-300/70 hover:border-zinc-400 hover:bg-white'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* БЛОК 6: Дополнительно */}
                  <section className="bg-white border border-zinc-200/90 rounded-md p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100">
                      <span className="w-7 h-7 rounded-full bg-[#FF5B23] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        06
                      </span>
                      <h2 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900">
                        Дополнительные пожелания
                      </h2>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Есть ли особенности или комментарии к проекту?
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Особенности, пожелания по функционалу..."
                        className="w-full px-3.5 py-2.5 bg-zinc-200/50 border border-zinc-300/80 rounded-sm text-sm text-zinc-900 placeholder-zinc-450 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  </section>

                  {/* Error Notification */}
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Policy Consent Checkbox & Submit Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-10">
                    <div className="flex flex-col">
                      <label className="flex items-start gap-2.5 text-xs text-zinc-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedToPolicy}
                          onChange={(e) => {
                            setAgreedToPolicy(e.target.checked);
                            if (errors.policy) setErrors({ ...errors, policy: null });
                          }}
                          className="mt-0.5 w-4 h-4 rounded-xs border-zinc-350 text-[#FF5B23] focus:ring-0 cursor-pointer accent-[#FF5B23]"
                        />
                        <span>
                          Нажимая кнопку, вы соглашаетесь с{' '}
                          <Link
                            to="/privacy-policy"
                            target="_blank"
                            className="underline text-zinc-900 hover:text-[#FF5B23] font-medium"
                          >
                            политикой конфиденциальности
                          </Link>
                        </span>
                      </label>
                      {errors.policy && (
                        <p className="text-xs text-red-500 mt-1 pl-6">{errors.policy}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-3 bg-[#FF5B23] hover:bg-[#e04e1c] text-white font-bold text-base py-3.5 px-8 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 cursor-pointer border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Отправка брифа...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 text-white" />
                          <span>Отправить бриф</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Complete Footer Section (Contacts + Marquee & Legal info) */}
          <div className="w-full border-t border-neutral-800">
            <Contacts />
            <KineticMarquee />
          </div>
        </motion.main>
      </div>
    </>
  );
}
