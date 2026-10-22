import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Check, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { landingService as service } from '../content/landingService';
import { trackConversion } from '../utils/analytics';
import './MultipageServicePage.css';

const briefHref = '/brief?service=landing&source=landing-service';

function ContactLink({ children = 'Обсудить лендинг', className = '', placement }) {
  const message = 'Здравствуйте! Меня интересует лендинг. Хочу обсудить предложение, сроки и стоимость разработки.';
  const href = `${contentData.contacts.messengers.telegram.url.replace(/\/$/, '')}?text=${encodeURIComponent(message)}`;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`mp-button ${className}`}
    onClick={() => trackConversion('contact_clicked', { contact_method: 'telegram', service: 'landing', placement })}>
    {children}<ArrowUpRight size={17} aria-hidden="true" />
  </a>;
}

function SectionHeading({ number, label, children, dark = false }) {
  return <div className={`mp-section-heading${dark ? ' mp-heading-dark' : ''}`}>
    <p className="mp-eyebrow"><span>[ {number} ]</span> {label}</p>
    <h2>{children}</h2>
  </div>;
}

function SiteMap() {
  return <div className="mp-sitemap lp-flow" aria-label="Пример блоков лендинга: предложение, состав и преимущества, примеры и отзывы, условия и ответы, заявка">
    <div className="mp-diagram-top"><span>БЛОКИ ЛЕНДИНГА</span><span>Tilda / Zero Block</span></div>
    <ol className="lp-flow-list">{['Предложение и кнопка', 'Состав и преимущества', 'Примеры и отзывы', 'Условия и ответы', 'Форма заявки'].map((label, index) => <li key={label}><span>{String(index + 1).padStart(2, '0')}</span>{label}{index === 4 && <ArrowUpRight size={16} aria-hidden="true" />}</li>)}</ol>
    <div className="mp-map-bottom"><div><span>Пример структуры одной страницы</span><p>Кнопки обращения размещаются там,<br />где посетитель готов задать вопрос.</p></div></div>
  </div>;
}

