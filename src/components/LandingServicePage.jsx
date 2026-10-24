import { ScopeVisual } from './LandingVisuals';
import Reviews from './Reviews';
import { LandingProjects, LandingLeadForm } from './LandingConversion';
import { usePricing } from './CurrencyProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Check, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { landingService as originalService } from '../content/landingService';
import { trackConversion } from '../utils/analytics';
import './MultipageServicePage.css';


function ContactLink({ children = 'Обсудить лендинг', className = '', placement }) {
  const message = 'Здравствуйте! Меня интересует лендинг. Хочу обсудить предложение, сроки и стоимость разработки.';
  const href = `${contentData.contacts.messengers.telegram.url.replace(/\/$/, '')}?text=${encodeURIComponent(message)}`;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`mp-button ${className}`}
    onClick={() => trackConversion('contact_clicked', { contact_method: 'telegram', service: 'landing', placement })}>
    {children}<ArrowUpRight size={17} aria-hidden="true" />
  </a>;
}

const keepWords = value => value.replace(/(^|\s)([вксоуаи]|на|из|от|до|по|об|без|для|или)\s+(?=\S)/gi, '$1$2\u00a0');

function SectionHeading({ number, label, children, dark = false }) {
  return <div className={`mp-section-heading${dark ? ' mp-heading-dark' : ''}`}>
    <p className="mp-eyebrow"><span>[ {number} ]</span> {label}</p>
    <h2>{children}</h2>
  </div>;
}

function SiteMap() {
  return <div className="mp-sitemap lp-flow" aria-label="Пример блоков лендинга: предложение, состав и преимущества, примеры и отзывы, условия и ответы, заявка">
    <div className="mp-diagram-top"><span>БЛОКИ ЛЕНДИНГА</span><span>Tilda / Zero Block</span></div>
    <ol className="lp-flow-list">{['Предложение и кнопка', 'Состав и преимущества', 'Примеры и отзывы', 'Условия и ответы', 'Форма заявки'].map((label, index) => <li key={label}><span>{String(index + 1).padStart(2, '0')}</span>{label}{index === 4 && <ArrowUpRight size={16} aria-hidden="true" />}</li>)}</ol>
    <div className="mp-map-bottom"><div><span>Пример структуры одной страницы</span><p>Кнопки обращения размещаются там,<br />где посетитель готов задать вопрос.</p></div></div>
  </div>;
}

