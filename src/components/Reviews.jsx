import React, { useEffect, useRef } from 'react';
import contentData from '../contentData';

const SCROLL_ROTATIONS = 2.0;
const TRACK_COPIES = 3;

const mobileLefts = {
  rev1: '4%',
  rev2: '8%',
  rev5: '4%',
  rev7: '8%',
};

function getVisibleItems(items, isMobile) {
  return items.filter((card) => !(isMobile && card.desktopOnly));
}

function buildTrackLayout(items, isMobile) {
  const sorted = [...items].sort(
    (a, b) =>
      (isMobile ? a.startYMobile || a.startY : a.startY) -
      (isMobile ? b.startYMobile || b.startY : b.startY)
  );

  const minY = sorted[0]
    ? isMobile
      ? sorted[0].startYMobile || sorted[0].startY
      : sorted[0].startY
    : 0;
  const maxY = sorted[sorted.length - 1]
    ? isMobile
      ? sorted[sorted.length - 1].startYMobile || sorted[sorted.length - 1].startY
      : sorted[sorted.length - 1].startY
    : 0;
  const range = Math.max(maxY - minY, 1);

  return sorted.map((card) => {
    const rawY = isMobile ? card.startYMobile || card.startY : card.startY;

    return {
      ...card,
      left: isMobile ? mobileLefts[card.id] || '5%' : card.left,
      trackY: ((rawY - minY) / range) * 480,
    };
  });
}

function getCycleHeight(layout, cardHeight = 220) {
  return layout.reduce((max, card) => Math.max(max, card.trackY + cardHeight), cardHeight);
}

function getCenterScale(containerHeight, cardCenterY, containerTop) {
  const containerCenterY = containerTop + containerHeight / 2;
  const distFromCenter = Math.abs(cardCenterY - containerCenterY);
  const maxDist = containerHeight * 0.55;
  const normDist = Math.min(1, distFromCenter / maxDist);
  const t = 1 - normDist;
  const easeT = t * t * (3 - 2 * t);
  return 0.94 + 0.06 * easeT;
}

export default function Reviews() {
  const reviewsRef = useRef(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const cardsRef = useRef([]);
  const reviewsData = contentData.reviews;

  useEffect(() => {
    let ticking = false;

    const updateStyles = () => {
      if (!reviewsRef.current || !trackRef.current || !containerRef.current) return;

      const rect = reviewsRef.current.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      const isMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, isMobile);
      const layout = buildTrackLayout(visibleItems, isMobile);
      const cycleHeight = getCycleHeight(layout);
      const totalScroll = cycleHeight * SCROLL_ROTATIONS;

      trackRef.current.style.transform = `translate3d(0, ${-progress * totalScroll}px, 0)`;

      const containerRect = containerRef.current.getBoundingClientRect();
      cardsRef.current.forEach((el) => {
        if (!el) return;
        const cardRect = el.getBoundingClientRect();
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const scale = getCenterScale(containerRect.height, cardCenterY, containerRect.top);
        el.style.transform = `scale(${scale})`;
      });

      ticking = false;
    };

    const setSectionHeight = () => {
      if (!reviewsRef.current) return;

      const isMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, isMobile);
      const layout = buildTrackLayout(visibleItems, isMobile);
      const cycleHeight = getCycleHeight(layout);
      const scrollPx = cycleHeight * SCROLL_ROTATIONS;

      reviewsRef.current.style.height = `${window.innerHeight + scrollPx}px`;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateStyles);
        ticking = true;
      }
    };

    const onResize = () => {
      setSectionHeight();
      onScroll();
    };

    setSectionHeight();
    updateStyles();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reviewsData]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const visibleItems = getVisibleItems(reviewsData.items, isMobile);
  const layout = buildTrackLayout(visibleItems, isMobile);
  const cycleHeight = getCycleHeight(layout);

  return (
    <section
      id="reviews"
      ref={reviewsRef}
      className="relative border-b border-zinc-100 bg-white"
      style={{ height: '180vh' }}
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
      </div>

      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-12 px-6 md:px-12 lg:px-16 relative z-10">
        <div className="max-w-3xl mb-8 select-none">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-black mb-2 md:whitespace-nowrap">
            {reviewsData.title}
          </h2>
          <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed">
            {reviewsData.subtitle}
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[58vh] overflow-hidden rounded-md border border-zinc-100 bg-zinc-50/20"
        >
          <div ref={trackRef} className="relative w-full will-change-transform">
            {Array.from({ length: TRACK_COPIES }, (_, cycle) =>
              layout.map((review, idx) => {
                const cardIndex = cycle * layout.length + idx;
                return (
                  <div
                    key={`${review.id}-${cycle}`}
                    ref={(el) => { cardsRef.current[cardIndex] = el; }}
                    className="absolute w-[280px] sm:w-[330px] transition-transform ease-out duration-75 will-change-transform hover:z-20"
                    style={{
                      left: review.left,
                      top: review.trackY + cycle * cycleHeight,
                    }}
                  >
                    <div className="bg-white border border-zinc-200/30 rounded-md p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] cursor-default">
                      {review.imageUrl ? (
                        <div className="relative w-full overflow-hidden rounded-sm border border-zinc-100 bg-zinc-50">
                          <img
                            src={review.imageUrl}
                            alt={`Отзыв от ${review.name}`}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center gap-3 relative pr-10">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                              style={{
                                background:
                                  review.avatarColor ||
                                  'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
                              }}
                            >
                              {review.avatarInitials}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-[13px] font-bold text-zinc-900 leading-tight truncate">
                                {review.name}
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate">
                                {review.username}
                              </span>
                            </div>

                            <span className="text-[10px] text-zinc-400 absolute top-0.5 right-0 font-medium">
                              {review.time}
                            </span>
                          </div>

                          <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-medium">
                            {review.text}
                          </p>

                          <div className="flex items-center justify-between text-[9.5px] text-zinc-400/80 font-medium border-t border-zinc-100/50 pt-2 mt-1 select-none">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-sky-500 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              <span>Сообщение подтверждено</span>
                            </span>
                            <span className="text-sky-500 font-bold tracking-tight text-[11px]">✓✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