export default function LandingServicePage() {
  return <div className="mp-page lp-page">
    <Sidebar activeSection="services" />
    <main className="mp-main">
      <section className="mp-hero" aria-labelledby="mp-title">
        <div className="mp-topline">
          <nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><span aria-current="page">Лендинг</span></nav>
          <span className="mp-edition">KSENWEB / УСЛУГИ</span>
        </div>
        <div className="mp-hero-intro"><p className="mp-eyebrow"><span>[ WEB DEVELOPMENT ]</span></p><p>Ксения Матвеенко<br />Дизайн и разработка</p></div>
        <h1 id="mp-title">Лендинг<br /><span>под ключ</span></h1>
        <div className="mp-hero-bottom"><div>
          <p className="mp-lead">Одностраничный сайт для продажи услуги, продукта или записи на мероприятие</p>
          <p className="mp-hero-copy">Спроектирую структуру блоков, создам дизайн в Figma и реализую лендинг на Tilda или коде — в зависимости от задачи. Адаптирую страницу под смартфоны и настрою форму для обращений.</p>
          <div className="mp-actions"><ContactLink placement="hero" /><a className="mp-text-link" href="#mp-projects">Посмотреть работы<ArrowRight size={16} aria-hidden="true" /></a></div>
        </div><div className="mp-hero-facts"><span>РАЗРАБОТКА ПОД КЛЮЧ</span><strong>{service.price}</strong><p>Для реализации на Tilda<br/>Разработка на коде — по оценке</p><p>Структура · Figma · Tilda<br />Адаптив · Формы · SEO-основа</p><a href="#mp-price">Что входит в стоимость <span aria-hidden="true">↗</span></a></div></div>
      </section>

      <section className="mp-fit mp-section" id="mp-format">
        <SectionHeading number="01" label="ВЫБОР ФОРМАТА">Для каких задач<br /><span>подходит лендинг</span></SectionHeading>
        <div className="mp-fit-layout"><p className="mp-intro-copy">Лендинг подходит, когда нужно подробно представить одно предложение и получить конкретное действие от посетителя. На странице соберем условия, примеры, ответы на вопросы и способ обращения.</p><div className="mp-fit-list">{service.fit.map(([title, text], i) => <div key={title}><span className="mp-row-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div></div>
        <div className="mp-format-note"><span>ЕЩЁ ВЫБИРАЕТЕ ФОРМАТ?</span><Link to="/services/websites">Как выбрать формат сайта и способ разработки<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <p className="mp-scope-note">Для нескольких направлений бизнеса подойдет <Link className="mp-text-link" to="/services/multipage">многостраничный сайт на Tilda →</Link></p>
        <p className="mp-scope-note">Для продажи ассортимента с корзиной и оформлением заказа — <Link className="mp-text-link" to="/services/online-store">интернет-магазин на Tilda →</Link></p>
      </section>

      <section className="mp-section"><aside className="os-platform-note"><h3>Tilda или индивидуальная разработка с админкой</h3><p>Для стандартных страниц и сценариев рассмотрим Tilda. Если нужны нестандартные функции, интеграции или собственная система управления, оценим разработку на коде. Состав работ и стоимость согласуем после выбора технологии.</p><Link className="mp-text-link" to="/services/tilda">Возможности и условия разработки на Tilda ↗</Link><br/><Link className="mp-text-link" to="/services/websites">Все варианты создания сайтов ↗</Link></aside></section>
      <section className="mp-architecture mp-section">
        <SectionHeading number="02" label="СТРУКТУРА СТРАНИЦЫ" dark>Какие блоки<br /><span>нужны на лендинге</span></SectionHeading>
        <div className="mp-architecture-layout"><div className="mp-dark-copy"><p>Сначала посетитель должен понять, что вы предлагаете и кому это подходит. Затем — изучить состав услуги или характеристики продукта, посмотреть примеры, узнать условия и оставить заявку.</p><p>Порядок блоков зависит от предложения и аудитории. Для консультации важны опыт и подход специалиста, для продукта — свойства и условия покупки, для мероприятия — программа и регистрация.</p><p className="mp-small-note">На схеме — пример последовательности блоков. Состав и объем согласуем под ваше предложение.</p></div><SiteMap /></div>
      </section>

      <section className="mp-projects mp-section" id="mp-projects">
        <SectionHeading number="03" label="ПОРТФОЛИО">Посмотрите работы<br /><span>в разделе кейсов</span></SectionHeading>
        <div className="mp-portfolio-link"><p>В портфолио — сайты и веб-приложения с описанием задач и решений. Посмотрите проекты, чтобы оценить дизайн и подход к разработке.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section className="mp-scope mp-section" id="mp-scope">
        <SectionHeading number="04" label="СОСТАВ УСЛУГИ">Что входит<br /><span>в разработку</span></SectionHeading>
        <div className="mp-scope-grid">{service.scope.map(([title, text], i) => <div key={title}><span className="mp-row-number">/ 0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
        <p className="mp-scope-note">Перед началом фиксируем, какие блоки, материалы и подключения входят в ваш проект. Состав работы с текстами и изображениями обсуждаем отдельно.</p>
      </section>

      <section className="mp-price mp-section" id="mp-price">
        <SectionHeading number="05" label="ТАРИФ И УСЛОВИЯ" dark>Стоимость<br /><span>разработки лендинга</span></SectionHeading>
        <div className="mp-price-layout"><div className="mp-price-offer"><p className="mp-eyebrow">ЛЕНДИНГ НА TILDA ПОД КЛЮЧ</p><div className="mp-price-value">от <strong>30 000</strong> ₽</div><p>Базовый ориентир для лендинга с индивидуальным дизайном. Точную стоимость и срок согласуем после обсуждения блоков, материалов и подключений.</p><ContactLink placement="price">Обсудить состав и стоимость</ContactLink></div><div className="mp-price-details"><h3>Основа проекта</h3><ul>{['Структура блоков и дизайн в Figma', 'Верстка в Zero Block и мобильная адаптация', 'Формы и согласованные подключения', 'Базовая SEO-подготовка и передача проекта'].map(text => <li key={text}><Check size={16} aria-hidden="true" />{text}</li>)}</ul><div className="mp-price-factors"><h3>Что влияет на оценку</h3><p>Количество и сложность блоков, готовность текстов и фотографий, анимация и внешние интеграции.</p></div><p className="mp-small-note">Тариф Tilda, домен и платные внешние сервисы оплачиваются отдельно. Дополнительные работы согласуем до их выполнения.</p></div></div>
      </section>

      <section className="mp-process mp-section">
        <SectionHeading number="06" label="ЭТАПЫ РАБОТЫ">Как проходит<br /><span>создание лендинга</span></SectionHeading>
        <div className="mp-process-list">{service.steps.map(([title, text], i) => <div key={title}><span className="mp-process-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="mp-faq mp-section">
        <SectionHeading number="07" label="FAQ">Вопросы<br /><span>перед заказом</span></SectionHeading>
        <div>{service.faq.map(([question, answer], i) => <details key={question}><summary><span className="mp-row-number">{String(i + 1).padStart(2, '0')}</span><h3>{question}</h3><Plus size={18} className="mp-faq-icon" aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="mp-reading mp-section">
        <SectionHeading number="08" label="ПОЛЕЗНЫЕ МАТЕРИАЛЫ">Как выбрать формат<br /><span>и оценить дизайн</span></SectionHeading>
        <div className="mp-reading-list"><Link to="/services/websites"><span className="mp-eyebrow">ВЫБОР ФОРМАТА</span><h3>Какой формат сайта выбрать</h3><p>Когда достаточно одной страницы, а когда бизнесу нужна структура из нескольких разделов.</p><span className="mp-text-link">Сравнить форматы<ArrowUpRight size={18} aria-hidden="true" /></span></Link><Link to="/blog/why-website-looks-cheap"><span className="mp-eyebrow">ДИЗАЙН И ДОВЕРИЕ</span><h3>Почему сайт выглядит дёшево</h3><p>Как типографика, фотографии и мобильная версия влияют на восприятие компании.</p><span className="mp-text-link">Посмотреть ошибки<ArrowUpRight size={18} aria-hidden="true" /></span></Link></div>
      </section>

      <section className="mp-contact mp-section" id="mp-contact">
        <p className="mp-eyebrow"><span>[ ОБСУДИТЬ ПРОЕКТ ]</span></p><h2>Обсудим лендинг<br /><span>для вашей задачи</span></h2>
        <div className="mp-contact-bottom"><p>Расскажите, что вы предлагаете и какое действие ждете от посетителя. Обсудим структуру лендинга, материалы, срок и стоимость разработки.</p><div><ContactLink placement="footer" /><Link className="mp-text-link" to={briefHref}>Или заполнить бриф<ArrowRight size={16} aria-hidden="true" /></Link></div></div>
      </section>
      <footer className="mp-footer"><Link to="/">KSENWEB / Ксения Матвеенко</Link><div><Link to="/privacy-policy">Конфиденциальность</Link><Link to="/terms">Условия использования</Link></div></footer>
    </main>
  </div>;
}