export default function LandingServicePage() {
  const { money, text } = usePricing();
  const service = text(originalService);
  return <div className="mp-page lp-page">
    <Sidebar activeSection="services" />
    <main className="mp-main">
      <section className="mp-hero" aria-labelledby="mp-title">
        <div className="mp-topline">
          <nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><span aria-current="page">Лендинг</span></nav>
          <span className="mp-edition">KSENWEB / УСЛУГИ</span>
        </div>
        <div className="mp-hero-intro"><p className="mp-eyebrow"><span>[ WEB DEVELOPMENT ]</span></p><p>Ксения Матвеенко<br />Дизайн и разработка</p></div>
        <h1 id="mp-title">Лендинг<br /><span>под ключ</span></h1>
        <div className="mp-hero-bottom"><div>
          <p className="mp-lead">Сайт для вашей услуги или продукта — от структуры до запуска</p>
          <p className="mp-hero-copy">Разработаю структуру, индивидуальный дизайн и мобильную версию. Подключу форму обращений и передам сайт, который вы сможете редактировать самостоятельно.</p>
        </div><div className="mp-hero-facts"><span>РАЗРАБОТКА ПОД КЛЮЧ</span><strong>{service.price}</strong><p>На Tilda · от 7 рабочих дней<br/>Точный срок — после обсуждения задачи</p><p>Структура · Figma · Tilda<br />Адаптив · Формы · SEO-основа</p><a href="#mp-price">Что входит в стоимость <span aria-hidden="true">↗</span></a></div></div>
      </section>

      <section className="mp-projects mp-section" id="mp-projects">
        <SectionHeading number="01" label="ПОРТФОЛИО">Примеры сайтов<br /><span>и решений для бизнеса</span></SectionHeading>
        <LandingProjects /><div className="mp-portfolio-link"><p>В портфолио — сайты и веб-приложения с описанием задач и решений. Посмотрите проекты, чтобы оценить дизайн и подход к разработке.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section className="mp-fit mp-section" id="mp-format">
        <SectionHeading number="02" label="ВЫБОР ФОРМАТА">Для каких задач<br /><span>подходит лендинг</span></SectionHeading>
        <div className="mp-fit-layout lp-fit-layout">
          <div className="lp-fit-intro"><p className="mp-intro-copy">Лендинг подходит, когда у вас одно предложение и одна цель: получить заявку, продать продукт или собрать регистрации.</p><p className="lp-fit-summary">Всё важное — на одной странице: условия, преимущества, примеры и удобный способ связаться.</p></div>
          <div className="mp-fit-list">{service.fit.map(([title, text], i) => <div key={title}><span className="mp-row-number">0{i + 1}</span><div><h3>{keepWords(title)}</h3><p>{keepWords(text)}</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div>
        </div>
        <aside className="lp-format-help" aria-labelledby="lp-format-help-title">
          <div className="lp-format-help-intro"><h3 id="lp-format-help-title">А если одной страницы недостаточно?</h3><p>Выберите формат под вашу задачу.</p></div>
          <div className="lp-format-help-options">
            <Link to="/services/multipage"><span>Несколько услуг или направлений</span><strong>Многостраничный сайт <ArrowUpRight size={15}/></strong></Link>
            <Link to="/services/online-store"><span>Товары, корзина и оформление заказа</span><strong>Интернет-магазин <ArrowUpRight size={15}/></strong></Link>
          </div>
          <Link className="lp-format-compare" to="/services/websites">Сравнить все форматы сайтов<ArrowUpRight size={14}/></Link>
        </aside>
      </section>

      <section className="mp-architecture mp-section">
        <SectionHeading number="03" label="СТРУКТУРА СТРАНИЦЫ" dark>Какие блоки<br /><span>нужны на лендинге</span></SectionHeading>
        <div className="mp-architecture-layout"><div className="mp-dark-copy"><p>Сначала посетитель должен понять, что вы предлагаете и кому это подходит. Затем — изучить состав услуги или характеристики продукта, посмотреть примеры, узнать условия и оставить заявку.</p><p>Порядок блоков зависит от предложения и аудитории. Для консультации важны опыт и подход специалиста, для продукта — свойства и условия покупки, для мероприятия — программа и регистрация.</p><p className="mp-small-note">На схеме — пример последовательности блоков. Состав и объем согласуем под ваше предложение.</p></div><SiteMap /></div>
      </section>



      <section className="mp-scope mp-section" id="mp-scope">
        <SectionHeading number="04" label="СОСТАВ УСЛУГИ">Что входит<br /><span>в разработку</span></SectionHeading>
        <div className="mp-scope-grid">{service.scope.map(([title, text], i) => <div key={title}><ScopeVisual index={i}/><span className="mp-row-number">/ 0{i + 1}</span><h3>{keepWords(title)}</h3><p>{keepWords(text)}</p></div>)}</div>
        <p className="mp-scope-note">Перед началом фиксируем, какие блоки, материалы и подключения входят в ваш проект. Состав работы с текстами и изображениями обсуждаем отдельно.</p>
      </section>

      <section className="mp-price mp-section" id="mp-price">
        <SectionHeading number="05" label="ТАРИФ И УСЛОВИЯ" dark>Стоимость<br /><span>разработки лендинга</span></SectionHeading>
        <div className="mp-price-layout"><div className="mp-price-offer"><p className="mp-eyebrow">ЛЕНДИНГ НА TILDA ПОД КЛЮЧ</p><div className="mp-price-value">от <strong>{money(30000)}</strong></div><p>Базовый ориентир для лендинга с индивидуальным дизайном. Точную стоимость и срок согласуем после обсуждения блоков, материалов и подключений.</p><ContactLink placement="price">Обсудить состав и стоимость</ContactLink></div><div className="mp-price-details"><h3>Основа проекта</h3><ul>{['Структура блоков и дизайн в Figma', 'Верстка в Zero Block и мобильная адаптация', 'Формы и согласованные подключения', 'Базовая SEO-подготовка и передача проекта'].map(text => <li key={text}><Check size={16} aria-hidden="true" />{text}</li>)}</ul><div className="mp-price-factors"><h3>Что влияет на оценку</h3><p>Количество и сложность блоков, готовность текстов и фотографий, анимация и внешние интеграции.</p></div><p className="mp-small-note">Тариф Tilda, домен и платные внешние сервисы оплачиваются отдельно. Дополнительные работы согласуем до их выполнения.</p></div></div>
      </section>

      <div className="lp-reviews-marker"><p className="mp-eyebrow"><span>[ 06 ]</span> ОТЗЫВЫ</p></div>
      <Reviews />

      <section className="mp-process mp-section">
        <SectionHeading number="07" label="ЭТАПЫ РАБОТЫ">Как проходит<br /><span>создание лендинга</span></SectionHeading>
        <div className="mp-process-list">{service.steps.map(([title, text], i) => <div key={title}><span className="mp-process-number">0{i + 1}</span><h3>{keepWords(title)}</h3><p>{keepWords(text)}</p></div>)}</div>
      </section>

      <section className="mp-faq mp-section">
        <SectionHeading number="08" label="FAQ">Вопросы<br /><span>перед заказом</span></SectionHeading>
        <div>{service.faq.map(([question, answer], i) => <details key={question}><summary><span className="mp-row-number">{String(i + 1).padStart(2, '0')}</span><h3>{question}</h3><Plus size={18} className="mp-faq-icon" aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="mp-reading mp-section">
        <SectionHeading number="09" label="ПОЛЕЗНЫЕ МАТЕРИАЛЫ">Как выбрать формат<br /><span>и оценить дизайн</span></SectionHeading>
        <div className="mp-reading-list"><Link to="/services/websites"><span className="mp-eyebrow">ВЫБОР ФОРМАТА</span><h3>Какой формат сайта выбрать</h3><p>Когда достаточно одной страницы, а когда бизнесу нужна структура из нескольких разделов.</p><span className="mp-text-link">Сравнить форматы<ArrowUpRight size={18} aria-hidden="true" /></span></Link><Link to="/blog/why-website-looks-cheap"><span className="mp-eyebrow">ДИЗАЙН И ДОВЕРИЕ</span><h3>Почему сайт выглядит дёшево</h3><p>Как типографика, фотографии и мобильная версия влияют на восприятие компании.</p><span className="mp-text-link">Посмотреть ошибки<ArrowUpRight size={18} aria-hidden="true" /></span></Link></div>
      </section>

      <section className="mp-contact mp-section" id="mp-contact">
        <div className="mp-contact-bottom lp-contact-layout"><div className="lp-contact-intro"><p className="mp-eyebrow"><span>[ ОБСУДИТЬ ПРОЕКТ ]</span></p><h2>Обсудим лендинг<br /><span>для вашей задачи</span></h2><p>Расскажите о задаче — уточню детали и подготовлю предварительную оценку. До начала работы согласуем состав, стоимость и сроки; дизайн утвердим перед сборкой сайта.</p><a className="mp-text-link lp-telegram-link" href={contentData.contacts.messengers.telegram.url} target="_blank" rel="noopener noreferrer" onClick={() => trackConversion('contact_clicked', { contact_method: 'telegram', service: 'landing', placement: 'footer' })}>Или напишите мне в Telegram<ArrowUpRight size={16}/></a></div><LandingLeadForm /></div>
      </section>
      <footer className="mp-footer"><Link to="/">KSENWEB / Ксения Матвеенко</Link><div><Link to="/privacy-policy">Конфиденциальность</Link><Link to="/terms">Условия использования</Link></div></footer>
    </main>
  </div>;
}
