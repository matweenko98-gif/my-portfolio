import React, { useEffect, useRef } from 'react';
import contentData from '../contentData';

export default function Reviews() {
  const reviewsRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const reviewsData = contentData.reviews;

  useEffect(() => {
    let isVisible = false;
    let ticking = false;

    // Сетки позиционирования по горизонтали для мобильных и десктопных устройств
    const mobileLefts = {
      rev1: "4%",
      rev2: "8%",
      rev5: "4%",
      rev7: "8%"
    };

    const updateStyles = () => {
      if (!reviewsRef.current || !containerRef.current) return;
      const rect = reviewsRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      if (scrollableHeight <= 0) return;

      // Вычисляем прогресс скролла (от 0 до 1) внутри секции отзывов
      const progress = -rect.top / scrollableHeight;
      const clampedProgress = Math.max(0, Math.min(1, progress));

      const H = containerRect.height;
      const isMobile = window.innerWidth < 768;

      reviewsData.items.forEach((card, idx) => {
        const el = cardsRef.current[idx];
        if (!el) return;

        // На мобильных скрываем часть отзывов для разгрузки интерфейса и повышения читаемости
        if (isMobile && card.desktopOnly) {
          el.style.display = 'none';
          return;
        } else {
          el.style.display = 'block';
        }

        // Адаптивное позиционирование по горизонтали
        el.style.left = isMobile ? (mobileLefts[card.id] || "5%") : card.left;

        // Расстояние вертикального перемещения карточки (высота контейнера * коэффициент)
        const travel = H * 1.7;
        const startY = isMobile ? (card.startYMobile || card.startY) : card.startY;

        // Координата Y с учетом индивидуальной скорости (параллакс)
        const y = startY - clampedProgress * travel * card.speed;

        // Легкое боковое смещение (покачивание) по синусоиде во время скролла
        const driftAmount = isMobile ? (card.driftMobile || card.drift * 0.4) : card.drift;
        const xOffset = Math.sin(clampedProgress * Math.PI) * driftAmount;

        // Высота карточки для расчета её центра
        const cardHeight = el.offsetHeight || 160;

        // Вычисление центра карточки относительно области отзывов (высотой 58vh)
        const H_container = H * 0.58;
        const centerY = y + cardHeight / 2;
        const containerCenter = H_container / 2;

        // Вычисляем расстояние от центра области
        const distFromCenter = Math.abs(centerY - containerCenter);
        const maxDist = H_container * 0.55; // Граница затухания

        // Рассчитываем коэффициент фокусировки (1 в центре, 0 по краям)
        const normDist = Math.min(1, distFromCenter / maxDist);
        const t = 1 - normDist;
        const easeT = t * t * (3 - 2 * t); // Smoothstep для мягкости переходов

        // Определение параметров анимации
        const opacity = 0.15 + 0.85 * easeT;
        const scale = 0.94 + 0.06 * easeT;

        // Применение стилей с использованием аппаратного ускорения
        el.style.transform = `translate3d(${xOffset}px, ${y}px, 0) scale(${scale})`;
        el.style.opacity = opacity;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking && isVisible) {
        requestAnimationFrame(updateStyles);
        ticking = true;
      }
    };

    // Активируем анимации скролла только когда секция отзывов находится в зоне видимости
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);
          requestAnimationFrame(updateStyles);
        } else {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        }
      },
      { threshold: 0.01 } // Срабатывает при появлении даже 1% секции на экране
    );

    if (reviewsRef.current) {
      observer.observe(reviewsRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reviewsData]);

  return (
    <section
      id="reviews"
      ref={reviewsRef}
      className="relative h-[160vh] border-b border-zinc-100 bg-white"
    >
      {/* Фиксируемый контейнер на высоту экрана */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-12 px-6 md:px-12 lg:px-16"
      >
        {/* Статичный заголовок секции */}
        <div className="max-w-[640px] mb-8 select-none">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            {reviewsData.title}
          </h2>
          <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed">
            {reviewsData.subtitle}
          </p>
        </div>

        {/* Контейнер со скриншотами (высота 58% от высоты экрана) */}
        <div className="relative w-full h-[58vh] overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/20 shadow-inner">

          {/* Градиентные маски сверху и снизу для плавного размытия и исчезновения плашек */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Область скроллящихся карточек */}
          <div className="relative w-full h-full">
            {reviewsData.items.map((review, idx) => {
              return (
                <div
                  key={review.id}
                  ref={el => cardsRef.current[idx] = el}
                  className="absolute bg-white/80 backdrop-blur-md border border-zinc-200/40 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] w-[280px] sm:w-[330px] transition-all ease-out duration-75 will-change-[transform,opacity,filter]"
                  style={{
                    top: 0, // Управляется с помощью translate3d
                  }}
                >
                  {/* =============================================================== */}
                  {/* КОММЕНТАРИЙ ДЛЯ ЗАМЕНЫ НА СКРИНШОТ:                             */}
                  {/* Чтобы заменить карточку на реальный скриншот сообщения,          */}
                  {/* добавьте свойство `imageUrl` в соответствующий объект отзыва    */}
                  {/* в файле contentData.js, например: imageUrl: "/screenshot1.png"   */}
                  {/* =============================================================== */}
                  {review.imageUrl ? (
                    <div className="relative w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                      <img
                        src={review.imageUrl}
                        alt={`Отзыв от ${review.name}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    /* Чистая плашка-заглушка отзыва (стилизация под Telegram-сообщение) */
                    <div className="flex flex-col gap-2.5">

                      {/* Шапка сообщения: Аватар, Имя, Время */}
                      <div className="flex items-center gap-3 relative pr-10">
                        {/* Круглый аватар с уникальным градиентом */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                          style={{
                            background: review.avatarColor || 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
                          }}
                        >
                          {review.avatarInitials}
                        </div>

                        {/* Имя и Username */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-zinc-900 leading-tight truncate">
                            {review.name}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate">
                            {review.username}
                          </span>
                        </div>

                        {/* Время */}
                        <span className="text-[10px] text-zinc-400 absolute top-0.5 right-0 font-medium">
                          {review.time}
                        </span>
                      </div>

                      {/* Текст сообщения */}
                      <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-medium">
                        {review.text}
                      </p>

                      {/* Нижняя часть плашки: статус верификации */}
                      <div className="flex items-center justify-between text-[9.5px] text-zinc-400/80 font-medium border-t border-zinc-100/50 pt-2 mt-1 select-none">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-sky-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Сообщение подтверждено</span>
                        </span>
                        <span className="text-sky-500 font-bold tracking-tight text-[11px]">
                          ✓✓
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
