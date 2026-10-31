import ServiceProcess from './ServiceProcess';
import Reviews from './Reviews';
import ServiceContact from './ServiceContact';
import { LandingProjects } from './LandingConversion';
import { usePricing } from './CurrencyProvider';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Check, Layers, LayoutTemplate, ShoppingBag, SlidersHorizontal, Send, Search, MessageSquare, Smartphone, MousePointer2 } from 'lucide-react';
import Sidebar from './Sidebar';
import './MultipageServicePage.css';
import './TildaServicePage.css';

const icons=[MessageSquare,Layers,Send,Smartphone,SlidersHorizontal,Check];
const prices=[['Лендинг','30 000','landing'],['Многостраничный сайт','45 000','multipage'],['Интернет-магазин','45 000','online-store']];
function Heading({number,label,children}) {return <div className="tp-heading"><p className="mp-eyebrow">[ {number} / {label} ]</p><h2>{children}</h2></div>;}
export default function TildaServicePage({service:originalService}) {
 const { text, money } = usePricing();
 const s = text(originalService);
 const [contactService, setContactService] = useState('tilda');
 const brief = '#mp-contact';
 const cta=<a className="mp-button" href={brief} onClick={() => setContactService('tilda')}>Обсудить мой сайт<ArrowUpRight size={17}/></a>;
 return <div className="mp-page tp-page"><Sidebar activeSection="services"/><main className="mp-main">
  <section className="mp-hero tp-hero"><div className="mp-topline"><nav aria-label="Хлебные крошки"><Link to="/">Главная</Link><span>/</span><Link to="/#services">Услуги</Link><span>/</span><span aria-current="page">{s.name}</span></nav><span className="mp-edition">KSENWEB / УСЛУГИ</span></div>
   <div className="tp-hero-grid"><div><p className="mp-eyebrow">[ ДИЗАЙН И РАЗРАБОТКА НА TILDA ]</p><h1>{s.headline[0]}<br/><span>{s.headline[1]}</span></h1><p className="mp-lead">{s.lead}</p><p className="mp-hero-copy">{s.intro}</p><div className="mp-actions">{cta}<a className="mp-text-link" href="#tilda-prices">Форматы и стоимость<ArrowUpRight size={16}/></a></div></div>
    <div className="tp-results"><div className="tp-results-list">{[
     ['01','Понятное предложение','Клиент видит, чем вы полезны, и находит ответы перед обращением.'],
     ['02','Готовый путь к заявке','Услуги, примеры работ и способы связи собраны в одном месте.'],
     ['03','Управление в ваших руках','Вы сможете менять тексты, фотографии и цены самостоятельно.'],
    ].map(([n,title,copy])=><div key={n}><span>{n}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div></div>
   </div>
  </section>
  <section className="mp-section tp-introduction" id="tilda-process-intro" aria-labelledby="tilda-introduction-title">
   <div className="tp-method-visual"><p className="mp-eyebrow">ОСНОВА БУДУЩЕГО САЙТА</p><div className="tp-method-path">{[[MessageSquare,'Бриф','Разбираемся в вашем бизнесе'],[Search,'Ниша и конкуренты','Находим отличия и важные вопросы'],[LayoutTemplate,'Структура','Выстраиваем путь клиента']].map(([Icon,title,copy],i)=><div key={title}><span className="tp-method-icon"><Icon size={23} strokeWidth={1.5}/></span><div><span className="mp-eyebrow">0{i+1}</span><h3>{title}</h3><p>{copy}</p></div></div>)}</div><div className="tp-method-result"><Check size={18}/><span>Дизайн опирается на задачи вашего бизнеса</span></div></div>
   <div><p className="mp-eyebrow">[ 01 / КАК МЫ БУДЕМ РАБОТАТЬ ]</p><h2 id="tilda-introduction-title">Сначала разберемся<br/>в вашем бизнесе.<br/><span>Затем создадим сайт.</span></h2><p>Начинаем с брифа: обсуждаем ваши услуги, клиентов и задачи. Я погружаюсь в нишу, изучаю конкурентов и разбираюсь, что помогает покупателю выбрать именно вас.</p><p>На этой основе предлагаю структуру: что рассказать, какие доказательства показать и как подвести человека к обращению. Вы понимаете, зачем нужен каждый блок, еще до начала дизайна.</p><ul className="tp-trust-points"><li><Check size={16}/>Вы общаетесь со мной напрямую</li><li><Check size={16}/>Структуру и дизайн согласуем по этапам</li><li><Check size={16}/>Состав работ, стоимость и срок фиксируем до старта</li></ul><a className="mp-text-link" href="#tilda-process">Все этапы: от брифа до запуска<ArrowUpRight size={16}/></a></div>
  </section>
  <section className="mp-section tp-portfolio" id="tilda-projects"><div><p className="mp-eyebrow">[ КЕЙСЫ ]</p><h2>Как я решаю задачи<br/><span>бизнеса через сайт</span></h2><p>Посмотрите, как задачи клиентов превращаются в структуру, дизайн и готовые проекты. В кейсах рассказываю о решениях, а не только показываю экраны.</p></div><LandingProjects service="tilda"/><Link className="mp-button" to="/cases">Посмотреть все кейсы<ArrowUpRight size={17}/></Link></section>
  <section className="mp-section tp-capabilities"><Heading number="02" label="СОСТАВ РАБОТ">{s.scopeTitle[0]}<br/><span>{s.scopeTitle[1]}</span></Heading><div className="tp-capability-grid">{s.scope.map(([title,text],i)=>{const Icon=icons[i];return <article key={title}><div className="tp-card-top"><Icon size={30} strokeWidth={1}/><span>0{i+1}</span></div><h3>{title}</h3><p>{text}</p></article>;})}</div></section>
  <section className="mp-section tp-formats" id="tilda-prices"><Heading number="03" label="ФОРМАТЫ И СТОИМОСТЬ">Выберите сайт<br/><span>под вашу задачу</span></Heading><p className="tp-section-lead">Одна услуга, несколько направлений или каталог товаров — предложу подходящий формат. Если пока не знаете, с чего начать, помогу определиться.</p><div className="tp-format-grid">{s.related.map((item,i)=>{const Icon=[LayoutTemplate,Layers,ShoppingBag][i];return <article key={item.href}><Icon size={36} strokeWidth={1}/><h3>{item.title}</h3><strong className="tp-format-price">от {money(Number(prices[i][1].replace(/ /g,'')))}</strong><p>{item.text}</p><ul className="tp-format-includes">{[['Структура одной страницы','Индивидуальный дизайн и адаптив','Формы обращений и SEO-основа'],['Страницы компании и услуг','Общая навигация и адаптив','Формы и управление содержанием'],['Каталог и карточки товаров','Корзина и оформление заказа','Согласованные оплата и доставка']][i].map(text=><li key={text}><Check size={14}/>{text}</li>)}</ul><a className="mp-button tp-format-cta" href="#mp-contact" onClick={() => setContactService('tilda')}>Обсудить {i===0?'лендинг':i===1?'сайт компании':'магазин'}<ArrowUpRight size={16}/></a><Link className="mp-text-link" to={item.href}>Что входит в разработку<ArrowUpRight size={16}/></Link></article>;})}</div><div className="tp-price-notes"><p>{s.priceText}</p><p><Check size={16}/>Стоимость и срок фиксируем после согласования состава работ</p></div><div className="mp-actions tp-wide-action">{cta}</div></section>
  <section className="mp-section tp-redesign" id="tilda-redesign" aria-labelledby="tilda-redesign-title">
   <div className="tp-redesign-copy"><p className="mp-eyebrow">[ ОБНОВЛЕНИЕ САЙТА ]</p><h2 id="tilda-redesign-title">Нужен редизайн сайта?<br/><span>Сделаем услуги понятнее,<br/>а обращение — проще.</span></h2><p>Обновлю дизайн, структуру и мобильную версию, чтобы посетителю было проще разобраться в ваших услугах и связаться с вами. Начнем с текущего сайта: определим, что стоит сохранить, а что нужно переработать.</p><div className="tp-redesign-signals">{[[Smartphone,'На телефоне неудобно','Мелкий текст, съехавшие блоки или сложная форма заявки.'],[Layers,'Услуги изменились','Новые направления некуда добавить, а клиентам трудно найти нужное.'],[MousePointer2,'Посетители не доходят до обращения','Непонятно, что вы предлагаете, где посмотреть работы и как заказать.']].map(([Icon,title,copy])=><div key={title}><Icon size={21}/><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div><div className="mp-actions"><a className="mp-button" href="#mp-contact" onClick={() => setContactService('redesign')}>Обсудить обновление<ArrowUpRight size={17}/></a><Link className="mp-text-link" to="/services/redesign">Подробнее о редизайне<ArrowUpRight size={16}/></Link></div></div>

  </section>

    <Reviews/>
  <section className="mp-section tp-process" id="tilda-process"><Heading number="04" label="ЭТАПЫ РАБОТЫ">Вы понимаете, что происходит<br/><span>на каждом этапе</span></Heading><p className="tp-process-hint">5 этапов от брифа до запуска</p><ServiceProcess steps={s.steps} horizontal/></section>
  <section className="mp-section mp-faq tp-faq"><Heading number="05" label="FAQ">Что важно знать<br/><span>перед заказом</span></Heading>{s.faq.map(([q,a])=><details key={q}><summary><h3>{q}</h3><Plus size={18} className="mp-faq-icon"/></summary><p>{a}</p></details>)}</section>
  <aside className="mp-section tp-platform-note"><p>Нужны личные кабинеты, роли пользователей или сложная логика? Обсудим требования и подберем подходящий способ разработки.</p><Link className="mp-text-link" to="/services/web-apps">Подробнее о веб-приложениях<ArrowUpRight size={16}/></Link></aside>
  <ServiceContact service={contactService} title={contactService === 'redesign' ? 'Обсудим обновление вашего сайта' : s.cta}/>
 </main></div>;
}
