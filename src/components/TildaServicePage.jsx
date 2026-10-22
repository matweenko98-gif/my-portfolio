import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Check, Layers, LayoutTemplate, ShoppingBag, SlidersHorizontal, Send, LockKeyhole } from 'lucide-react';
import Sidebar from './Sidebar';
import './MultipageServicePage.css';
import './TildaServicePage.css';

const icons=[LayoutTemplate,Layers,Send,ShoppingBag,SlidersHorizontal,LockKeyhole];
const prices=[['Лендинг','30 000','landing'],['Многостраничный сайт','45 000','multipage'],['Интернет-магазин','45 000','online-store']];
function Heading({number,label,children}) {return <div className="tp-heading"><p className="mp-eyebrow">[ {number} / {label} ]</p><h2>{children}</h2></div>;}
export default function TildaServicePage({service:s}) {
 const brief='/brief?service=tilda&source=tilda-service';
 const cta=<Link className="mp-button" to={brief}>{s.cta}<ArrowUpRight size={17}/></Link>;
 return <div className="mp-page tp-page"><Sidebar activeSection="services"/><main className="mp-main">
  <section className="mp-hero tp-hero"><div className="mp-topline"><nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><span aria-current="page">{s.name}</span></nav><span className="mp-edition">KSENWEB / УСЛУГИ</span></div>
   <div className="tp-hero-grid"><div><p className="mp-eyebrow">[ ДИЗАЙН И РАЗРАБОТКА НА TILDA ]</p><h1>{s.headline[0]}<br/><span>{s.headline[1]}</span></h1><p className="mp-lead">{s.lead}</p><p className="mp-hero-copy">{s.intro}</p><div className="mp-actions">{cta}<a className="mp-text-link" href="#tilda-prices">Посмотреть тарифы<ArrowUpRight size={16}/></a></div></div>
    <div className="tp-editor" role="img" aria-label="Схема работы: макет в Figma, сборка в Zero Block, редактирование в Tilda"><div className="tp-editor-top"><span>KSENWEB / TILDA</span><span>01—03</span></div><img src="https://static.tildacdn.net/tild3063-6363-4339-a138-336166373032/logo___1.svg" alt="" width="110" height="110"/><div className="tp-editor-flow">{[['01','Figma','Макеты'],['02','Zero Block','Сборка'],['03','Tilda','Редактор']].map(([n,title,text])=><div key={n}><span>{n}</span><strong>{title}</strong><small>{text}</small></div>)}</div><p>Индивидуальный дизайн<br/>Редактирование через платформу</p></div>
   </div>
  </section>
  <section className="mp-section tp-capabilities"><Heading number="01" label="ВОЗМОЖНОСТИ ПЛАТФОРМЫ">{s.scopeTitle[0]}<br/><span>{s.scopeTitle[1]}</span></Heading><div className="tp-capability-grid">{s.scope.map(([title,text],i)=>{const Icon=icons[i];return <article key={title}><div className="tp-card-top"><Icon size={30} strokeWidth={1}/><span>0{i+1}</span></div><h3>{title}</h3><p>{text}</p></article>;})}</div></section>
  <section className="mp-section tp-formats"><Heading number="02" label="ФОРМАТЫ САЙТОВ">Лендинг, сайт компании<br/><span>или интернет-магазин</span></Heading><div className="tp-format-grid">{s.related.map((item,i)=>{const Icon=[LayoutTemplate,Layers,ShoppingBag][i];return <article key={item.href}><Icon size={36} strokeWidth={1}/><h3>{item.title}</h3><p>{item.text}</p><Link className="mp-text-link" to={item.href}>Подробнее о формате<ArrowUpRight size={16}/></Link></article>;})}</div><aside className="tp-platform-note"><p>Если возможностей Tilda недостаточно для вашей задачи, рассмотрим индивидуальную разработку с админкой.</p><Link className="mp-text-link" to="/services/websites">Все варианты создания сайта<ArrowUpRight size={16}/></Link></aside></section>
  <section className="mp-section tp-portfolio"><div><p className="mp-eyebrow">[ ПОРТФОЛИО ]</p><h2>Примеры работ<br/><span>в разделе кейсов</span></h2><p>Посмотрите сайты и веб-приложения с описанием задач и принятых решений, чтобы оценить дизайн и подход к работе.</p></div><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17}/></Link></section>
  <section className="mp-section tp-prices" id="tilda-prices"><Heading number="03" label="СТОИМОСТЬ">Стоимость разработки<br/><span>на Tilda</span></Heading><div className="tp-price-grid">{prices.map(([name,price,slug],i)=><article key={slug}><span className="mp-eyebrow">0{i+1} / {name}</span><h3>от {price} <span>₽</span></h3><p>{s.related[i].text}</p><Link className="mp-button" to={`/brief?service=${slug}&source=tilda-price`}>Обсудить проект<ArrowUpRight size={16}/></Link></article>)}</div><div className="tp-price-notes"><p>{s.priceText}</p><p><Check size={16}/>Стоимость и срок фиксируем после согласования состава работ</p></div></section>
  <section className="mp-section tp-process"><Heading number="04" label="ЭТАПЫ РАБОТЫ">Как проходит<br/><span>создание сайта на Tilda</span></Heading><div className="tp-step-list">{s.steps.map(([title,text],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <section className="mp-section mp-faq tp-faq"><Heading number="05" label="FAQ">Вопросы о разработке<br/><span>и работе с Tilda</span></Heading>{s.faq.map(([q,a])=><details key={q}><summary><h3>{q}</h3><Plus size={18} className="mp-faq-icon"/></summary><p>{a}</p></details>)}</section>
  <section className="mp-contact mp-section"><p className="mp-eyebrow">[ ОБСУДИТЬ ПРОЕКТ ]</p><h2>Обсудим ваш сайт<br/><span>на Tilda</span></h2><div className="mp-contact-bottom"><p>Расскажите о задаче и текущем этапе проекта. Определим состав работ, обсудим материалы, сроки и стоимость.</p><div>{cta}</div></div></section>
  <footer className="mp-footer"><Link to="/">KSENWEB / Ксения Матвеенко</Link><div><Link to="/privacy-policy">Конфиденциальность</Link><Link to="/terms">Условия использования</Link></div></footer>
 </main></div>;
}
