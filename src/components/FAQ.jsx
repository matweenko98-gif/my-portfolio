import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE = [0.215, 0.610, 0.355, 1.000];

const faqs = [
  {
    id: '01',
    category: 'RISK MANAGEMENT',
    question: 'Как застраховаться от ситуации, когда финальный дизайн или функционал сайта не совпадет с ожиданиями?',
    answer: 'Мы полностью исключаем элемент случайности благодаря поэтапному согласованию. Разработка никогда не начинается «вслепую». Сначала мы создаем интерактивный прототип интерфейса, где вы можете проверить логику переходов и структуру до написания первой строчки кода. Мы утверждаем визуальную концепцию, шрифты и сетку. К этапу верстки и программирования система подходит полностью согласованной вами, поэтому финальный результат предсказуем на 100% и в точности соответствует утвержденному макету.'
  },
  {
    id: '02',
    category: 'PRICING MODEL',
    question: 'Как рассчитывается стоимость разработки сайтов на Tilda под ключ и создания кастомных веб-приложений/платформ?',
    answer: 'Модель расчета зависит от типа продукта. Стоимость сайтов на Tilda под ключ формируется на основе количества страниц, объема уникального UI-дизайна в Zero Block и сложности маркетинговых интеграций. Для веб-приложений и сложных платформ применяется гибкая инженерная модель: цена рассчитывается на основе сложности экранов. Мы делим интерфейс на простые (информационные) и комплексные (интерактивные панели, личные кабинеты, базы данных) экраны. Вы платите исключительно за объем и архитектурную сложность функционала.'
  },
  {
    id: '03',
    category: 'AI & PRODUCTION',
    question: 'Что такое разработка веб-приложений (MVP) с применением AI, и в чем выгода для бизнеса?',
    answer: 'Это создание работающего прототипа или полноценного сервиса (React + Vite) в разы быстрее классической веб-разработки. Я использую стек передовых AI-инструментов и принципы быстрого прототипирования (vibe-coding). Нейросети не заменяют логику, но автоматизируют рутину написания кода. Это позволяет быстро собрать, протестировать продукт на реальном рынке и запустить его, сэкономив до 70% стандартного ИТ-бюджета.'
  },
  {
    id: '04',
    category: 'PLATFORMS & CONVERSION',
    question: 'На каких платформах вы собираете коммерческие сайты и корпоративные платформы?',
    answer: 'Для маркетинговых сайтов, многостраничных порталов и интернет-магазинов под ключ я использую Tilda — она позволяет клиенту в будущем легко менять тексты и управлять контентом без программистов. Для технически сложных веб-приложений, сервисов, личных кабинетов и интеграций с Telegram-ботами я разрабатываю кастомные интерфейсы. Продукт всегда подбирается под бизнес-задачу: оптимизация вместо избыточного декорирования.'
  },
  {
    id: '05',
    category: 'LEGAL & TRUST',
    question: 'Работаете ли вы официально и как оформляется сотрудничество?',
    answer: 'Да, я работаю официально как плательщик НПД. С каждым заказчиком (как с физическими, так и с юридическими лицами) заключается договор. В нем четко фиксируются этапы проектирования, финальный бюджет, дедлайны и обязательный пункт о полном переходе прав на интеллектуальную собственность к вам сразу после завершения проекта.'
  },
  {
    id: '06',
    category: 'POST-LAUNCH & SUPPORT',
    question: 'Оказываете ли вы поддержку после запуска сайта и занимаетесь ли дальнейшим продвижением?',
    answer: 'Да, проект не бросается в день релиза. Я обеспечиваю техническую поддержку, слежу за стабильностью системы и помогаю с интеграциями. При необходимости записываю видео-инструкцию.'
  }
];

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer }
  }))
};

function AccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-neutral-200 rounded-[2px] bg-white">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-5 py-5 flex items-start justify-between gap-4 cursor-pointer"
      >
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400 tracking-widest">[ {faq.id} ]</span>
            <span className="text-[10px] font-mono text-zinc-400 tracking-widest">{faq.category}</span>
          </div>
          <span className="text-[15px] font-normal text-zinc-900 leading-snug pr-2">
            {faq.question}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-1 flex-shrink-0 text-zinc-400 text-xl leading-none select-none"
          aria-hidden="true"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="px-5 pb-6">
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-[14.5px] text-zinc-500 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <section
      id="faq"
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100 bg-white"
    >
      {/* JSON-LD structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
      </div>

      <div className="relative z-10">
        <div className="overflow-hidden mb-4">
          <motion.h2
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-black mb-0"
          >
            Вопросы и ответы
          </motion.h2>
        </div>
        <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed mb-12">
          Ответы на часто задаваемые вопросы о процессе работы, ценообразовании и результатах.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3"
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
