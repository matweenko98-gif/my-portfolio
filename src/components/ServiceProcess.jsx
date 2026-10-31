import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react';
import './ServiceProcess.css';

export default function ServiceProcess({ steps, horizontal = false }) {
  const track = useRef(null);
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ start: true, end: false, progress: 0 });
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!horizontal || !track.current) return;
    const element = track.current;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      setPosition({ start: element.scrollLeft <= 2, end: element.scrollLeft >= max - 2, progress: max > 0 ? element.scrollLeft / max : 1 });
    };
    const wheel = event => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 0 || (event.deltaY < 0 && element.scrollLeft <= 1) || (event.deltaY > 0 && element.scrollLeft >= max - 1)) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? element.clientWidth : 1);
      element.scrollLeft += delta;
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    element.addEventListener('wheel', wheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
      element.removeEventListener('wheel', wheel);
    };
  }, [horizontal, steps.length]);

  const move = direction => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || element.clientWidth) + gap), behavior: reducedMotion() ? 'instant' : 'smooth' });
  };
  const finishDrag = event => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const cards = steps.map(([title, text], index) => <article key={title}>
    <div className="service-process-index"><span>{String(index + 1).padStart(2, '0')}</span><ArrowRight size={18} aria-hidden="true" /></div>
    <h3>{title}</h3><p>{text}</p>
  </article>);
  if (!horizontal) return <div className="service-process-grid">{cards}</div>;

  return <div className="service-process-carousel">
    <div ref={track} className={`service-process-grid service-process-horizontal${dragging ? ' is-dragging' : ''}`} tabIndex={0} role="region" aria-label="Этапы работы. Используйте стрелки или перетащите карточки."
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: reducedMotion() ? 'instant' : 'smooth' }); }
      }}
      onPointerDown={event => {
        if (event.pointerType === 'touch' || event.button !== 0) return;
        drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={event => {
        if (!drag.current || drag.current.id !== event.pointerId) return;
        event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
      }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
      {cards}
    </div>
    <div className="service-process-controls">
      <span className="service-process-gesture"><MoveHorizontal size={18} aria-hidden="true"/><span>Листайте или перетаскивайте</span></span>
      <div className="service-process-progress" aria-hidden="true"><span style={{ transform: `translateX(${position.progress * 200}%)` }}/></div>
      <div className="service-process-arrows"><button type="button" aria-label="Предыдущий этап" disabled={position.start} onClick={() => move(-1)}><ArrowLeft size={20}/></button><button type="button" aria-label="Следующий этап" disabled={position.end} onClick={() => move(1)}><ArrowRight size={20}/></button></div>
    </div>
  </div>;
}
