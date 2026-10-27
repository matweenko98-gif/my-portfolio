import ServiceProcess from './ServiceProcess';
import RelatedContentLink from './RelatedContentLink';
import Reviews from './Reviews';
import { LandingProjects, LandingLeadForm } from './LandingConversion';
import { ScopeVisual } from './LandingVisuals';
import { usePricing } from './CurrencyProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Check, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { multipageService as originalService } from '../content/multipageService';
import { trackConversion } from '../utils/analytics';
import './MultipageServicePage.css';


function ContactLink({ children = 'Получить оценку проекта', className = '' }) {
  return <a href="#mp-contact" className={`mp-button ${className}`}>{children}<ArrowUpRight size={17} aria-hidden="true"/></a>;
}

function SectionHeading({ number, label, children, dark = false }) {
  return <div className={`mp-section-heading${dark ? ' mp-heading-dark' : ''}`}>
    <p className="mp-eyebrow"><span>[ {number} ]</span> {label}</p>
    <h2>{children}</h2>
  </div>;
}

function SiteMap() {
  return <div className="mp-sitemap" aria-label="Пример структуры: главная, услуги, о компании, кейсы, контакты; страницы услуг связаны с кейсами и заявкой">
    <div className="mp-diagram-top"><span>АРХИТЕКТУРА САЙТА</span><span>Tilda / Zero Block</span></div>
    <div className="mp-map-root"><span className="mp-map-dot" />Главная<span>01</span></div>
    <div className="mp-map-branches">
      {['Услуги', 'О компании', 'Кейсы', 'Контакты'].map((label, index) => <div className="mp-map-node" key={label}><span>0{index + 2}</span>{label}</div>)}
    </div>
    <div className="mp-map-bottom"><div><span>Услуга → Кейс → Заявка</span><p>Со страницы услуги клиент переходит<br />к примеру работы или форме заявки.</p></div><ArrowUpRight size={30} strokeWidth={1} aria-hidden="true" /></div>
  </div>;
}

