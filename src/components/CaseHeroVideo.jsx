import React, { useEffect, useRef, useState } from 'react';

export default function CaseHeroVideo({ video, poster, title }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const ratio = video.width > 0 && video.height > 0 ? `${video.width} / ${video.height}` : '16 / 9';

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setLoaded(true);
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    }, { threshold: 0.01 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || failed) return;
    const syncPlayback = () => {
      if (visible && !document.hidden) {
        // Browser settings may block autoplay; native controls remain available.
        player.play().catch(() => {});
      } else {
        player.pause();
      }
    };
    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      player.pause();
    };
  }, [loaded, visible, failed]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-full" style={{ aspectRatio: ratio, width: video.width > 0 && video.height > 0 ? `min(100%, ${85 * video.width / video.height}vh)` : '100%' }}>
      {!failed ? (
        <video ref={playerRef} src={loaded ? video.url : undefined} poster={poster || undefined}
          controls autoPlay={visible} loop muted playsInline preload="none"
          width={video.width} height={video.height} aria-label={`Видео проекта ${title || ''}`}
          className="block w-full h-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <>
          {poster && <img src={poster} alt={title || 'Обложка проекта'} className="absolute inset-0 w-full h-full object-contain" />}
          <p role="status" className="absolute bottom-0 inset-x-0 bg-white/90 p-3 text-sm text-center">Видео недоступно. Попробуйте позже.</p>
        </>
      )}
    </div>
  );
}
