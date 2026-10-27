import ServiceProcess from './ServiceProcess';
import Reviews from './Reviews';
import ServiceContact from './ServiceContact';
import { LandingProjects } from './LandingConversion';
import { usePricing } from './CurrencyProvider';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Plus, Check, Layers, LayoutTemplate, SlidersHorizontal, Monitor, Smartphone, MousePointer2 } from 'lucide-react';
import Sidebar from './Sidebar';
import './MultipageServicePage.css';
import './WebsiteServicePage.css';

const originalFormats = [
  {id:'landing',label:'Лендинг',title:'Одна страница для одного предложения',text:'Для продукта, услуги или рекламной кампании. Последовательно раскрываем предложение и ведём посетителя к обращению.',tags:['Предложение','Преимущества','Форма заявки'],price:'от 30 000 ₽ на Tilda'},
  {id:'multipage',label:'Многостраничный сайт',title:'Отдельная страница для каждого направления',text:'Для компании с несколькими услугами. Проектируем разделы, навигацию и связи между услугами, статьями и проектами.',tags:['Услуги','О компании','Проекты','Статьи'],price:'от 45 000 ₽ на Tilda'},
  {id:'online-store',label:'Интернет-магазин',title:'От выбора товара до оформления заказа',text:'Для продажи ассортимента. Продумываем категории, карточки товаров, корзину, способы оплаты и получения заказа.',tags:['Каталог','Карточка товара','Корзина','Заказ'],price:'от 45 000 ₽ на Tilda'},
];

