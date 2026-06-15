import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import contentData from '../contentData';

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
    const columnLefts = ['calc(50% - 543px)', 'calc(50% - 165px)', 'calc(50% + 213px)'];
    const columnStaggers = [-125, 55, -55]; // Side columns staggered higher
    const gapVal = gap || 48;
    const cardWidth = 330; // standard width on desktop
    
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

      const rect = reviewsRef.current.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      const currentIsMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, currentIsMobile);
      const { columnHeights } = buildTrackLayout(
        visibleItems,
        currentIsMobile,
        currentIsMobile ? 36 : 48
      );
      const maxColHeight = Math.max(...columnHeights);
      const totalScroll = maxColHeight * SCROLL_ROTATIONS;

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

      const currentIsMobile = window.innerWidth < 768;
      const visibleItems = getVisibleItems(reviewsData.items, currentIsMobile);
      const { columnHeights } = buildTrackLayout(
        visibleItems,
        currentIsMobile,
        currentIsMobile ? 36 : 48
      );
      const maxColHeight = Math.max(...columnHeights);
      const scrollPx = maxColHeight * SCROLL_ROTATIONS;

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

  const visibleItems = getVisibleItems(reviewsData.items, isMobile);
  const { layout, columnHeights, columnStaggers } = buildTrackLayout(
    visibleItems,
    isMobile,
    isMobile ? 36 : 48
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
          className="max-w-3xl mb-8 select-none"
        >
          <div className="overflow-hidden mb-2">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
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
                      src={review.imageUrl}
                      alt={`Отзыв ${review.id}`}
                      className="w-[85vw] sm:w-auto sm:max-w-[320px] md:w-[330px] h-auto object-contain rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] cursor-default border border-zinc-200/30 bg-white"
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
