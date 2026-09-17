import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowLeft, Monitor } from 'lucide-react';

export default function ConceptToolbarModal({ isOpen, onClose, concept }) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const iframeRef = useRef(null);

  // Apply proportional scaling for desktop concepts whenever container width < 1440px
  const applyIframeScale = useCallback(() => {
    try {
      if (!iframeRef.current) return;
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!doc || !doc.body) return;

      const isDesktopOnly = concept?.is_desktop_only !== false && concept?.isDesktopOnly !== false;
      const containerWidth = iframeRef.current.parentElement?.clientWidth || window.innerWidth;
      const TARGET_DESKTOP_WIDTH = 1440;

      if (isDesktopOnly && containerWidth > 0 && containerWidth < TARGET_DESKTOP_WIDTH) {
        const scale = containerWidth / TARGET_DESKTOP_WIDTH;

        // Freeze internal iframe canvas at 1440px so no layout reflow occurs
        doc.documentElement.style.minWidth = `${TARGET_DESKTOP_WIDTH}px`;
        doc.documentElement.style.width = `${TARGET_DESKTOP_WIDTH}px`;
        doc.documentElement.style.overflowX = 'hidden';

        doc.body.style.minWidth = `${TARGET_DESKTOP_WIDTH}px`;
        doc.body.style.width = `${TARGET_DESKTOP_WIDTH}px`;
        doc.body.style.zoom = `${scale}`;
      } else {
        doc.documentElement.style.minWidth = '';
        doc.documentElement.style.width = '';
        doc.documentElement.style.overflowX = '';

        doc.body.style.minWidth = '';
        doc.body.style.width = '';
        doc.body.style.zoom = '';
      }
    } catch (e) {
      // Ignore cross-origin limitations if external iframe
    }
  }, [concept]);

  // Handle window resize to re-scale if mobile screen size changes
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      applyIframeScale();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, applyIframeScale]);

  const savedScrollRef = useRef(0);

  // Lock background body & html scroll, save & restore exact scroll position
  useEffect(() => {
    if (!isOpen) return;

    // Capture exact scroll Y on main page before locking overflow
    const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    if (currentY > 0) {
      savedScrollRef.current = currentY;
    }

    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyPosition = document.body.style.position;
    const origBodyTop = document.body.style.top;
    const origBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.position = origBodyPosition;
      document.body.style.top = origBodyTop;
      document.body.style.width = origBodyWidth;

      window.removeEventListener('keydown', handleKeyDown);

      // Restore exact scroll position on portfolio page after unmount
      const targetY = savedScrollRef.current;
      setTimeout(() => {
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      }, 20);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !concept) return null;
  if (typeof document === 'undefined') return null;

  const demoUrl = concept.demo_url || concept.demoUrl || '/demos/apex-detailing/index.html';
  const title = concept.card_title || concept.title || concept.name || 'ИИ-Концепт';
  const isDesktopOnly = concept?.is_desktop_only === true || concept?.isDesktopOnly === true;

  const BASE_DESKTOP_WIDTH = 1440;
  const containerScale = windowWidth < BASE_DESKTOP_WIDTH ? windowWidth / BASE_DESKTOP_WIDTH : 1;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] flex flex-col bg-[#0B0C0E] font-sans overflow-hidden select-none"
      >
        {/* Top Header Bar — Styled to match portfolio site design */}
        <header className="h-14 sm:h-16 px-4 md:px-6 bg-white border-b border-zinc-200/80 flex items-center justify-between gap-3 text-zinc-900 shrink-0 z-50 shadow-sm">
          {/* Left: Back to Portfolio & Concept Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 border border-zinc-200 text-zinc-900 hover:text-black hover:border-zinc-400 rounded-sm text-[12px] font-semibold transition-colors bg-white shadow-sm cursor-pointer no-underline shrink-0"
              title="Закрыть и вернуться в портфолио (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            <div className="h-4 w-[1px] bg-zinc-200 shrink-0" />

            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5B23] shrink-0">
                [ ИИ-Концепт ]
              </span>
              <h3 className="text-sm md:text-base font-light tracking-tight text-zinc-900 truncate mb-0">
                {title}
              </h3>
            </div>
          </div>

          {/* Right: Desktop Indicator & Open in New Tab Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isDesktopOnly && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-sm border border-zinc-200/80">
                <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                <span>Только десктоп</span>
              </span>
            )}

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF5B23] text-white hover:bg-[#e04f1e] rounded-sm text-[12px] font-semibold transition-colors no-underline shadow-sm cursor-pointer"
              title="Открыть проект в новом окне браузера"
            >
              <span className="hidden sm:inline">В новой вкладке</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Fullscreen Viewport Area (Enforces fixed 1440px desktop iframe canvas and scales it down seamlessly) */}
        <div className="w-full flex-1 relative bg-[#0B0C0E] overflow-hidden">
          {isDesktopOnly && containerScale < 1 ? (
            <div
              style={{
                width: `${BASE_DESKTOP_WIDTH}px`,
                height: `${100 / containerScale}%`,
                transform: `scale(${containerScale})`,
                transformOrigin: 'top left'
              }}
              className="absolute top-0 left-0 bg-[#0B0C0E]"
            >
              <iframe
                ref={iframeRef}
                src={demoUrl}
                title={title}
                onLoad={() => {
                  applyIframeScale();
                  setTimeout(applyIframeScale, 300);
                  setTimeout(applyIframeScale, 1000);
                }}
                className="w-full h-full border-none bg-[#0B0C0E] block pointer-events-auto"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={demoUrl}
              title={title}
              onLoad={() => {
                applyIframeScale();
                setTimeout(applyIframeScale, 300);
                setTimeout(applyIframeScale, 1000);
              }}
              className="w-full h-full border-none bg-[#0B0C0E] block pointer-events-auto"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}




