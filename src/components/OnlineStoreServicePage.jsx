import Reviews from './Reviews';
import { LandingProjects, LandingLeadForm } from './LandingConversion';
import { ScopeVisual } from './LandingVisuals';
import { usePricing } from './CurrencyProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Check, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { onlineStoreService as originalService } from '../content/onlineStoreService';
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
  return <div className="mp-sitemap lp-flow" aria-label="Пример пути покупателя: каталог, карточка товара, корзина, оплата и доставка, подтверждение заказа">
    <div className="mp-diagram-top"><span>ОФОРМЛЕНИЕ ЗАКАЗА</span><span>Tilda / Каталог</span></div>
    <ol className="lp-flow-list">{['Каталог и категории', 'Карточка и варианты товара', 'Корзина и данные покупателя', 'Оплата и способ получения', 'Подтверждение заказа'].map((label,index) => <li key={label}><span>{String(index+1).padStart(2,'0')}</span>{label}{index===4 && <ArrowUpRight size={16} aria-hidden="true" />}</li>)}</ol>
    <div className="mp-map-bottom"><div><span>Проверяем перед запуском</span><p>Товар → Заказ → Уведомление<br />На компьютере и смартфоне.</p></div></div>
  </div>;
}

export default function OnlineStoreServicePage() {
  const { money, text } = usePricing();
  const service = text(originalService);
  return <div className="mp-page service-page os-page">
    <Sidebar activeSection="services" />
    <main className="mp-main">
      <section className="mp-hero" aria-labelledby="mp-title">
        <div className="mp-topline">
          <nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><Link to="/#services">Услуги</Link><span>/</span><span aria-current="page">Интернет-магазин</span></nav>
          <span className="mp-edition">KSENWEB / УСЛУГИ</span>
        </div>
        <div className="mp-hero-intro"><p className="mp-eyebrow"><span>[ WEB DEVELOPMENT ]</span></p><p>Ксения Матвеенко<br />Дизайн и разработка</p></div>
        <h1 id="mp-title">Интернет-магазин<br /><span>под ключ</span></h1>
        <div className="mp-hero-bottom"><div>
          <p className="mp-lead">Магазин с каталогом товаров, корзиной и оформлением заказа</p>
          <p className="mp-hero-copy">Спроектирую каталог и карточки товаров, создам дизайн и разработаю магазин на подходящей платформе. Настрою согласованные способы оплаты, доставки и уведомления о заказах.</p>
        <div className="mp-actions"><ContactLink/><a className="mp-text-link" href="#mp-scope">Что входит в разработку ↘</a></div></div><div className="mp-hero-facts"><span>РАЗРАБОТКА ПОД КЛЮЧ</span><strong>{service.price}</strong><p>Для реализации на Tilda<br/>Точный состав и срок — после обсуждения</p><p>Каталог · Карточки · Корзина<br />Оплата · Доставка · Адаптив</p><a href="#mp-price">Что входит в стоимость <span aria-hidden="true">↗</span></a></div></div>
      </section>

      <section className="mp-fit mp-section" id="mp-format">
        <SectionHeading number="01" label="ВЫБОР ФОРМАТА">Когда подходит<br /><span>интернет-магазин</span></SectionHeading>
        <div className="mp-fit-layout lp-fit-layout"><div className="lp-fit-intro"><p className="mp-intro-copy">Интернет-магазин нужен, когда покупатель должен выбрать товар и оформить заказ на сайте. До разработки разберем ассортимент и процесс продаж: от категорий и вариантов товара до оплаты и получения заказа.</p><p className="lp-fit-summary">От выбора товара до заказа — в одном магазине. Каталог, корзина и удобное оформление.</p></div><div className="mp-fit-list">{service.fit.map(([title, text], i) => <div key={title}><span className="mp-row-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div></div>
        <aside className="os-platform-note"><h3>Когда нужна другая платформа</h3><p>Маркетплейс с разными продавцами, сложный складской учет, индивидуальные цены и нестандартные личные кабинеты требуют отдельной оценки. Сначала проверим требования к торговле, затем предложим подходящее решение.</p></aside>

      </section>

      <section className="mp-architecture mp-section">
        <SectionHeading number="02" label="ПУТЬ ПОКУПАТЕЛЯ" dark>Как покупатель<br /><span>оформит заказ</span></SectionHeading>
        <div className="mp-architecture-layout"><div className="mp-dark-copy"><p>Покупатель находит товар в каталоге, изучает фотографии и характеристики, выбирает вариант и добавляет его в корзину. На этапе оформления указывает данные и выбирает доступный способ получения.</p><p>После оформления заказ должен поступить вашей команде, а покупатель — получить предусмотренное подтверждение. Порядок оплаты и обработки заказа согласуем под вашу торговлю.</p><p className="mp-small-note">На схеме — пример оформления покупки. Конкретные шаги зависят от способов оплаты, доставки и процесса обработки заказов.</p></div><SiteMap /></div>
      </section>

      <section className="mp-projects mp-section" id="mp-projects">
        <SectionHeading number="03" label="ПОРТФОЛИО">Примеры проектов<br /><span>и решений для бизнеса</span></SectionHeading>
        <LandingProjects service="online-store"/><div className="mp-portfolio-link"><p>В портфолио — сайты и веб-приложения с описанием задач и решений. Посмотрите проекты, чтобы оценить дизайн и подход к разработке.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section className="mp-scope mp-section" id="mp-scope">
        <SectionHeading number="04" label="СОСТАВ УСЛУГИ">Что входит<br /><span>в разработку</span></SectionHeading>
        <div className="mp-scope-grid">{service.scope.map(([title, text], i) => <div key={title}><ScopeVisual index={i} service="online-store"/><span className="mp-row-number">/ 0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
        <p className="mp-scope-note">Перед началом согласуем категории, варианты товаров, объем наполнения и интеграции. Подготовку фотографий, описаний и перенос большого каталога оцениваем отдельно.</p>
      </section>

      <section className="mp-price mp-section" id="mp-price">
        <SectionHeading number="05" label="ТАРИФ И УСЛОВИЯ" dark>Стоимость<br /><span>интернет-магазина</span></SectionHeading>
        <div className="mp-price-layout"><div className="mp-price-offer"><p className="mp-eyebrow">ИНТЕРНЕТ-МАГАЗИН НА TILDA</p><div className="mp-price-value">от <strong>{money(45000)}</strong></div><p>Ориентир для магазина с согласованным каталогом и сценарием заказа. Точную стоимость и срок определим после оценки ассортимента и интеграций.</p><ContactLink placement="price">Получить оценку проекта</ContactLink></div><div className="mp-price-details"><h3>Основа проекта</h3><ul>{['Структура каталога и дизайн в Figma', 'Каталог, карточки, корзина и адаптив', 'Согласованные оплата, доставка и уведомления', 'Базовая SEO-подготовка и обучение работе с каталогом'].map(text => <li key={text}><Check size={16} aria-hidden="true" />{text}</li>)}</ul><div className="mp-price-factors"><h3>Что влияет на оценку</h3><p>Категории, варианты и количество товаров для наполнения, готовность фотографий и описаний, способы оплаты и доставки, внешние интеграции.</p></div><p className="mp-small-note">Отдельно оплачиваются тариф Tilda, домен и платные сервисы. Комиссии платежного провайдера зависят от его условий. Дополнительное наполнение, поддержка и новые интеграции согласуются отдельно.</p></div></div>
      </section>

      <div className="lp-reviews-marker"><p className="mp-eyebrow"><span>[ 06 ]</span> ОТЗЫВЫ</p></div>
      <Reviews />

      <section className="mp-process mp-section">
        <SectionHeading number="07" label="ЭТАПЫ РАБОТЫ">Как проходит<br /><span>запуск магазина</span></SectionHeading>
        <div className="mp-process-list">{service.steps.map(([title, text], i) => <div key={title}><span className="mp-process-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="mp-faq mp-section">
        <SectionHeading number="08" label="FAQ">Вопросы<br /><span>перед заказом</span></SectionHeading>
        <div>{service.faq.map(([question, answer], i) => <details key={question}><summary><span className="mp-row-number">{String(i + 1).padStart(2, '0')}</span><h3>{question}</h3><Plus size={18} className="mp-faq-icon" aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="mp-reading mp-section">
        <SectionHeading number="09" label="ВЫБОР РЕШЕНИЯ">Другие форматы<br /><span>и полезные материалы</span></SectionHeading>
        <div className="mp-reading-list"><Link to="/services/landing"><span className="mp-eyebrow">ОДИН ПРОДУКТ</span><h3>Лендинг на Tilda</h3><p>Если нужно представить один продукт и собрать обращения, может быть достаточно одной страницы.</p><span className="mp-text-link">Посмотреть услугу<ArrowUpRight size={18} aria-hidden="true" /></span></Link><Link to="/services/multipage"><span className="mp-eyebrow">САЙТ КОМПАНИИ</span><h3>Многостраничный сайт</h3><p>Для компании с несколькими услугами, проектами и информационными разделами.</p><span className="mp-text-link">Посмотреть услугу<ArrowUpRight size={18} aria-hidden="true" /></span></Link></div>
        <div className="mp-format-note"><span>СТАТЬЯ О ДИЗАЙНЕ</span><Link to="/blog/why-website-looks-cheap">Какие ошибки делают сайт визуально слабее<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>

      <section className="mp-contact mp-section" id="mp-contact">
        <div className="mp-contact-bottom lp-contact-layout"><div className="lp-contact-intro"><p className="mp-eyebrow"><span>[ ОБСУДИТЬ ПРОЕКТ ]</span></p><h2>Обсудим магазин<br /><span>для ваших товаров</span></h2><p>Расскажите об ассортименте — обсудим каталог, оформление заказа, оплату и доставку. Подготовлю предварительную оценку проекта.</p><a className="mp-text-link lp-telegram-link" href={contentData.contacts.messengers.telegram.url} target="_blank" rel="noopener noreferrer" onClick={() => trackConversion('contact_clicked', {contact_method:'telegram',service:'online-store',placement:'footer'})}>Или напишите мне в Telegram<ArrowUpRight size={16}/></a></div><LandingLeadForm service="online-store"/></div>
      </section>
    </main>
  </div>;
}
