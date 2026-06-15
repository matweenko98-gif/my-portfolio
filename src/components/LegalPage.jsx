import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import privacyPolicyMd from '../content/privacy-policy.md?raw';
import termsMd from '../content/terms.md?raw';

function parseMarkdown(mdText) {
  const lines = mdText.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 mb-6 space-y-2 text-zinc-700">
          {currentList.map((item, i) => (
            <li key={i} className="text-[15px] leading-relaxed font-light">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      flushList(idx);
      elements.push(
        <h1 key={idx} className="text-3xl md:text-4xl font-light tracking-tight text-black mt-8 mb-6 leading-tight">
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(
        <h3 key={idx} className="text-lg md:text-xl font-semibold text-zinc-900 mt-8 mb-4 tracking-tight">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushList(idx);
    } else {
      flushList(idx);
      elements.push(
        <p key={idx} className="text-[15px] leading-relaxed text-zinc-700 font-light mb-4">
          {trimmed}
        </p>
      );
    }
  });

  flushList(lines.length);
  return elements;
}

export default function LegalPage({ type }) {
  const mdContent = type === 'privacy' ? privacyPolicyMd : termsMd;

  // Scroll to top and set page metadata when component mounts or type changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    if (type === 'privacy') {
      document.title = "Политика конфиденциальности | Матвеенко Ксения Александровна";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Политика конфиденциальности персональных данных — Матвеенко Ксения Александровна.');
      }
    } else {
      document.title = "Пользовательское соглашение | Правила использования сайта";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Пользовательское соглашение и\u00a0правила использования сайта.');
      }
    }
  }, [type]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col items-center py-12 px-6 md:px-12">
      <div className="w-full max-w-3xl flex flex-col">
        {/* Back navigation button */}
        <div className="mb-12 self-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-medium transition-colors bg-white shadow-sm cursor-pointer no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад на главную</span>
          </Link>
        </div>

        {/* Content */}
        <article className="prose prose-zinc max-w-none">
          {parseMarkdown(mdContent)}
        </article>
      </div>
    </div>
  );
}
