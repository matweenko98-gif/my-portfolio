import { ArrowRight } from 'lucide-react';
import './ServiceProcess.css';

export default function ServiceProcess({ steps }) {
  return <div className="service-process-grid">{steps.map(([title, text], index) =>
    <article key={title}>
      <div className="service-process-index"><span>{String(index + 1).padStart(2, '0')}</span><ArrowRight size={18} aria-hidden="true" /></div>
      <h3>{title}</h3><p>{text}</p>
    </article>
  )}</div>;
}
