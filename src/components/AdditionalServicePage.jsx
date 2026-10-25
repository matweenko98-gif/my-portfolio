import { ServiceScopeVisual } from './ServiceScopeVisual';
import Reviews from './Reviews';
import ServiceContact from './ServiceContact';
import { LandingProjects } from './LandingConversion';
import { usePricing } from './CurrencyProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import WebsiteServicePage from './WebsiteServicePage';
import TildaServicePage from './TildaServicePage';
import './MultipageServicePage.css';

export default function AdditionalServicePage({ service: originalService }) {
  const { text } = usePricing();
  const s = text(originalService);
  if (s.slug === 'tilda') return <TildaServicePage service={s}/>;
  if (s.slug === 'websites') return <WebsiteServicePage service={s}/>;
  const brief = '#mp-contact';
  const heading = (number, label, lines) => <div className="mp-section-heading"><p className="mp-eyebrow">[ {number} ] {label}</p><h2>{lines[0]}<br/><span>{lines[1]}</span></h2></div>;
  const cta = <a className="mp-button" href={brief}>Получить оценку проекта<ArrowUpRight size={17}/></a>;
  return <div className="mp-page additional-page"><Sidebar activeSection="services"/><main className="mp-main">
    <section className="mp-hero"><div className="mp-topline"><nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><Link to="/#services">Услуги</Link><span>/</span><span aria-current="page">{s.name}</span></nav><span className="mp-edition">KSENWEB / УСЛУГИ</span></div><div className="mp-hero-intro"><p className="mp-eyebrow">[ ДИЗАЙН И РАЗРАБОТКА ]</p><p>Ксения Матвеенко</p></div><h1>{s.headline[0]}<br/><span>{s.headline[1]}</span></h1><div className="mp-hero-bottom"><div><p className="mp-lead">{s.lead}</p><p className="mp-hero-copy">{s.intro}</p><div className="mp-actions">{cta}<Link className="mp-text-link" to="/cases">Посмотреть кейсы ↗</Link></div></div><div className="mp-hero-facts"><span>{s.priceLabel}</span><strong>{s.price}</strong><a href="#service-price">Стоимость и состав работ ↗</a></div></div></section>
    <section className="mp-section additional-scope" id="mp-scope">{heading('01','СОСТАВ РАБОТ',s.scopeTitle)}<div className="mp-scope-grid">{s.scope.map(([title,text],i)=><div key={title}><ServiceScopeVisual service={s.slug} index={i}/><span className="mp-row-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    {s.related && <section className="mp-section">{heading('02','ВЫБОР УСЛУГИ',['Форматы и услуги','для вашего проекта'])}<div className="mp-reading-list">{s.related.map(item=><Link key={item.href} to={item.href}><h3>{item.title}</h3><p>{item.text}</p><span className="mp-text-link">{item.href.startsWith('/blog') ? 'Читать статью ↗' : 'Подробнее об услуге ↗'}</span></Link>)}</div>{s.slug==='websites' && <aside className="os-platform-note"><h3>Tilda или индивидуальная разработка</h3><p>Tilda подходит для презентационных сайтов и стандартных сценариев продаж. Если нужны особая логика, роли пользователей или нестандартная админка, обсудим разработку на коде. Выбор зависит от требований и бюджета.</p><Link className="mp-text-link" to="/services/tilda">Подробнее о создании сайтов на Tilda ↗</Link></aside>}{s.slug==='tilda' && <aside className="os-platform-note"><h3>Если возможностей Tilda недостаточно</h3><p>Для нестандартной логики, сложных кабинетов и собственной системы управления рассмотрим индивидуальную разработку. Сначала проверим требования, затем выберем технологию.</p><Link className="mp-text-link" to="/services/websites">Все варианты создания сайта ↗</Link></aside>}</section>}
    <section className="mp-section mp-projects">{heading('03','ПОРТФОЛИО',['Примеры работ','в разделе кейсов'])}<LandingProjects service={s.slug}/><div className="mp-portfolio-link"><p>Посмотрите сайты и веб-приложения с описанием задач и принятых решений, чтобы оценить дизайн и подход к работе.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17}/></Link></div></section>
    <section className="mp-section" id="service-price">{heading('04','СТОИМОСТЬ',['Что входит','в оценку проекта'])}<div className="mp-portfolio-link"><div><p className="mp-eyebrow">{s.priceLabel}</p><p className="mp-lead">{s.price}</p><p>{s.priceText}</p></div>{cta}</div></section>
    <Reviews/>
    <section className="mp-section">{heading('05','ПРОЦЕСС',['Как проходит','работа над проектом'])}<div className="mp-process-list">{s.steps.map(([title,text],i)=><div key={title}><span className="mp-process-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <section className="mp-faq mp-section">{heading('06','FAQ',['Ответы на вопросы','перед заказом'])}{s.faq.map(([q,a])=><details key={q}><summary><h3>{q}</h3><Plus size={18} className="mp-faq-icon"/></summary><p>{a}</p></details>)}</section>
    <ServiceContact service={s.slug} title={s.cta}/>
  </main></div>;
}
