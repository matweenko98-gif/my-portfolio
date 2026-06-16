/**
 * ВНИМАНИЕ: Этот файл создан для ручной правки контента сайта.
 * Здесь вы можете самостоятельно изменять любые тексты, заголовки, описания,
 * цены и опции калькулятора, ссылки на социальные сети и мессенджеры.
 * 
 * При редактировании обязательно сохраняйте синтаксис JavaScript (кавычки, запятые и скобки).
 */
import avatarImg from '../images.svg/avatar.jpg';
import otziv1 from '../images.svg/otziv.png/1.png';
import otziv2 from '../images.svg/otziv.png/2.png';
import otziv3 from '../images.svg/otziv.png/3.png';
import otziv4 from '../images.svg/otziv.png/4.png';
import otziv5 from '../images.svg/otziv.png/5.png';
import otziv6 from '../images.svg/otziv.png/6.png';
import otziv7 from '../images.svg/otziv.png/7.png';
import otziv8 from '../images.svg/otziv.png/8.png';

const contentData = {
  // Данные для Sidebar (левая фиксированная панель)
  sidebar: {
    profile: {
      name: "Ксения Матвеенко",
      role: "Веб-дизайнер и\u00a0разработчик сайтов/интерфейсов",
      avatarUrl: avatarImg,
      altText: "Ксения Матвеенко"
    },
    shortDescription: "Создаю адаптивные сайты и\u00a0веб-интерфейсы для\u00a0малого и\u00a0среднего бизнеса. Помогаю компаниям привлекать клиентов, упаковывать сложные продукты, внедрять удобную онлайн-запись и\u00a0презентовать услуги через чистый дизайн.",
    navigation: [
      { id: "hero", label: "Главная" },
      { id: "services", label: "Услуги" },
      { id: "cases", label: "Результаты (Кейсы)" },
      { id: "workflow", label: "Процесс работы" },
      { id: "reviews", label: "Отзывы" },
      { id: "contacts", label: "Обсудить проект" }
    ],
    socialLinks: {
      telegram: "https://t.me/ksen_web",
      max: "https://max.ru/u/f9LHodD0cOLc1tgODx5Hvuln4-rgmfFJqN4Q5OLgnaxmSTG2FxgU9ZVRnGg"
    }
  },

  // Данные для Hero (главный экран)
  hero: {
    title: "Разработка\u00a0сайтов и\u00a0веб-интерфейсов, которые работают на\u00a0ваш бизнес",
    subtitle: "Создаю коммерческие лендинги, многостраничные сайты и\u00a0интернет-магазины с\u00a0индивидуальным дизайном под\u00a0ключ на\u00a0Tilda. Для\u00a0сложных задач создаю веб-приложения (MVP) и\u00a0сервисы. Использую AI-разработку, чтобы быстро собрать и\u00a0протестировать продукт",
    buttons: {
      primary: {
        text: "Смотреть проекты",
        targetId: "cases"
      },
      secondary: {
        text: "Обсудить задачу",
        targetId: "contacts"
      }
    }
  },

  // Данные для Services (продукты и решения)
  services: {
    title: "Какие задачи мы можем решить",
    subtitle: "Выберите интересующее вас направление, чтобы узнать подробности, сроки реализации и\u00a0получить бесплатную консультацию.",
    items: [
      {
        number: "01",
        title: "Создание сайтов «под\u00a0ключ» на\u00a0Tilda",
        brief: "Лендинги, многостраничные сайты компаний, каталоги услуг, интернет-магазины анимацией, адаптацией под\u00a0мобильные устройства и\u00a0базовой SEO-оптимизацией. Быстрый запуск для\u00a0старта рекламы и\u00a0удобное самостоятельное редактирование контента без\u00a0привлечения разработчиков.",
        details: [
          { label: "Идеально для", value: "Landing page, корпоративные сайты, интернет-магазины." },
          { label: "Сроки", value: "от\u00a07 рабочих дней." },
          { label: "Результат", value: "Дизайн, верстка, базовая SEO, подключение сервисов." }
        ],
        // Структура цен для калькулятора Tilda
        calculator: {
          basePrice: 30000,
          baseDays: 7,
          options: [
            {
              id: "siteType",
              label: "Тип сайта",
              choices: [
                { value: "landing", label: "Лендинг", price: 0, days: 0 },
                { value: "corp", label: "Корпоративный сайт (+15 000 ₽)", price: 15000, days: 7 }
              ]
            },
            {
              id: "pagesCount",
              label: "Количество страниц",
              choices: [
                { value: "1", label: "1 страница", price: 0, days: 0 },
                { value: "5", label: "до\u00a05 страниц (+10 000 ₽)", price: 10000, days: 4 },
                { value: "more", label: "более 5 страниц (+20 000 ₽)", price: 20000, days: 8 }
              ]
            },
            {
              id: "zeroBlock",
              label: "Нужен уникальный Zero-блок",
              choices: [
                { value: "no", label: "Нет (0 ₽)", price: 0, days: 0 },
                { value: "yes", label: "Да (+7 000 ₽)", price: 7000, days: 3 }
              ]
            }
          ]
        }
      },
      {
        number: "02",
        title: "Редизайн и\u00a0оптимизация сайтов",
        brief: "Если ваш текущий сайт устарел, плохо открывается с\u00a0телефона или\u00a0не приносит заявок. Полностью обновлю визуальный стиль, сохраню важную структуру и\u00a0перенесу проект на\u00a0Tilda для\u00a0удобного управления.",
        details: [
          { label: "Идеально для", value: "Устаревших сайтов с\u00a0низким фокусом на\u00a0конверсию." },
          { label: "Сроки", value: "от\u00a05 рабочих дней." },
          { label: "Результат", value: "Новый UI/UX стиль, перенос на\u00a0Tilda, рост конверсии." }
        ],
        // Структура цен для калькулятора редизайна
        calculator: {
          options: [
            {
              id: "depth",
              label: "Формат и\u00a0глубина редизайна",
              choices: [
                {
                  value: "visual_update",
                  label: "Визуальное обновление стиля",
                  description: "Перенос текущей структуры на\u00a0Tilda, освежение дизайна, настройка шрифтов, цветов и\u00a0адаптивности. Базовая стоимость: от\u00a020 000 руб.",
                  basePrice: 20000
                },
                {
                  value: "full_redesign",
                  label: "Полный редизайн с\u00a0перепроектированием (UX/UI)",
                  description: "Глубокий анализ старого сайта, создание новой структуры в\u00a0Figma с\u00a0нуля, исправление логики и\u00a0сборка на\u00a0Tilda. Базовая стоимость: от\u00a030 000 руб.",
                  basePrice: 30000
                }
              ]
            },
            {
              id: "volume",
              label: "Объем текущего проекта",
              choices: [
                { value: "landing", label: "Одностраничный сайт", sublabel: "(Лендинг)", multiplier: 1.0 },
                { value: "multipage", label: "Многостраничный сайт", sublabel: "(До\u00a05 страниц)", multiplier: 1.5 },
                { value: "large", label: "Крупный сайт / Интернет-магазин", sublabel: "(Более 5 страниц или\u00a0большой каталог)", multiplier: 2.0 }
              ]
            },
            {
              id: "content",
              label: "Наличие контента и\u00a0структуры",
              choices: [
                { value: "keep_all", label: "Контент переносим полностью", description: "Тексты, фото и\u00a0структура остаются прежними, меняется только визуал", multiplier: 1.0 },
                { value: "partial_edit", label: "Нужна частичная доработка", description: "Часть текстов обновим, добавим новые блоки или\u00a0разделы", multiplier: 1.2 },
                { value: "full_rewrite", label: "Полная переработка смыслов", description: "Тексты и\u00a0структура пишем заново под\u00a0новые задачи бизнеса", multiplier: 1.5 }
              ]
            }
          ]
        }
      },
      {
        number: "03",
        title: "AI-разработка веб-приложений, сервисов и\u00a0платформ (MVP)",
        brief: "Создаю первые рабочие версии (MVP) цифровых продуктов, личные кабинеты, интерактивные платформы и\u00a0веб-приложения. Помогаю быстро запустить продукт на\u00a0рынок, протестировать гипотезы и\u00a0подготовить проект к\u00a0масштабированию.",
        details: [
          { label: "Идеально для", value: "Стартапов, фаундеров, сложных веб-сервисов и\u00a0платформ." },
          { label: "Сроки", value: "Индивидуально (зависит от\u00a0ТЗ)." },
          { label: "Результат", value: "Рабочий прототип (MVP) с\u00a0AI-логикой и\u00a0личными кабинетами." }
        ],
        // Структура цен для калькулятора мобильных приложений и кастомных решений (AI разработка)
        calculator: {
          basePrice: 50000,
          baseDays: 15,
          options: [
            {
              id: "backend",
              label: "Наличие Backend (БД, авторизация)",
              choices: [
                { value: "no", label: "Нет (0 ₽)", price: 0, days: 0 },
                { value: "yes", label: "Да (+30 000 ₽)", price: 30000, days: 10 }
              ]
            },
            {
              id: "frontend",
              label: "Сложность Frontend",
              choices: [
                { value: "standard", label: "Стандартный (0 ₽)", price: 0, days: 0 },
                { value: "complex", label: "Сложный (+20 000 ₽)", price: 20000, days: 5 }
              ]
            },
            {
              id: "apiIntegration",
              label: "Интеграция с\u00a0внешними API",
              choices: [
                { value: "no", label: "Нет (0 ₽)", price: 0, days: 0 },
                { value: "yes", label: "Да (+15 000 ₽)", price: 15000, days: 3 }
              ]
            }
          ]
        }
      },
      {
        number: "04",
        title: "Дизайн сайтов/интерфейсов в\u00a0Figma",
        brief: "Архитектура проекта и\u00a0уникальный кастомный дизайн (UI) под\u00a0индивидуальную разработку сайтов или\u00a0веб-приложений.",
        details: [
          { label: "Идеально для", value: "Проектов под\u00a0дальнейшую индивидуальную разработку." },
          { label: "Сроки", value: "от\u00a010 рабочих дней." },
          { label: "Результат", value: "UX-структура, дизайн-концепция и\u00a0готовый UI-кит." }
        ],
        // Структура цен для калькулятора Figma
        calculator: {
          options: [
            {
              id: "type",
              label: "Тип продукта и\u00a0проектирование",
              choices: [
                {
                  value: "website_design",
                  label: "Дизайн веб-сайта / Лендинга",
                  description: "Разработка уникальной визуальной концепции, UI-кита и\u00a0адаптивных макетов для\u00a0ПК и\u00a0мобильных устройств. Базовая стоимость: от\u00a020 000 руб.",
                  basePrice: 20000
                },
                {
                  value: "app_interface",
                  label: "Интерфейс приложения / Платформы",
                  description: "Проектирование пользовательских сценариев, UX-логики, сложных личных кабинетов, дашбордов и\u00a0экранов MVP. Базовая стоимость: от\u00a035 000 руб.",
                  basePrice: 35000
                }
              ]
            },
            {
              id: "complexity",
              label: "Объем и\u00a0сложность",
              choices: [
                { value: "small", label: "Небольшой проект", sublabel: "(До\u00a05 ключевых экранов или\u00a0страниц сайта)", multiplier: 1.0 },
                { value: "medium", label: "Средний проект", sublabel: "(От\u00a05 до\u00a015 экранов, базовая интерактивная карта переходов)", multiplier: 1.4 },
                { value: "ecosystem", label: "Сложная экосистема", sublabel: "(Более 15 экранов, детальный интерактивный прототип, развернутая дизайн-система)", multiplier: 1.8 }
              ]
            },
            {
              id: "spec",
              label: "Исходные данные и\u00a0тех. задание",
              choices: [
                { value: "has_spec", label: "Есть четкое ТЗ и\u00a0прототип", description: "Структура страниц понятна, есть готовое описание логики и\u00a0контент", multiplier: 1.0 },
                { value: "no_spec", label: "Есть только идея и\u00a0референсы", description: "Потребуется совместное проведение аналитики, проектирование логики и\u00a0структуры с\u00a0нуля", multiplier: 1.3 }
              ]
            }
          ]
        }
      }
    ]
  },

  // Данные для Cases (результаты проектов)
  cases: {
    title: "Результаты и\u00a0кейсы",
    // Первые 4 кейса отображаются всегда. Остальные — скрыты за кнопкой «Показать еще».
    // Поле `date` — скрытое, используется только для сортировки в будущей админке.
    // Порядок отображения определяется порядком в массиве, а не датой.
    // Поле `description` — краткая аннотация для архивной строки внизу секции.
    items: [
      {
        name: "Веб-приложение для\u00a0медицинского центра",
        // date: скрытое поле — только для будущей сортировки в админке, нигде не выводится
        date: "2025-11-20",
        // description: 4–8 слов, краткая суть проекта для архивного списка
        description: "Онлайн-запись, личный кабинет и\u00a0телемедицина",
        tags: ["UX/UI", "Next.js", "Медицина"],
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='340' y='260' width='120' height='80' rx='4' fill='%23e0e0e0'/%3E%3Ccircle cx='400' cy='270' r='20' fill='%23d0d0d0'/%3E%3Crect x='360' y='295' width='80' height='6' rx='3' fill='%23d0d0d0'/%3E%3Crect x='370' y='308' width='60' height='4' rx='2' fill='%23e0e0e0'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#",
        inDevelopment: true
      },
      {
        name: "Многостраничный сайт для\u00a0детского лагеря Oasis Camp",
        date: "2025-09-05",
        description: "Полный редизайн сайта лагеря на\u00a0Tilda с\u00a0анимациями",
        tags: ["Tilda", "Дизайн", "Анимация"],
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='340' y='260' width='120' height='80' rx='4' fill='%23e0e0e0'/%3E%3Ccircle cx='400' cy='270' r='20' fill='%23d0d0d0'/%3E%3Crect x='360' y='295' width='80' height='6' rx='3' fill='%23d0d0d0'/%3E%3Crect x='370' y='308' width='60' height='4' rx='2' fill='%23e0e0e0'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#"
      },
      {
        name: "Корпоративный сайт для\u00a0агентства EMSOFT",
        date: "2025-06-18",
        description: "UX/UI и\u00a0разработка корпоративного сайта на\u00a0Webflow",
        tags: ["UX/UI", "Webflow", "Разработка"],
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='340' y='260' width='120' height='80' rx='4' fill='%23e0e0e0'/%3E%3Ccircle cx='400' cy='270' r='20' fill='%23d0d0d0'/%3E%3Crect x='360' y='295' width='80' height='6' rx='3' fill='%23d0d0d0'/%3E%3Crect x='370' y='308' width='60' height='4' rx='2' fill='%23e0e0e0'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#"
      },
      {
        name: "Landing для\u00a0продажи онлайн-книги «Мир тарталеток»",
        date: "2025-04-02",
        description: "Продающий лендинг с\u00a0интеграцией платёжного сервиса",
        tags: ["Tilda", "Маркетинг", "E-commerce"],
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='340' y='260' width='120' height='80' rx='4' fill='%23e0e0e0'/%3E%3Ccircle cx='400' cy='270' r='20' fill='%23d0d0d0'/%3E%3Crect x='360' y='295' width='80' height='6' rx='3' fill='%23d0d0d0'/%3E%3Crect x='370' y='308' width='60' height='4' rx='2' fill='%23e0e0e0'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#"
      },
      // ── Заглушки (скрыты по умолчанию, показываются по кнопке «Показать еще») ──
      {
        name: "Редизайн интернет-магазина товаров для\u00a0спорта",
        date: "2025-02-14",
        description: "Полный редизайн каталога и\u00a0корзины, рост конверсии",
        tags: ["UX/UI", "Редизайн", "E-commerce"],
        // Заглушка: нет реального изображения, используем inline SVG через data URI
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='340' y='260' width='120' height='80' rx='4' fill='%23e0e0e0'/%3E%3Ccircle cx='400' cy='270' r='20' fill='%23d0d0d0'/%3E%3Crect x='360' y='295' width='80' height='6' rx='3' fill='%23d0d0d0'/%3E%3Crect x='370' y='308' width='60' height='4' rx='2' fill='%23e0e0e0'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#",
        inDevelopment: true
      },
      {
        name: "Платформа для\u00a0онлайн-курсов в\u00a0сфере дизайна",
        date: "2024-12-01",
        description: "MVP платформы с\u00a0личными кабинетами и\u00a0видеоплеером",
        tags: ["React", "MVP", "EdTech"],
        imageMain: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f4f4f4'/%3E%3Crect x='320' y='250' width='160' height='100' rx='4' fill='%23e0e0e0'/%3E%3Cpolygon points='380,275 380,325 430,300' fill='%23d0d0d0'/%3E%3Crect x='340' y='360' width='120' height='5' rx='2.5' fill='%23e0e0e0'/%3E%3Crect x='340' y='372' width='80' height='4' rx='2' fill='%23ebebeb'/%3E%3C/svg%3E",
        imageHover: null,
        link: "#",
        inDevelopment: true
      }
    ]
  },

  // Данные для Workflow (процесс работы и стандарты)
  workflow: {
    title: "Прозрачный процесс разработки",
    steps: [
      {
        number: "01",
        title: "Бриф и\u00a0обсуждение",
        desc: "Проводим созвон или\u00a0подробную переписку, детально разбираем вашу бизнес-задачу, фиксируем ключевые цели и\u00a0KPI проекта."
      },
      {
        number: "02",
        title: "Анализ рынка",
        desc: "Изучаем решения прямых и\u00a0косвенных конкурентов, выявляем их сильные и\u00a0слабые стороны, проектируем наше интерфейсное преимущество."
      },
      {
        number: "03",
        title: "Проектирование и\u00a0дизайн",
        desc: "Создаю логическую интерактивную структуру (UX) и\u00a0утверждаем финальное визуальное решение (UI) в\u00a0Figma. На\u00a0этом этапе вы видите будущий сайт до\u00a0написания кода."
      },
      {
        number: "04",
        title: "Сборка и\u00a0код",
        desc: "Переношу утвержденный дизайн на\u00a0выбранную платформу: собираю проект на\u00a0Tilda или\u00a0пишу чистый кастомный код через инструменты Antigravity."
      },
      {
        number: "05",
        title: "Тестирование и\u00a0сдача",
        desc: "Тщательно тестирую адаптивность на\u00a0мобильных устройствах, проверяю скорость загрузки, подключаю системы аналитики и\u00a0передаю вам все доступы."
      },
      {
        number: "06",
        title: "Поддержка",
        desc: "Сопровождаю проект после запуска, помогаю оперативно внести первые правки и\u00a0консультирую по\u00a0развитию продукта."
      }
    ],
    standardsTitle: "Стандарты сервиса и\u00a0коммуникации",
    standards: [
      {
        iconName: "MessageSquare", // Имя иконки Lucide для динамического рендеринга
        title: "Веду вас по\u00a0понятному процессу",
        desc: "Объясняю, что и\u00a0когда будет происходить. Мы утверждаем структуру, потом — визуал, потом я собираю проект. Всё идет строго по\u00a0этапам, вы всегда в\u00a0курсе, без\u00a0хаоса и\u00a0понимаете, «куда мы идём»."
      },
      {
        iconName: "Sparkles",
        title: "Всегда на\u00a0связи",
        desc: "Вы можете задавать любые вопросы в\u00a0Telegram — отвечаю оперативно и\u00a0без долгих пропаданий. Если у\u00a0вас нет времени на\u00a0созвоны или\u00a0текстовые переписки, я могу быстро объяснить и\u00a0показать всё на\u00a0видео."
      },
      {
        iconName: "Calendar",
        title: "Работаю комплексно",
        desc: "Беру на\u00a0себя весь цикл задач. Работаю над\u00a0структурой и\u00a0логикой проекта, корректирую тексты, делаю понятный дизайн, верстаю, адаптирую под\u00a0мобильные устройства и\u00a0осуществляю все финальные технические настройки."
      },
      {
        iconName: "ShieldCheck",
        title: "Отдаю готовую работу + поддержка",
        desc: "После запуска вы получаете подробные видео-инструкции: как\u00a0устроена платформа и\u00a0как легко менять информацию на\u00a0сайте. И\u00a0даже если вы что-то забыли — я остаюсь на\u00a0связи 30 дней, чтобы вы спокойно адаптировались."
      }
    ]
  },

  // Данные для Отзывов (Что говорят клиенты)
  reviews: {
    title: "Что говорят клиенты",
    subtitle: "Сообщения и\u00a0отзывы из\u00a0Telegram о\u00a0результатах нашей совместной работы",
    items: [
      {
        id: "rev1",
        imageUrl: otziv1,
        aspectRatio: 1.139,
        desktopOnly: false
      },
      {
        id: "rev2",
        imageUrl: otziv2,
        aspectRatio: 2.195,
        desktopOnly: false
      },
      {
        id: "rev3",
        imageUrl: otziv3,
        aspectRatio: 4.096,
        desktopOnly: true
      },
      {
        id: "rev4",
        imageUrl: otziv4,
        aspectRatio: 1.388,
        desktopOnly: true
      },
      {
        id: "rev5",
        imageUrl: otziv5,
        aspectRatio: 1.800,
        desktopOnly: false
      },
      {
        id: "rev6",
        imageUrl: otziv6,
        aspectRatio: 2.510,
        desktopOnly: true
      },
      {
        id: "rev7",
        imageUrl: otziv7,
        aspectRatio: 4.511,
        desktopOnly: false
      },
      {
        id: "rev8",
        imageUrl: otziv8,
        aspectRatio: 1.869,
        desktopOnly: true
      }
    ]
  },

  // Данные для Contacts (обсудить проект)
  contacts: {
    title: "Давайте обсудим ваш проект",
    subtitle: "Выберите задачу — подготовлю текст сообщения, вам останется только отправить его в\u00a0мессенджер.",
    phone: "+375 25 914 09 59",
    trustPoints: [
      "Отвечаю в\u00a0течение 1 рабочего дня",
      "Первичный анализ — бесплатно",
      "Без\u00a0обязательств после консультации"
    ],
    messengers: {
      telegram: {
        text: "Написать в\u00a0Telegram",
        url: "https://t.me/ksen_web"
      },
      max: {
        text: "Написать в\u00a0MAX",
        // Замените на вашу личную ссылку из MAX: Настройки → Поделиться
        url: "https://max.ru/u/f9LHodD0cOLc1tgODx5Hvuln4-rgmfFJqN4Q5OLgnaxmSTG2FxgU9ZVRnGg"
      }
    },
    buttons: {
      telegram: {
        text: "Написать в\u00a0Telegram",
        url: "https://t.me/ksen_web"
      },
      email: {
        text: "Отправить письмо на\u00a0Email",
        url: "mailto:hello@example.com"
      }
    },
    intents: [
      {
        id: "tilda",
        label: "Сайт на\u00a0Tilda",
        priceHint: "от\u00a030 000 ₽",
        timeline: "от\u00a07 рабочих дней",
        benefits: [
          "Лендинг, корпоративный сайт или\u00a0каталог услуг",
          "Адаптив, анимации и\u00a0базовая SEO-настройка",
          "Удобное самостоятельное редактирование контента"
        ],
        messageTopic: "создание сайта на\u00a0Tilda",
        calculatorServiceId: "01"
      },
      {
        id: "redesign",
        label: "Редизайн сайта",
        priceHint: "от\u00a020 000 ₽",
        timeline: "от\u00a05 рабочих дней",
        benefits: [
          "Обновление устаревшего дизайна и\u00a0UX",
          "Перенос на\u00a0Tilda для\u00a0удобного управления",
          "Снижение отказов и\u00a0рост конверсии"
        ],
        messageTopic: "редизайн и\u00a0оптимизацию сайта",
        calculatorServiceId: "02"
      },
      {
        id: "ai",
        label: "AI / MVP",
        priceHint: "от\u00a040 000 ₽",
        timeline: "индивидуально",
        benefits: [
          "Веб-приложения, личные кабинеты, платформы",
          "Быстрый запуск MVP для\u00a0проверки гипотез",
          "Интеграции с\u00a0CRM, оплатой и\u00a0внешними API"
        ],
        messageTopic: "AI-разработку веб-приложения (MVP)",
        calculatorServiceId: "03"
      },
      {
        id: "figma",
        label: "Дизайн в\u00a0Figma",
        priceHint: "от\u00a020 000 ₽",
        timeline: "от\u00a010 рабочих дней",
        benefits: [
          "UX-структура и\u00a0UI-дизайн под\u00a0разработку",
          "Адаптивные макеты для\u00a0всех устройств",
          "UI-kit и\u00a0компоненты для\u00a0команды"
        ],
        messageTopic: "дизайн интерфейса в\u00a0Figma",
        calculatorServiceId: "04"
      },
      {
        id: "consult",
        label: "Консультация",
        priceHint: "бесплатно",
        timeline: "30–60 минут",
        benefits: [
          "Разберём вашу задачу и\u00a0подскажем формат решения",
          "Проанализирую текущий сайт, если он есть",
          "Составим план следующих шагов"
        ],
        messageTopic: "консультацию по\u00a0проекту",
        calculatorServiceId: null
      }
    ]
  }
};

export default contentData;
