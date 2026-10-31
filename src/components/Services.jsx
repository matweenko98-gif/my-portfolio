import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ArrowRight, Layers, Code, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import contentData from '../contentData';
import { serviceTariffs } from '../content/serviceTariffs';
import { usePricing } from './CurrencyProvider';
import './Services.css';

const Figma = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/>
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
  </svg>
);

const ICON_MAP = {
  '01': Layers,
  '02': RefreshCw,
  '03': Code,
  '04': Figma,
};


const directions = {
  '01': { slug: 'tilda', priceKey: 'landing', description: 'Сайт для вашего бизнеса — от структуры и дизайна до готового запуска.', timing: 'От 7 рабочих дней', result: 'Готовый сайт с формами заявок и управлением контентом' },
  '02': { slug: 'redesign', priceKey: 'redesign', description: 'Обновлю существующий сайт: сделаю предложение понятнее, а путь к заявке — удобнее.', timing: 'От 5 рабочих дней', result: 'Обновлённый дизайн и согласованные доработки сайта' },
  '03': { slug: 'web-apps', priceKey: 'web-apps', description: 'Разработаю сервис или первую версию продукта для проверки вашей идеи.', timing: 'Срок — по составу функций', result: 'Рабочий продукт с согласованными функциями и интеграциями' },
  '04': { slug: 'ui-ux-design', priceKey: 'ui-ux-design', description: 'Спроектирую логику и визуальный стиль сайта или приложения для вашей команды разработки.', timing: 'От 10 рабочих дней', result: 'Прототипы, макеты в Figma и компоненты для разработки' },
};
const formats = [['landing', 'Лендинги'], ['multipage', 'Сайты компаний'], ['online-store', 'Интернет-магазины']];

function TariffSlider({ number, timing }) {
  const { text } = usePricing();
  const tariffs = serviceTariffs[number];
  const track = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = track.current;
    const update = () => {
      const cards = Array.from(element.children);
      let nearest = 0;
      cards.forEach((card, index) => {
        if (Math.abs(card.offsetLeft - cards[0].offsetLeft - element.scrollLeft) < Math.abs(cards[nearest].offsetLeft - cards[0].offsetLeft - element.scrollLeft)) nearest = index;
      });
      setActive(nearest);
    };
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, []);
  const move = index => {
    const element = track.current;
    element.scrollTo({ left: element.children[index].offsetLeft - element.children[0].offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="home-tariffs" role="region" aria-label={`Тарифы: ${contentData.services.items.find(item => item.number === number).title}`}>
    <div className="home-tariffs-heading"><span>Варианты и стоимость</span>{tariffs.length > 1 && <div className="home-tariffs-controls">
      <span aria-live="polite">{active + 1} / {tariffs.length}</span>
      <button type="button" aria-label="Предыдущий тариф" disabled={active === 0} onClick={() => move(active - 1)}><ArrowLeft size={16}/></button>
      <button type="button" aria-label="Следующий тариф" disabled={active === tariffs.length - 1} onClick={() => move(active + 1)}><ArrowRight size={16}/></button>
    </div>}</div>
    <div className="home-tariffs-track" ref={track} tabIndex={tariffs.length > 1 ? 0 : undefined} aria-label="Тарифы — листайте по горизонтали" onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' && active < tariffs.length - 1) { event.preventDefault(); move(active + 1); }
      if (event.key === 'ArrowLeft' && active > 0) { event.preventDefault(); move(active - 1); }
    }}>
      {tariffs.map((tariff, index) => <div className="home-tariff" key={tariff.title} role="group" aria-label={`${index + 1} из ${tariffs.length}: ${tariff.title}`}>
        <h4>{tariff.title}</h4>
        <p className="home-tariff-price">{text(tariff.price)}</p>
        <p className="home-tariff-description">{tariff.desc}</p>
        <ul>{tariff.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </div>)}
    </div>
    <p className="home-tariffs-note">{timing} · Точный объём — после обсуждения</p>
  </div>;
}

function ServiceCard({ service }) {
  const direction = directions[service.number];
  const Icon = ICON_MAP[service.number];
  return <article id={`service-card-${service.number}`} className="home-service-card">
    <div className="home-service-main">
      <div className="home-service-title"><span className="home-service-icon"><Icon size={22} aria-hidden="true"/></span><div><span className="home-service-number">[ УСЛУГА {service.number} ]</span><h3>{service.title}</h3></div></div>
      <p className="home-service-description">{direction.description}</p>
      {service.number === '01' && <nav className="home-service-formats" aria-label="Форматы сайтов">
        {formats.map(([slug, label]) => <Link key={slug} to={`/services/${slug}`}>{label}</Link>)}
      </nav>}
      <p className="home-service-result"><span>На выходе</span>{direction.result}</p>
      <div className="home-service-actions">
        <Link className="home-service-discuss" to="/#contacts">Обсудить задачу<ArrowUpRight size={16} aria-hidden="true"/></Link>
        <Link className="home-service-details" to={`/services/${direction.slug}`}>Подробнее об услуге<ArrowUpRight size={15} aria-hidden="true"/></Link>
      </div>
    </div>
    <TariffSlider number={service.number} timing={direction.timing}/>

  </article>;
}

export default function Services() {
  return <section id="services" className="home-services" aria-labelledby="home-services-title">
    <header className="home-services-heading">
      <h2 id="home-services-title">{contentData.services.title}</h2>
      <p>От сайта для бизнеса до цифрового продукта. Выберите задачу — внутри рассказываю о составе работ и процессе.</p>
    </header>
    <div className="home-services-list">
      {contentData.services.items.map(service => <motion.div key={service.number}
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0, margin: '160px' }} transition={{ duration: 0.45 }}>
        <ServiceCard service={service}/>
      </motion.div>)}
    </div>
    <p className="home-services-note">Стоимость и сроки — ориентиры. Точную оценку согласуем после обсуждения задачи.</p>
  </section>;
}