export default function MultipageServicePage() {
  const { money, text } = usePricing();
  const service = text(originalService);
  return <div className="mp-page service-page company-page">
    <Sidebar activeSection="services" />
    <main className="mp-main">
      <section className="mp-hero" aria-labelledby="mp-title">
        <div className="mp-topline">
          <nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><Link to="/#services">Услуги</Link><span>/</span><span aria-current="page">Многостраничный сайт</span></nav>
          <span className="mp-edition">KSENWEB / УСЛУГИ</span>
        </div>
        <div className="mp-hero-intro"><p className="mp-eyebrow"><span>[ WEB DEVELOPMENT ]</span></p><p>Ксения Матвеенко<br />Дизайн и разработка</p></div>
        <h1 id="mp-title">Многостраничный<br /><span>сайт под ключ</span></h1>
        <div className="mp-hero-bottom"><div>
          <p className="mp-lead">Сайт компании с отдельными страницами услуг, проектов и контактов</p>
          <p className="mp-hero-copy">Разработаю структуру и дизайн в Figma, разработаю сайт и настрою формы заявок. Tilda или индивидуальную разработку с админкой выберем по нужным функциям.</p>
        <div className="mp-actions"><ContactLink/><a className="mp-text-link" href="#mp-scope">Что входит в разработку ↘</a></div></div><div className="mp-hero-facts"><span>РАЗРАБОТКА ПОД КЛЮЧ</span><strong>{service.price}</strong><p>Для реализации на Tilda<br/>Точный состав и срок — после обсуждения</p><p>Структура · Figma · Tilda<br />Адаптив · Формы · SEO-основа</p><a href="#mp-price">Что входит в стоимость <span aria-hidden="true">↗</span></a></div></div>
      </section>

      <section className="mp-fit mp-section" id="mp-format">
        <SectionHeading number="01" label="ВЫБОР ФОРМАТА">Когда нужен<br /><span>многостраничный сайт</span></SectionHeading>
        <div className="mp-fit-layout lp-fit-layout"><div className="lp-fit-intro"><p className="mp-intro-copy">Многостраничный сайт подходит компании с несколькими услугами или направлениями. На отдельных страницах можно подробно описать каждую услугу, показать связанные проекты и разместить форму заявки.</p><p className="lp-fit-summary">Отдельная страница для каждой услуги. Общая навигация и понятный путь к обращению.</p></div><div className="mp-fit-list">{service.fit.map(([title, text], i) => <div key={title}><span className="mp-row-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div></div>
        <aside className="lp-format-help"><div className="lp-format-help-intro"><h3>Нужен другой формат?</h3><p>Выберите решение под вашу задачу.</p></div><div className="lp-format-help-options"><Link to="/services/landing"><span>Одна услуга или продукт</span><strong>Лендинг<ArrowUpRight size={15}/></strong></Link><Link to="/services/online-store"><span>Каталог с корзиной и заказом</span><strong>Интернет-магазин<ArrowUpRight size={15}/></strong></Link></div></aside>
      </section>

      <section className="mp-architecture mp-section">
        <SectionHeading number="02" label="СТРУКТУРА САЙТА" dark>Какие страницы<br /><span>будут на сайте</span></SectionHeading>
        <div className="mp-architecture-layout"><div className="mp-dark-copy"><p>Обычно сайту компании нужны главная, страницы услуг, информация о компании, проекты и контакты. Если планируете публиковать полезные материалы, добавим блог.</p><p>Для каждой страницы определим содержание и ссылки на другие разделы. Например, на странице услуги разместим подходящие кейсы, условия работы и кнопку для обращения.</p><p className="mp-small-note">На схеме — пример структуры. Состав и количество страниц согласуем под ваш бизнес.</p></div><SiteMap /></div>
      </section>

      <section className="mp-projects mp-section" id="mp-projects">
        <SectionHeading number="03" label="ПОРТФОЛИО">Примеры проектов<br /><span>и решений для бизнеса</span></SectionHeading>
        <LandingProjects service="multipage"/><div className="mp-portfolio-link"><p>В портфолио — сайты и веб-приложения с описанием задач и решений. Посмотрите проекты, чтобы оценить дизайн и подход к разработке.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section className="mp-scope mp-section" id="mp-scope">
        <SectionHeading number="04" label="СОСТАВ УСЛУГИ">Что входит<br /><span>в разработку</span></SectionHeading>
        <div className="mp-scope-grid">{service.scope.map(([title, text], i) => <div key={title}><ScopeVisual index={i} service="multipage"/><span className="mp-row-number">/ 0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
        <p className="mp-scope-note">Перед началом фиксируем, какие страницы, материалы и подключения входят в ваш проект. Состав работы с текстами и изображениями обсуждаем отдельно.</p>
      </section>

      <section className="mp-price mp-section" id="mp-price">
        <SectionHeading number="05" label="ТАРИФ И УСЛОВИЯ" dark>Стоимость<br /><span>многостраничного сайта</span></SectionHeading>
        <div className="mp-price-layout"><div className="mp-price-offer"><p className="mp-eyebrow">МНОГОСТРАНИЧНЫЙ САЙТ НА TILDA</p><div className="mp-price-value">от <strong>{money(45000)}</strong></div><p>Ориентир для сайта компании. Точную стоимость и срок определим после обсуждения структуры и материалов.</p><ContactLink placement="price">Получить оценку проекта</ContactLink></div><div className="mp-price-details"><h3>Основа проекта</h3><ul>{['Структура страниц и индивидуальный дизайн', 'Верстка на Tilda и мобильная адаптация', 'Формы и согласованные подключения', 'Базовая SEO-подготовка и передача проекта'].map(text => <li key={text}><Check size={16} aria-hidden="true" />{text}</li>)}</ul><div className="mp-price-factors"><h3>Что влияет на оценку</h3><p>Количество страниц и уникальных макетов, готовность контента, сложность анимации и внешних интеграций.</p></div><p className="mp-small-note">Тариф Tilda, домен и платные внешние сервисы оплачиваются отдельно. Дополнительные работы согласуем до их выполнения.</p></div></div>
      </section>

      <div className="lp-reviews-marker"><p className="mp-eyebrow"><span>[ 06 ]</span> ОТЗЫВЫ</p></div>
      <Reviews />

      <section className="mp-process mp-section">
        <SectionHeading number="07" label="ЭТАПЫ РАБОТЫ">Как проходит<br /><span>разработка сайта</span></SectionHeading>
        <ServiceProcess steps={service.steps}/>
      </section>

      <section className="mp-faq mp-section">
        <SectionHeading number="08" label="FAQ">Вопросы<br /><span>перед заказом</span></SectionHeading>
        <div>{service.faq.map(([question, answer], i) => <details key={question}><summary><span className="mp-row-number">{String(i + 1).padStart(2, '0')}</span><h3>{question}</h3><Plus size={18} className="mp-faq-icon" aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="mp-reading mp-section" id="related-content">
        <SectionHeading number="09" label="ПОЛЕЗНЫЕ МАТЕРИАЛЫ">Статьи о выборе<br /><span>и дизайне сайта</span></SectionHeading>
        <div className="mp-reading-list"><RelatedContentLink to="/blog/landing-or-multipage-website"><span className="mp-eyebrow">ВЫБОР ФОРМАТА</span><h3>Какой формат сайта выбрать</h3><p>Когда достаточно одной страницы, а когда бизнесу нужна структура из нескольких разделов.</p><span className="mp-text-link">Сравнить форматы<ArrowUpRight size={18} aria-hidden="true" /></span></RelatedContentLink><RelatedContentLink to="/blog/why-website-looks-cheap"><span className="mp-eyebrow">ДИЗАЙН И ДОВЕРИЕ</span><h3>Почему сайт выглядит дёшево</h3><p>Как типографика, фотографии и мобильная версия влияют на восприятие компании.</p><span className="mp-text-link">Посмотреть ошибки<ArrowUpRight size={18} aria-hidden="true" /></span></RelatedContentLink></div>
      </section>

      <section className="mp-contact mp-section" id="mp-contact">
        <div className="mp-contact-bottom lp-contact-layout"><div className="lp-contact-intro"><p className="mp-eyebrow"><span>[ ОБСУДИТЬ ПРОЕКТ ]</span></p><h2>Обсудим сайт<br /><span>вашей компании</span></h2><p>Расскажите о бизнесе — определим разделы, материалы и первый этап разработки. Подготовлю предварительную оценку стоимости и сроков.</p><a className="mp-text-link lp-telegram-link" href={contentData.contacts.messengers.telegram.url} target="_blank" rel="noopener noreferrer" onClick={() => trackConversion('contact_clicked', {contact_method:'telegram',service:'multipage',placement:'footer'})}>Или напишите мне в Telegram<ArrowUpRight size={16}/></a></div><LandingLeadForm service="multipage"/></div>
      </section>
    </main>
  </div>;
}