function Screen({ type='landing', compact=false }) {
  return <div className={`ws-screen ws-screen-${type}${compact?' ws-screen-compact':''}`} aria-hidden="true">
    <div className="ws-browser"><i/><i/><i/><span>your-brand / {type==='landing'?'home':type==='multipage'?'services':'shop'}</span><ArrowUpRight size={10}/></div>
    <div className="ws-screen-nav"><b>BRAND®</b><span>О нас &nbsp; {type==='online-store'?'Каталог':'Услуги'} &nbsp; Контакты</span><span>↗</span></div>
    {type==='online-store' ? <><div className="ws-shop-title">Новая<br/>коллекция<span>01—03</span></div><div className="ws-products">{[1,2,3].map(n=><div key={n}><div className={`ws-object ws-object-${n}`}/><span>Объект / 0{n}</span><i/></div>)}</div></> : <><div className="ws-screen-cover"><div><small>{type==='landing'?'ОДНО ПРЕДЛОЖЕНИЕ':'НЕСКОЛЬКО НАПРАВЛЕНИЙ'}</small><strong>{type==='landing'?<>Форма<br/>и функция</>:<>Экспертиза<br/>в деталях</>}</strong><span className="ws-mini-cta">Обсудить проект ↗</span></div><div className="ws-sculpture"><i/><i/><i/></div></div><div className="ws-screen-tiles">{(type==='landing'?['О продукте','Преимущества','Контакты']:['Услуги','Проекты','Компания']).map((t,i)=><div key={t}><small>0{i+1} ↗</small><span>{t}</span><i/></div>)}</div></>}
  </div>;
}
function Heading({n,label,children}) {return <div className="ws-heading"><p className="mp-eyebrow">[ {n} / {label} ]</p><h2>{children}</h2></div>;}
export default function WebsiteServicePage({service:originalService}) {
 const { text, money } = usePricing();
 const s = text(originalService);
 const formats = text(originalFormats);
  const [selected,setSelected]=useState(0);
  const isTilda=s.slug==='tilda';
  const brief = '#mp-contact';
  const artIndices=isTilda?[1,0,4,2,3,5]:[0,1,2,3,4,5];
  const cta=(text='Получить оценку проекта')=><a className="mp-button" href={brief}>{text}<ArrowUpRight size={17}/></a>;
  return <div className={`mp-page ws-page${isTilda?' ws-tilda-page':''}`}><noscript><style>{'.ws-format-panel[hidden]{display:grid}.ws-tabs{display:none}'}</style></noscript><Sidebar activeSection="services"/><main className="mp-main">
    <section className="mp-hero ws-hero">
      <div className="mp-topline"><nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><Link to="/#services">Услуги</Link><span>/</span><span aria-current="page">{s.name}</span></nav><span className="mp-edition">KSENWEB / УСЛУГИ</span></div>
      <div className="ws-hero-title"><p className="mp-eyebrow">{isTilda?'[ FIGMA · ZERO BLOCK · TILDA ]':'[ СТРУКТУРА · ДИЗАЙН · РАЗРАБОТКА ]'}</p><h1>{s.headline[0]}<br/><span>{s.headline[1]}</span></h1></div>
      <div className="ws-hero-copy"><p className="mp-lead">Лендинги, сайты компаний<br/>и интернет-магазины</p><div><p className="mp-hero-copy">{s.intro}</p><div className="mp-actions">{cta()}<a className="mp-text-link" href="#website-formats">Выбрать формат<ArrowRight size={16}/></a></div></div></div>
      <div className="ws-project-preview" role="img" aria-label="Схема проекта: сайт, управление содержанием и мобильная версия">
        <div className="ws-preview-heading"><span>[ ВАШ БУДУЩИЙ САЙТ ]</span><span>Структура · Дизайн · Запуск</span></div>
        <div className="ws-preview-grid">
          <div className="ws-preview-desktop"><div className="ws-preview-label"><Monitor size={15}/><span>Основная версия</span></div><Screen/></div>
          <div className="ws-preview-side">
            <div className="ws-preview-editor"><div className="ws-preview-label"><SlidersHorizontal size={15}/><span>Управление контентом</span></div><p>Ваше предложение</p>{['Услуги','Проекты','Контакты'].map(label=><div key={label}><span>{label}</span><Check size={13}/></div>)}<small>Тексты · Фото · Разделы</small></div>
            <div className="ws-preview-mobile"><div className="ws-preview-label"><Smartphone size={15}/><span>Мобильная версия</span></div><div className="ws-preview-mobile-page"><b>Ваш бизнес</b><span>Понятно на любом экране</span><i/><i/><em>Связаться ↗</em></div></div>
          </div>
        </div>
        <p className="ws-preview-caption">Визуальная схема проекта · не пример выполненной работы</p>
      </div>
    </section>
    <div className="ws-ribbon" aria-hidden="true"><span>Структура</span><Plus/><span>Дизайн</span><Plus/><span>{isTilda?'Zero Block':'Разработка'}</span><Plus/><span>Запуск</span><ArrowUpRight/></div>
    <section className="mp-section ws-formats" id="website-formats">
      <Heading n="01" label="ФОРМАТ САЙТА">{isTilda?'Какой сайт можно':'Какой сайт нужен'}<br/><span>{isTilda?'создать на Tilda':'вашему бизнесу'}</span></Heading>
      <div className="ws-tabs" role="tablist" aria-label="Формат сайта">{formats.map((item,i)=><button key={item.id} id={`format-tab-${item.id}`} role="tab" aria-selected={selected===i} aria-controls={`website-format-panel-${item.id}`} tabIndex={selected===i?0:-1} onClick={()=>setSelected(i)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(selected+(e.key==='ArrowRight'?1:2))%3;setSelected(next);document.getElementById(`format-tab-${formats[next].id}`)?.focus();}}}><span>0{i+1}</span>{item.label}<ArrowUpRight size={16}/></button>)}</div>
      {formats.map((f,i)=><div key={f.id} hidden={selected!==i} className={`ws-format-panel ws-format-${f.id}`} id={`website-format-panel-${f.id}`} role="tabpanel" aria-labelledby={`format-tab-${f.id}`}><div className="ws-format-copy"><p className="mp-eyebrow">{f.price}</p><h3>{f.title}</h3><p>{f.text}</p><div className="ws-tags">{f.tags.map(t=><span key={t}>{t}</span>)}</div><div className="ws-format-actions"><a className="mp-button" href="#mp-contact">Обсудить {f.id==='landing'?'лендинг':f.id==='multipage'?'сайт':'магазин'}<ArrowUpRight size={17}/></a><Link to={`/services/${f.id}`} className="mp-text-link">Подробнее об услуге<ArrowUpRight size={17}/></Link></div></div><div className="ws-format-visual" key={f.id}><Screen type={f.id}/></div></div>)}
    </section>
    {isTilda ? <>
    <section className="mp-section ws-technology">
      <Heading n="02" label="ВОЗМОЖНОСТИ TILDA">Индивидуальный дизайн<br/><span>Удобное редактирование</span></Heading>
      <p className="ws-section-intro">Создаю макеты в Figma и собираю их в Zero Block. После передачи проекта вы сможете обновлять согласованные материалы через редактор Tilda.</p>
      <div className="ws-tech-grid"><article><div className="ws-tech-graphic ws-tech-blocks"><img src="https://static.tildacdn.net/tild3063-6363-4339-a138-336166373032/logo___1.svg" alt="Tilda" width="100" height="100" loading="lazy"/></div><p className="mp-eyebrow">ДИЗАЙН И КОНТЕНТ</p><h3>Сайт под ваш бренд</h3><p>Типографика, композиция, изображения и адаптация под смартфоны — по согласованным макетам. Покажу, как менять тексты и фотографии, а также работать с нужными разделами.</p><a href={brief} className="mp-text-link">Обсудить дизайн и страницы<ArrowUpRight size={16}/></a></article><article><div className="ws-tech-graphic ws-tilda-integrations" aria-hidden="true"><span>Форма заявки</span><ArrowRight size={22}/><div><span>Почта</span><span>CRM</span><span>Уведомления</span></div></div><p className="mp-eyebrow">ФОРМЫ И ПОДКЛЮЧЕНИЯ</p><h3>Обращения с сайта</h3><p>Согласуем формы и способы получения заявок. Для магазина проверим каталог, корзину, доступные способы оплаты и доставки. Возможность каждого подключения уточняем до начала.</p><a href={brief} className="mp-text-link">Обсудить интеграции<ArrowUpRight size={16}/></a></article></div>
      <aside className="ws-tilda-limits"><div><p className="mp-eyebrow">ГРАНИЦЫ ПЛАТФОРМЫ</p><h3>Если возможностей Tilda недостаточно</h3><p>Нестандартные личные кабинеты, сложные роли пользователей или собственная админка могут потребовать разработки на коде. Проверим требования до выбора платформы.</p></div><Link className="mp-text-link" to="/services/websites">Сравнить способы разработки<ArrowUpRight size={16}/></Link></aside>
    </section>
    </> : <aside className="mp-section ws-platform-summary"><p>Подберу способ разработки под задачи сайта, бюджет и удобство дальнейшего редактирования. Вам не нужно заранее выбирать технологию.</p><Link className="mp-text-link" to="/services/tilda">Если вы уже рассматриваете сайт на Tilda ↗</Link></aside>}
    <section className="mp-section ws-deliverables"><Heading n="03" label="СОСТАВ РАБОТ">Что вы получите<br/><span>в готовом проекте</span></Heading><div className="ws-bento">{s.scope.map(([title,text],i)=><article key={title}><div className={`ws-bento-art ws-bento-art-${artIndices[i]}`} aria-hidden="true">{artIndices[i]===0?<><div>Главная</div><span>Услуги</span><span>Проекты</span><span>Контакты</span></>:artIndices[i]===1?<><b>Aa</b><span/><span/><span/></>:artIndices[i]===2?<><Monitor/><span>↔</span><Smartphone/></>:artIndices[i]===3?<><SlidersHorizontal/><div><i/><i/><i/></div></>:artIndices[i]===4?<><span>Заявка</span><ArrowRight/><span>Ваша команда</span></>:<><Check/><span>{isTilda?'Проверка требований':'Готов к запуску'}</span></>}</div><span className="mp-row-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="mp-section ws-portfolio" id="website-portfolio"><div><p className="mp-eyebrow">[ ПОРТФОЛИО ]</p><h2>От задачи<br/>к работающему<br/><span>сайту</span></h2><p>В кейсах — реальные проекты, их задачи и решения. Посмотрите работы, чтобы оценить дизайн и подход к разработке.</p><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17}/></Link></div><LandingProjects service="websites"/></section>
    <section className="mp-section ws-estimate" id="service-price"><Heading n="04" label="СТОИМОСТЬ">Сколько стоит<br/><span>{isTilda?'сайт на Tilda':'создание сайта'}</span></Heading><div className="ws-price-grid"><div><p className="mp-eyebrow">ЛЕНДИНГ НА TILDA</p><p className="ws-big-price">от {money(30000)}</p><p>{text(isTilda?'Многостраничный сайт и интернет-магазин — от 45 000 ₽. Итоговая стоимость зависит от количества макетов, наполнения и подключений.':'Многостраничный сайт и магазин на Tilda — от 45 000 ₽. Индивидуальная разработка и админка оцениваются отдельно.')}</p>{cta('Рассчитать мой проект')}</div><div className="ws-price-note"><span>В ОЦЕНКЕ УЧИТЫВАЕМ</span>{(isTilda?['Количество страниц и макетов','Сложность Zero Block и анимации','Материалы и наполнение','Формы, каталог и подключения']:['Количество страниц и макетов','Функции и интеграции','Материалы и наполнение','Редактор контента и роли']).map((t,i)=><div key={t}><span>0{i+1}</span>{t}<Plus size={14}/></div>)}<p>Подписка платформы, домен и платные внешние сервисы оплачиваются отдельно. Состав, стоимость и срок фиксируем до начала.</p></div></div></section>
    <Reviews/>
    <section className="mp-section ws-process"><Heading n="05" label="ПРОЦЕСС">Как проходит<br/><span>работа над сайтом</span></Heading><ServiceProcess steps={s.steps}/></section>
    <section className="mp-faq mp-section"><Heading n="06" label="FAQ">Вопросы<br/><span>перед заказом</span></Heading>{s.faq.map(([q,a])=><details key={q}><summary><h3>{q}</h3><Plus size={18} className="mp-faq-icon"/></summary><p>{a}</p></details>)}</section>
    <ServiceContact service={s.slug} title={s.cta}/>
  </main></div>;
}
