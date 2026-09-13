import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Send,
  Sparkles,
  LayoutGrid,
  Target,
  Compass,
  Palette,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import Sidebar from './Sidebar';
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
    document.title = 'Интерактивный бриф | Матвеенко Ксения';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Быстрый пошаговый квиз-бриф на разработку сайта, UX/UI дизайна или веб-приложения.'
      );
    }
    window.scrollTo(0, 0);
  }, []);

  // Состояние текущего шага квиза (0...5)
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

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

  // Список вариантов
  const serviceOptions = [
    'Одностраничный сайт',
    'Многостраничный сайт',
    'Интернет-магазин',
    'Редизайн сайта',
    'Веб-приложение/сервис/MVP',
    'Дизайн в Фигме',
    'Другое',
  ];

  const goalOptions = [
    'Увеличить продажи и поток заявок',
    'Премиально презентовать компанию и услуги',
    'Запустить новый продукт или стартап',
    'Автоматизировать прием заявок, онлайн-запись или бронирование',
    'Обновить устаревший визуальный дизайн',
    'Другое',
  ];

  const materialOptions = [
    'Логотип и брендбук',
    'Готовые тексты для сайта',
    'Фотографии и медиа-материалы',
    'Готовая структура или прототип',
    'Ничего нет, нужна помощь с нуля',
  ];

  const budgetOptions = [
    'До $500 (~45 000 ₽)',
    '$500 – $1 000 (~45 000 – 90 000 ₽)',
    '$1 000 – $2 500 (~90 000 – 225 000 ₽)',
    'От $2 500 (от ~225 000 ₽)',
    'Обсудим индивидуально',
  ];

  const timelineOptions = [
    'Срочно (до 7 дней)',
    '2–3 недели',
    '1 месяц',
    'Не спешим / гибкие сроки',
  ];

  const totalSteps = 6;

  // Названия, описания и иконки шагов
  const stepMeta = [
    {
      stepNum: '01',
      title: 'Какая задача или веб-продукт вам требуется?',
      subtitle: 'Выберите одну или несколько категорий услуг (можно выбрать несколько):',
      fieldKey: 'services',
      icon: LayoutGrid,
    },
    {
      stepNum: '02',
      title: 'Какая главная цель будущего проекта?',
      subtitle: 'Выберите ключевую бизнес-задачу, которую должен решить сайт или сервис:',
      fieldKey: 'goal',
      icon: Target,
    },
    {
      stepNum: '03',
      title: 'Расскажите о вашем продукте и конкурентах',
      subtitle: 'Это поможет лучше понять специфику вашей ниши и предложений:',
      fieldKey: 'product',
      icon: Compass,
    },
    {
      stepNum: '04',
      title: 'Имеющиеся материалы и пожелания по стилю',
      subtitle: 'Отметьте, что уже есть в наличии и укажите стилистические предпочтения:',
      fieldKey: 'materials',
      icon: Palette,
    },
    {
      stepNum: '05',
      title: 'Ориентировочный бюджет и желаемые сроки',
      subtitle: 'Укажите рамки, чтобы мы предложили оптимальное техническое решение:',
      fieldKey: 'budget',
      icon: CreditCard,
    },
    {
      stepNum: '06',
      title: 'Куда прислать предварительный расчёт?',
      subtitle: 'Укажите контакты для связи и получения коммерческого предложения:',
      fieldKey: 'contact',
      icon: UserCheck,
    },
  ];

  // Переключение чекбоксов (множественный выбор)
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

  // Одиночный выбор
  const setSingleOption = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Переход к следующему шагу
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Переход к предыдущему шагу
  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Прямой переход по табу
  const goToStep = (stepIdx) => {
    setDirection(stepIdx > currentStep ? 1 : -1);
    setCurrentStep(stepIdx);
  };

  // Валидация на 6 шаге
  const validateFinalStep = () => {
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
📋 <b>НОВЫЙ КВИЗ-БРИФ С САЙТА</b>
───────────────────────
👤 <b>Имя:</b> ${formData.name || 'Не указано'}
📱 <b>Контакт:</b> ${formData.contact}
🌐 <b>Текущий сайт:</b> ${formData.currentSite || 'Нет'}

🛠 <b>Услуги:</b> ${selectedServices.length > 0 ? selectedServices.join(', ') : 'Не выбрано'}
🎯 <b>Главная цель:</b> ${finalGoal || 'Не выбрано'}

📝 <b>О продукте/услуге:</b>
${formData.productDesc || 'Не заполнено'}

⚔️ <b>Конкуренты/Рефералы:</b>
${formData.competitors || 'Не заполнено'}

📦 <b>Имеющиеся материалы:</b> ${formData.materials.length > 0 ? formData.materials.join(', ') : 'Не выбрано'}
🎨 <b>Пожелания по стилю:</b>
${formData.style || 'Не заполнено'}

💰 <b>Бюджет:</b> ${formData.budget || 'Не указан'}
⏳ <b>Сроки:</b> ${formData.timeline || 'Не указаны'}

💬 <b>Комментарии:</b>
${formData.notes || 'Нет'}
`.trim();
  };

  // Обработчик финальной отправки
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateFinalStep()) {
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
        `Не удалось отправить бриф автоматически. Напишите напрямую в Telegram: ${contentData.sidebar.socialLinks.telegramUsername}`
      );
    }
  };

  // Анимация смещения слайда
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  const CurrentStepIcon = stepMeta[currentStep].icon;

  return (
    <>
      {/* Background Flickering Grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.08} gridGap={6} maxOpacity={0.12} squareSize={4} />
      </div>

      {/* Main Content Layout — full width */}
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

          <div className="relative z-10 py-8 px-4 sm:px-8 md:py-12 md:px-10 lg:px-12 flex flex-col w-full">
            {/* Back link */}
            <div className="mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors duration-200 no-underline group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>На главную</span>
              </Link>
            </div>

            {/* Selling Banner Header — Full width title in one line */}
            <div className="mb-6 pb-6 border-b border-zinc-100">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[10px] tracking-widest text-[#FF5B23] uppercase font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                  [ ИНТЕРАКТИВНЫЙ БРИФ • 6 ШАГОВ ]
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-medium rounded-sm">
                  <Clock className="w-3 h-3 text-[#FF5B23]" />
                  <span>~3 минуты на заполнение</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] font-light tracking-tight text-black mb-2 leading-tight whitespace-normal xl:whitespace-nowrap overflow-hidden text-ellipsis">
                Расчёт стоимости и сроков проекта
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 font-normal leading-relaxed max-w-4xl">
                Ответьте на несколько вопросов, чтобы получить индивидуальное коммерческое предложение, предварительную смету и варианты решения задачи.
              </p>
            </div>

            {/* If Submitted: Premium Success State */}
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-zinc-900 rounded-sm p-8 md:p-14 text-center flex flex-col items-center gap-6 my-6 text-white"
              >
                <div className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold text-2xl border border-zinc-200">
                  ✓
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-3">
                    Бриф успешно отправлен!
                  </h2>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Спасибо за подробную информацию. Я ознакомлюсь с вашими ответами и свяжусь с вами по указанным контактам в течение 2–4 часов.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <a
                    href={contentData.sidebar.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#FF5B23] hover:bg-[#e04e1c] text-white font-medium text-xs uppercase tracking-wider py-4 px-6 rounded-sm text-center no-underline transition-colors shadow-sm"
                  >
                    Написать в Telegram ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentStep(0);
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium text-xs uppercase tracking-wider py-4 px-6 rounded-sm transition-colors cursor-pointer"
                  >
                    Заполнить ещё раз
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Quiz Interactive Full Width Container + Live Summary Sidebar */
              <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                
                {/* Main Interactive Quiz Card — Clean white card with clear border */}
                <div className="flex-1 w-full bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col">
                  
                  {/* Progress Line & Step Tabs */}
                  <div className="border-b border-zinc-100 bg-zinc-50/70 p-4 md:p-6 pb-4">
                    {/* Top Progress bar */}
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="bg-[#FF5B23] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Step Metadata & Navigation Dots */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold tracking-widest text-white bg-zinc-950 px-2.5 py-1 rounded-sm">
                          ШАГ {stepMeta[currentStep].stepNum} / 0{totalSteps}
                        </span>
                        <span className="text-xs font-medium text-zinc-700 hidden sm:inline">
                          — {stepMeta[currentStep].title}
                        </span>
                      </div>

                      {/* Step clickable pills */}
                      <div className="flex items-center gap-1.5">
                        {stepMeta.map((s, idx) => (
                          <button
                            key={s.stepNum}
                            type="button"
                            onClick={() => goToStep(idx)}
                            aria-label={`Перейти к шагу ${idx + 1}`}
                            className={`w-7 h-7 rounded-sm text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                              currentStep === idx
                                ? 'bg-[#FF5B23] text-white border-[#FF5B23]'
                                : idx < currentStep
                                ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                                : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step Content Box */}
                  <div className="p-5 sm:p-8 min-h-[400px] flex flex-col justify-between">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="w-full flex-1 flex flex-col"
                      >
                        {/* Step Header with Clean Icon */}
                        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-zinc-100">
                          <div className="w-11 h-11 rounded-sm bg-zinc-950 text-white flex items-center justify-center shrink-0">
                            <CurrentStepIcon className="w-5 h-5 stroke-[1.8]" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-normal text-zinc-950 tracking-tight mb-1">
                              {stepMeta[currentStep].title}
                            </h2>
                            <p className="text-xs md:text-sm text-zinc-500 font-normal">
                              {stepMeta[currentStep].subtitle}
                            </p>
                          </div>
                        </div>

                        {/* STEP 1: SERVICES (Clean choice cards) */}
                        {currentStep === 0 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {serviceOptions.map((service, idx) => {
                                const isChecked = formData.services.includes(service);
                                const itemNum = String(idx + 1).padStart(2, '0');
                                return (
                                  <button
                                    key={service}
                                    type="button"
                                    onClick={() => toggleCheckbox('services', service)}
                                    className={`flex items-center justify-between p-3.5 text-left border rounded-sm transition-all duration-200 cursor-pointer select-none group ${
                                      isChecked
                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                        : 'border-zinc-200/90 bg-zinc-50 hover:border-zinc-900 hover:bg-zinc-100/70 text-zinc-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                          isChecked
                                            ? 'bg-white text-zinc-950'
                                            : 'bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300'
                                        }`}
                                      >
                                        [{itemNum}]
                                      </span>
                                      <span className="text-xs md:text-sm font-medium pr-2">
                                        {service}
                                      </span>
                                    </div>
                                    <span
                                      className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border transition-all ${
                                        isChecked
                                          ? 'bg-[#FF5B23] border-[#FF5B23] text-white'
                                          : 'border-zinc-300 bg-white group-hover:border-zinc-900'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {formData.services.includes('Другое') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pt-2"
                              >
                                <input
                                  type="text"
                                  value={formData.customService}
                                  onChange={(e) =>
                                    setFormData({ ...formData, customService: e.target.value })
                                  }
                                  placeholder="Укажите ваш вариант или специфику..."
                                  className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors"
                                />
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* STEP 2: GOAL (Single Radio Cards) */}
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2.5">
                              {goalOptions.map((goal, idx) => {
                                const isSelected = formData.goal === goal;
                                const itemNum = String(idx + 1).padStart(2, '0');
                                return (
                                  <button
                                    key={goal}
                                    type="button"
                                    onClick={() => setSingleOption('goal', goal)}
                                    className={`flex items-center justify-between p-3.5 text-left border rounded-sm transition-all duration-200 cursor-pointer select-none group ${
                                      isSelected
                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                        : 'border-zinc-200/90 bg-zinc-50 hover:border-zinc-900 hover:bg-zinc-100/70 text-zinc-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                          isSelected
                                            ? 'bg-white text-zinc-950'
                                            : 'bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300'
                                        }`}
                                      >
                                        [{itemNum}]
                                      </span>
                                      <span className="text-xs md:text-sm font-medium pr-2">
                                        {goal}
                                      </span>
                                    </div>
                                    <span
                                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                        isSelected
                                          ? 'border-[#FF5B23] bg-[#FF5B23] text-white'
                                          : 'border-zinc-300 bg-white group-hover:border-zinc-900'
                                      }`}
                                    >
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {formData.goal === 'Другое' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pt-2"
                              >
                                <input
                                  type="text"
                                  value={formData.customGoal}
                                  onChange={(e) =>
                                    setFormData({ ...formData, customGoal: e.target.value })
                                  }
                                  placeholder="Укажите вашу индивидуальную цель..."
                                  className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors"
                                />
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* STEP 3: PRODUCT & COMPETITORS (Clean Text Inputs) */}
                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Опишите продукт или сферу деятельности
                              </label>
                              <textarea
                                rows={3}
                                value={formData.productDesc}
                                onChange={(e) =>
                                  setFormData({ ...formData, productDesc: e.target.value })
                                }
                                placeholder="Чем занимается компания, кто основные клиенты, в чём ключевая ценность..."
                                className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal resize-y transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Ссылка на текущий сайт (если есть)
                              </label>
                              <input
                                type="text"
                                value={formData.currentSite}
                                onChange={(e) =>
                                  setFormData({ ...formData, currentSite: e.target.value })
                                }
                                placeholder="https://example.com"
                                className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Конкуренты или сайты-ориентиры
                              </label>
                              <input
                                type="text"
                                value={formData.competitors}
                                onChange={(e) =>
                                  setFormData({ ...formData, competitors: e.target.value })
                                }
                                placeholder="Укажите 1-3 ссылки или названия компаний, чья подача вам нравится..."
                                className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {/* STEP 4: MATERIALS & STYLE (Checkboxes + Textarea) */}
                        {currentStep === 3 && (
                          <div className="space-y-5">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2.5">
                                Что из исходных материалов у вас есть?
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {materialOptions.map((mat, idx) => {
                                  const isChecked = formData.materials.includes(mat);
                                  const itemNum = String(idx + 1).padStart(2, '0');
                                  return (
                                    <button
                                      key={mat}
                                      type="button"
                                      onClick={() => toggleCheckbox('materials', mat)}
                                      className={`flex items-center justify-between p-3.5 text-left border rounded-sm transition-all duration-200 cursor-pointer select-none group ${
                                        isChecked
                                          ? 'border-zinc-950 bg-zinc-950 text-white'
                                          : 'border-zinc-200/90 bg-zinc-50 hover:border-zinc-900 hover:bg-zinc-100/70 text-zinc-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span
                                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                            isChecked
                                              ? 'bg-white text-zinc-950'
                                              : 'bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300'
                                          }`}
                                        >
                                          [{itemNum}]
                                        </span>
                                        <span className="text-xs font-medium pr-2">{mat}</span>
                                      </div>
                                      <span
                                        className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border transition-all ${
                                          isChecked
                                            ? 'bg-[#FF5B23] border-[#FF5B23] text-white'
                                            : 'border-zinc-300 bg-white group-hover:border-zinc-900'
                                        }`}
                                      >
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Пожелания по стилистике и настроению
                              </label>
                              <textarea
                                rows={3}
                                value={formData.style}
                                onChange={(e) =>
                                  setFormData({ ...formData, style: e.target.value })
                                }
                                placeholder="Минимализм, темная тема, технологичность, яркие акценты, строгость или эмоциональность..."
                                className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal resize-y transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {/* STEP 5: BUDGET & TIMELINE (Radio options) */}
                        {currentStep === 4 && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2.5">
                                Ориентировочный бюджет на реализацию
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {budgetOptions.map((bud, idx) => {
                                  const isSelected = formData.budget === bud;
                                  const itemNum = String(idx + 1).padStart(2, '0');
                                  return (
                                    <button
                                      key={bud}
                                      type="button"
                                      onClick={() => setSingleOption('budget', bud)}
                                      className={`flex items-center justify-between p-3.5 text-left border rounded-sm transition-all duration-200 cursor-pointer select-none group ${
                                        isSelected
                                          ? 'border-zinc-950 bg-zinc-950 text-white font-medium'
                                          : 'border-zinc-200/90 bg-zinc-50 hover:border-zinc-900 hover:bg-zinc-100/70 text-zinc-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span
                                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                            isSelected
                                              ? 'bg-white text-zinc-950'
                                              : 'bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300'
                                          }`}
                                        >
                                          [{itemNum}]
                                        </span>
                                        <span className="text-xs font-medium">{bud}</span>
                                      </div>
                                      <span
                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                          isSelected
                                            ? 'border-[#FF5B23] bg-[#FF5B23] text-white'
                                            : 'border-zinc-300 bg-white group-hover:border-zinc-900'
                                        }`}
                                      >
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2.5">
                                Желаемые сроки запуска
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {timelineOptions.map((time, idx) => {
                                  const isSelected = formData.timeline === time;
                                  const itemNum = String(idx + 1).padStart(2, '0');
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setSingleOption('timeline', time)}
                                      className={`flex items-center justify-between p-3.5 text-left border rounded-sm transition-all duration-200 cursor-pointer select-none group ${
                                        isSelected
                                          ? 'border-zinc-950 bg-zinc-950 text-white font-medium'
                                          : 'border-zinc-200/90 bg-zinc-50 hover:border-zinc-900 hover:bg-zinc-100/70 text-zinc-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span
                                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                            isSelected
                                              ? 'bg-white text-zinc-950'
                                              : 'bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300'
                                          }`}
                                        >
                                          [{itemNum}]
                                        </span>
                                        <span className="text-xs font-medium">{time}</span>
                                      </div>
                                      <span
                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                          isSelected
                                            ? 'border-[#FF5B23] bg-[#FF5B23] text-white'
                                            : 'border-zinc-300 bg-white group-hover:border-zinc-900'
                                        }`}
                                      >
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 6: CONTACTS & SUBMIT */}
                        {currentStep === 5 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Ваше имя <span className="text-[#FF5B23]">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Алексей"
                                className={`w-full px-4 py-3 text-xs md:text-sm bg-white border rounded-sm focus:outline-none focus:ring-1 text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors ${
                                  errors.name
                                    ? 'border-red-500 bg-red-50/30'
                                    : 'border-zinc-300 focus:border-[#FF5B23] focus:ring-[#FF5B23]'
                                }`}
                              />
                              {errors.name && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">
                                  {errors.name}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Telegram / Телефон / WhatsApp <span className="text-[#FF5B23]">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) =>
                                  setFormData({ ...formData, contact: e.target.value })
                                }
                                placeholder="@username или +7 (999) 000-00-00"
                                className={`w-full px-4 py-3 text-xs md:text-sm bg-white border rounded-sm focus:outline-none focus:ring-1 text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal transition-colors ${
                                  errors.contact
                                    ? 'border-red-500 bg-red-50/30'
                                    : 'border-zinc-300 focus:border-[#FF5B23] focus:ring-[#FF5B23]'
                                }`}
                              />
                              {errors.contact && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">
                                  {errors.contact}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                                Комментарий или дополнительные вопросы
                              </label>
                              <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) =>
                                  setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Любая дополнительная информация, удобное время для связи..."
                                className="w-full px-4 py-3 text-xs md:text-sm bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] focus:ring-1 focus:ring-[#FF5B23] text-zinc-900 font-normal placeholder:text-zinc-400 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal resize-y transition-colors"
                              />
                            </div>

                            <div className="pt-2">
                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={agreedToPolicy}
                                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                                  className="mt-0.5 accent-[#FF5B23] cursor-pointer"
                                />
                                <span className="text-xs text-zinc-500 leading-snug">
                                  Нажимая кнопку «Отправить бриф», я даю согласие на обработку персональных данных в соответствии с{' '}
                                  <Link
                                    to="/privacy-policy"
                                    target="_blank"
                                    className="text-zinc-900 underline hover:text-[#FF5B23] transition-colors"
                                  >
                                    Политикой конфиденциальности
                                  </Link>
                                </span>
                              </label>
                              {errors.policy && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">
                                  {errors.policy}
                                </p>
                              )}
                            </div>

                            {submitError && (
                              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                                {submitError}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons Footer */}
                    <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          currentStep === 0
                            ? 'opacity-0 pointer-events-none'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Назад</span>
                      </button>

                      {currentStep < totalSteps - 1 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 hover:bg-[#FF5B23] text-white font-medium text-xs uppercase tracking-wider rounded-sm transition-colors duration-200 shadow-sm cursor-pointer border-none"
                        >
                          <span>Далее</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-7 py-3 bg-[#FF5B23] hover:bg-[#e04e1c] text-white font-medium text-xs uppercase tracking-wider rounded-sm transition-colors duration-200 shadow-sm cursor-pointer border-none disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Отправка...</span>
                            </>
                          ) : (
                            <>
                              <span>Отправить бриф</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Desktop Live Selections Summary Sidebar */}
                <div className="hidden lg:flex w-72 flex-col bg-zinc-950 text-white p-6 rounded-sm shadow-sm border border-zinc-900 shrink-0 sticky top-6">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                    <span className="font-mono text-[11px] font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5B23]" />
                      ВЫБРАНО В БРИФЕ
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {currentStep + 1}/6
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Services summary */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                        Услуги:
                      </span>
                      {formData.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.services.map((s) => (
                            <span key={s} className="bg-zinc-800 border border-zinc-700 text-white text-[11px] px-2 py-0.5 rounded-sm font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">Не выбрано</span>
                      )}
                    </div>

                    {/* Goal summary */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                        Цель:
                      </span>
                      {formData.goal ? (
                        <span className="text-zinc-200 font-medium block leading-snug">
                          {formData.goal}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">Не выбрано</span>
                      )}
                    </div>

                    {/* Materials summary */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                        Материалы:
                      </span>
                      {formData.materials.length > 0 ? (
                        <span className="text-zinc-300 font-medium block leading-snug">
                          {formData.materials.join(', ')}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">Не указано</span>
                      )}
                    </div>

                    {/* Budget & Timeline summary */}
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                        Бюджет / Сроки:
                      </span>
                      <div className="flex flex-col gap-1 text-zinc-300 font-medium">
                        {formData.budget && <div>💰 {formData.budget}</div>}
                        {formData.timeline && <div>⏳ {formData.timeline}</div>}
                        {!formData.budget && !formData.timeline && (
                          <span className="text-zinc-600 italic">Не указано</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 text-center font-mono">
                    Все ответы будут отправлены напрямую разработчику
                  </div>
                </div>

              </div>
            )}
          </div>
        </motion.main>
      </div>
    </>
  );
}
