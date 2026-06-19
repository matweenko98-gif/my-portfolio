import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import contentData from '../contentData';

const EASE = [0.215, 0.610, 0.355, 1.000];

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
  const faqData = contentData.faq;

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  // JSON-LD structured data for Google rich snippets
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  };

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
            viewport={{ once: true, amount: 0, margin: '200px 0px 0px 0px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-black mb-0"
          >
            {faqData.title}
          </motion.h2>
        </div>
        <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed mb-12">
          {faqData.subtitle}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: '200px 0px 0px 0px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3"
        >
          {faqData.items.map((faq) => (
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
