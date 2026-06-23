import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import contentData from '../contentData';
import { reviewImg } from '../utils/imageUtils';

const SCROLL_ROTATIONS = 1.2;
const TRACK_COPIES = 3;

function getVisibleItems(items, isMobile) {
  return items.filter((card) => !(isMobile && card.desktopOnly));
}

function buildTrackLayout(items, isMobile, gap) {
  if (isMobile) {
    const gapVal = gap || 36;
    const cardWidth = 320;
    let currentY = 0;
    
    const layout = items.map((card, idx) => {
      const height = Math.round(cardWidth / card.aspectRatio);
      const trackY = currentY;
      currentY += height + gapVal;
      const left = idx % 2 === 0 ? '4%' : '8%';
      
      return {
        ...card,
        left,
        trackY,
        renderedHeight: height,
        colIdx: 0,
      };
    });
    
    return {
      layout,
      columnHeights: [currentY],
      columnStaggers: [0],
    };
  } else {
    const columnLefts = ['calc(50% - 558px)', 'calc(50% - 180px)', 'calc(50% + 198px)'];
    const columnStaggers = [-125, 55, -55]; // Side columns staggered higher
    const gapVal = gap || 18;
    const cardWidth = 360; // standard width on desktop
    
    const columnYs = [0, 0, 0];
    const columns = [[], [], []];
    
    items.forEach((card) => {
      // Find column with minimum height
      let minColIdx = 0;
      let minColY = columnYs[0];
      for (let i = 1; i < 3; i++) {
        if (columnYs[i] < minColY) {
          minColY = columnYs[i];
          minColIdx = i;
        }
      }
      
      const height = Math.round(cardWidth / card.aspectRatio);
      const trackY = columnYs[minColIdx];
      columnYs[minColIdx] += height + gapVal;
      
      columns[minColIdx].push({
        ...card,
        left: columnLefts[minColIdx],
        trackY,
        renderedHeight: height,
        colIdx: minColIdx,
      });
    });
    
    return {
      layout: columns.flat(),
      columnHeights: columnYs,
      columnStaggers,
    };
  }
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

  const [isMobile, setIsMobile] = useState(false);
  const reviewsOffsetTopRef = useRef(0);
  const reviewsHeightRef = useRef(0);
  const containerHeightRef = useRef(0);

  useEffect(() => {
    const handleResizeWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResizeWidth();
    window.addEventListener('resize', handleResizeWidth);
    return () => window.removeEventListener('resize', handleResizeWidth);
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateStyles = () => {
      if (!reviewsRef.current || !trackRef.current || !containerRef.current) return;

      const height = reviewsHeightRef.current || window.innerHeight;
      const scrollableHeight = height - window.innerHeight;
      if (scrollableHeight <= 0) { ticking = false; return; }

      const offsetTop = reviewsOffsetTopRef.current || 0;
      const relativeScroll = window.scrollY - offsetTop;
      const progress = Math.max(0, Math.min(1, relativeScroll / scrollableHeight));

      const currentIsMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, currentIsMobile);
      const { columnHeights, columnStaggers } = buildTrackLayout(
        visibleItems,
        currentIsMobile,
        currentIsMobile ? 36 : 18
      );
      const maxColHeight = Math.max(...columnHeights);
      const totalScroll = maxColHeight * SCROLL_ROTATIONS;

      const translateY = -progress * totalScroll;
      const containerHeight = containerHeightRef.current || 400;
      const containerCenterY = containerHeight / 2;

      // Translate track in compositor
      trackRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;

      // Scale cards purely via math (no getBoundingClientRect calls)
      const cards = cardsRef.current;
      for (let cycle = 0; cycle < TRACK_COPIES; cycle++) {
        for (let idx = 0; idx < visibleItems.length; idx++) {
          const review = visibleItems[idx];
          const cardIndex = cycle * visibleItems.length + idx;
          const el = cards[cardIndex];
          if (!el) continue;

          const colIdx = review.colIdx;
          const colStagger = columnStaggers[colIdx];
          const cardTop = colStagger + review.trackY + cycle * columnHeights[colIdx];
          const cardHeight = review.renderedHeight;
          const cardCenterY = cardTop + cardHeight / 2 + translateY;

          const distFromCenter = Math.abs(cardCenterY - containerCenterY);
          const maxDist = containerHeight * 0.55;
          const normDist = Math.min(1, distFromCenter / maxDist);
          const t = 1 - normDist;
          const easeT = t * t * (3 - 2 * t);
          const scale = 0.94 + 0.06 * easeT;

          el.style.transform = `scale(${scale})`;
        }
      }

      ticking = false;
    };

    const setSectionHeight = () => {
      if (!reviewsRef.current || !containerRef.current) return;

      const currentIsMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, currentIsMobile);
      const { columnHeights } = buildTrackLayout(
        visibleItems,
        currentIsMobile,
        currentIsMobile ? 36 : 18
      );
      const maxColHeight = Math.max(...columnHeights);
      const scrollPx = maxColHeight * SCROLL_ROTATIONS;

      const calculatedHeight = window.innerHeight + scrollPx;
      reviewsRef.current.style.height = `${calculatedHeight}px`;

      // Cache measurements
      reviewsOffsetTopRef.current = reviewsRef.current.offsetTop;
      reviewsHeightRef.current = calculatedHeight;
      containerHeightRef.current = containerRef.current.offsetHeight;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateStyles);
      }
    };

    const onResize = () => {
      setSectionHeight();
      onScroll();
    };

    setSectionHeight();
    updateStyles();

    // Additional layout settle delay check
    const settleTimeout = setTimeout(() => {
      setSectionHeight();
      updateStyles();
    }, 600);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(settleTimeout);
    };
  }, [reviewsData]);

  const visibleItems = getVisibleItems(reviewsData.items, isMobile);
  const { layout, columnHeights, columnStaggers } = buildTrackLayout(
    visibleItems,
    isMobile,
    isMobile ? 36 : 18
  );

  return (
    <section
      id="reviews"
      ref={reviewsRef}
      className="relative border-b\u00a0border-zinc-100 bg-white"
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
          className="max-w-3xl mb-8 select-none"
        >
          <div className="overflow-hidden mb-2">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
              transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-black mb-0 md:whitespace-nowrap"
            >
              {reviewsData.title}
            </motion.h2>
          </div>
          <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed">
            {reviewsData.subtitle}
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative w-full h-[58vh] overflow-hidden rounded-md border border-zinc-200 bg-zinc-50/20"
        >
          <div ref={trackRef} className="relative w-full will-change-transform">
            {Array.from({ length: TRACK_COPIES }, (_, cycle) =>
              layout.map((review, idx) => {
                const cardIndex = cycle * layout.length + idx;
                const colIdx = review.colIdx;
                const colHeight = columnHeights[colIdx];
                const colStagger = columnStaggers[colIdx];
                
                return (
                  <div
                    key={`${review.id}-${cycle}`}
                    ref={(el) => { cardsRef.current[cardIndex] = el; }}
                    className="absolute w-auto h-auto transition-transform ease-out duration-75 will-change-transform hover:z-20"
                    style={{
                      left: review.left,
                      top: colStagger + review.trackY + cycle * colHeight,
                    }}
                  >
                    <img
                      src={reviewImg(review.imageUrl)}
                      alt={`Отзыв ${review.id}`}
                      loading="lazy"
                      decoding="async"
                      width={720}
                      height={Math.round(720 / (review.aspectRatio || 1.5))}
                      className="w-[85vw] sm:w-auto sm:max-w-[320px] md:w-[360px] h-auto object-contain rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] cursor-default border border-zinc-200/30 bg-white"
                    />
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
