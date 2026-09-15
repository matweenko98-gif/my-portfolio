import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, ExternalLink, X, Move } from 'lucide-react';

export default function ConceptToolbarModal({ isOpen, onClose, concept }) {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [scaleMode, setScaleMode] = useState('fit'); // 'fit' | 0.25 | 0.5 | 0.75 | 1.0
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 });
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Track scroll container size for precise auto-scale calculations
  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;

    const updateSize = () => {
      if (scrollContainerRef.current) {
        setContainerSize({
          width: scrollContainerRef.current.clientWidth,
          height: scrollContainerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    observer.observe(scrollContainerRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [isOpen]);

  // Reset scale mode to 'fit' and scroll iframe & container to top on opening modal
  useEffect(() => {
    if (isOpen) {
      setScaleMode('fit');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        scrollContainerRef.current.scrollLeft = 0;
      }
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.scrollTo(0, 0);
        } catch (e) {}
      }
    }
  }, [isOpen, concept]);

  if (!isOpen || !concept) return null;

  const demoUrl = concept.demo_url || concept.demoUrl || '/demos/apex-detailing/index.html';
  const title = concept.card_title || concept.title || concept.name || 'ИИ-Концепт';
  const isDesktopOnly = !!concept.is_desktop_only || !!concept.isDesktopOnly;
  const currentViewMode = isDesktopOnly ? 'desktop' : viewMode;

  // Unscaled frame target dimensions
  const unscaledWidth = currentViewMode === 'mobile' ? 375 : 1280;
  const baseUnscaledHeight = currentViewMode === 'mobile' ? 812 : 832;

  // Available container space inside modal body
  const paddingMarginX = 24;
  const paddingMarginY = 24;
  const availableWidth = Math.max(280, containerSize.width - paddingMarginX);
  const availableHeight = Math.max(300, containerSize.height - paddingMarginY);

  // Auto-fit scale factor based on width
  const autoScale = Math.min(1.0, availableWidth / unscaledWidth);

  const effectiveScale =
    currentViewMode === 'mobile'
      ? Math.min(1.0, availableWidth / 375)
      : scaleMode === 'fit'
      ? autoScale
      : Number(scaleMode);

  // Outer frame dimensions: proportional scaling matching true desktop/mobile viewport
  const outerWidth =
    currentViewMode === 'mobile'
      ? Math.round(375 * effectiveScale)
      : Math.round(unscaledWidth * effectiveScale);

  const rawOuterHeight = Math.round(baseUnscaledHeight * effectiveScale);

  const outerHeight =
    scaleMode === 'fit'
      ? Math.min(availableHeight, rawOuterHeight)
      : rawOuterHeight;

  // Unscaled height matches scaled outerHeight to eliminate trailing empty space
  const unscaledIframeHeight = Math.round(
    outerHeight / Math.max(0.1, effectiveScale)
  );

  // Mouse Drag-to-Scroll handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Main button only
    setIsDragging(true);
    if (scrollContainerRef.current) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: scrollContainerRef.current.scrollLeft,
        scrollTop: scrollContainerRef.current.scrollTop
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    scrollContainerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-black/85 backdrop-blur-md font-sans p-2 sm:p-4 select-none"
        onClick={onClose}
      >
        {/* Modal Window Wrapper */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full h-full max-w-[1440px] mx-auto flex flex-col rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Control Toolbar Header */}
          <header className="h-14 px-3 sm:px-4 md:px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2 text-white shrink-0 z-30">
            {/* Left: Window Dots & Concept Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>

              <div className="h-4 w-[1px] bg-zinc-700 hidden sm:block shrink-0" />

              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#FF5B23] text-white shrink-0">
                ИИ-КОНЦЕПТ
              </span>
              <h3 className="text-xs md:text-sm font-medium truncate text-zinc-100 max-w-[100px] sm:max-w-xs md:max-w-sm mb-0">
                {title}
              </h3>
            </div>

            {/* Center: Zoom / Scale Controls & Viewport Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentViewMode === 'desktop' && (
                <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <span className="px-2 text-[11px] font-bold text-[#FF5B23] shrink-0">
                    {Math.round(effectiveScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setScaleMode('fit')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border-none ${
                      scaleMode === 'fit'
                        ? 'bg-[#FF5B23] text-white shadow-sm'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Вместить в экран"
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleMode(0.5)}
                    className={`hidden sm:inline-block px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border-none ${
                      scaleMode === 0.5
                        ? 'bg-[#FF5B23] text-white shadow-sm'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleMode(1.0)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border-none ${
                      scaleMode === 1.0
                        ? 'bg-[#FF5B23] text-white shadow-sm'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="100% масштаб"
                  >
                    100%
                  </button>
                </div>
              )}

              {!isDesktopOnly && (
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none flex items-center gap-1 ${
                      currentViewMode === 'desktop'
                        ? 'bg-[#FF5B23] text-white shadow-sm'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Десктоп</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none flex items-center gap-1 ${
                      currentViewMode === 'mobile'
                        ? 'bg-[#FF5B23] text-white shadow-sm'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Мобильный</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-md text-xs font-medium transition-colors border border-zinc-700/60 no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">В новой вкладке</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-white rounded-md text-xs font-semibold transition-colors border border-zinc-700/60 cursor-pointer"
                title="Закрыть окно (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Закрыть</span>
              </button>
            </div>
          </header>

          {/* Viewer Scrollable Body */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`flex-1 w-full h-[calc(100%-56px)] bg-zinc-950 overflow-x-auto overflow-y-auto p-2 sm:p-4 flex touch-pan-x touch-pan-y ${
              isDragging ? 'cursor-grabbing' : effectiveScale >= 1 ? 'cursor-grab' : 'cursor-default'
            }`}
          >
            {/* Outer Frame Wrapper with scaled dimensions */}
            <div
              style={{
                width: `${outerWidth}px`,
                height: `${outerHeight}px`
              }}
              className={`m-auto shrink-0 transition-all duration-300 relative rounded-xl border border-zinc-700/90 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden ${
                currentViewMode === 'mobile' ? 'rounded-[36px] border-[8px] border-zinc-800 bg-black' : ''
              }`}
            >
              {/* Speaker Notch for Mobile View mode */}
              {currentViewMode === 'mobile' && !isDesktopOnly && (
                <div className="w-full h-4 bg-zinc-900 flex items-center justify-center shrink-0 z-30">
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
                </div>
              )}

              {/* Scaled Inner Iframe Container */}
              <div
                style={{
                  width: `${unscaledWidth}px`,
                  height: `${unscaledIframeHeight}px`,
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top left'
                }}
                className="relative"
              >
                <iframe
                  ref={iframeRef}
                  src={demoUrl}
                  title={title}
                  onLoad={() => {
                    try {
                      if (iframeRef.current) {
                        iframeRef.current.contentWindow?.scrollTo(0, 0);
                      }
                    } catch (e) {}
                  }}
                  className="w-full h-full border-none bg-white pointer-events-auto"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>

              {/* Overlay while dragging */}
              {isDragging && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-grabbing" />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


