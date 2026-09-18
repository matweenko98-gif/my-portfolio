import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlickeringGrid } from './ui/FlickeringGrid';

const EASE = [0.215, 0.610, 0.355, 1.000];

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "404 — Страница не найдена | Ксения Матвеенко";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-white text-zinc-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.1} gridGap={6} maxOpacity={0.15} squareSize={4} />
      </div>

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 border-b border-zinc-100">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm group-hover:bg-[#FF5B23] transition-colors duration-300">
            КМ
          </div>
          <span className="font-medium text-sm tracking-tight text-zinc-900">
            Ксения Матвеенко
          </span>
        </Link>

        <span className="text-[11px] font-mono text-zinc-400 tracking-wider">
          [ 404 NOT FOUND ]
        </span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FF5B23] animate-pulse" />
            Ошибка 404
          </div>

          {/* Large Title */}
          <h1 className="text-6xl sm:text-8xl font-light tracking-tighter text-zinc-900 mb-6">
            Страница не найдена
          </h1>

          <p className="text-zinc-500 text-base sm:text-lg max-w-md leading-relaxed mb-10">
            Запрашиваемый адрес не существует, был изменен или перемещен на новый домен.
          </p>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 hover:bg-[#FF5B23] text-white font-medium text-sm rounded-sm transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <span>Вернуться на главную</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              to="/cases"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-800 font-medium text-sm rounded-sm transition-colors duration-200"
            >
              Смотреть кейсы
            </Link>
          </div>
        </motion.div>

        {/* Quick Nav Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-zinc-100 w-full flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-400"
        >
          <span>Быстрый переход:</span>
          <Link to="/#services" className="hover:text-zinc-900 transition-colors">Услуги</Link>
          <span className="text-zinc-200">•</span>
          <Link to="/brief" className="hover:text-zinc-900 transition-colors">Заполнить бриф</Link>
          <span className="text-zinc-200">•</span>
          <Link to="/#contacts" className="hover:text-zinc-900 transition-colors">Контакты</Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-400 border-t border-zinc-100 z-10">
        © {new Date().getFullYear()} Ксения Матвеенко. All rights reserved.
      </footer>
    </div>
  );
}
