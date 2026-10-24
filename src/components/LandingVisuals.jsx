import React from 'react';
import { ArrowUpRight, Check, MousePointer2, Smartphone, Monitor, Layers, Search, Send, CheckCircle2 } from 'lucide-react';

export function ScopeVisual({ index, service = 'landing' }) {
  if (service === 'online-store') return <StoreScopeVisual index={index}/>;
  const company = service === 'multipage';
  const icons=[Layers,MousePointer2,Monitor,Send,Search,CheckCircle2];
  const Icon=icons[index];
  return <div className={`lp-scope-visual lp-scope-visual-${index}`} aria-hidden="true">
    <div className="lp-visual-top"><span>{['СТРУКТУРА','ДИЗАЙН','АДАПТИВ','ОБРАЩЕНИЯ','SEO-ОСНОВА','ПЕРЕДАЧА'][index]}</span><Icon size={15}/></div>
    {index===0 && <div className="lp-mini-flow"><div>{company ? 'Главная' : 'Предложение'}</div><i/><div className="lp-mini-flow-pair"><span>{company ? 'Услуги' : 'Преимущества'}</span><span>{company ? 'Проекты' : 'Примеры'}</span></div><i/><div>Заявка <ArrowUpRight size={12}/></div></div>}
    {index===1 && <div className="lp-design-board"><div className="lp-design-type">Aa<span>Типографика</span></div><div className="lp-swatches"><i/><i/><i/></div><div className="lp-design-selection"><b>{company ? 'Ваша компания.' : 'Ваш бренд.'}</b><span>Индивидуальный дизайн</span><MousePointer2 size={20}/></div></div>}
    {index===2 && <div className="lp-devices"><div className="lp-desktop-preview"><div/><b>Ваш сайт</b><i/><i/><span/></div><div className="lp-mobile-preview"><Smartphone size={12}/><b>Ваш<br/>сайт</b><i/><i/><span/></div></div>}
    {index===3 && <div className="lp-form-preview"><div>Имя <span>Александр</span></div><div>Контакт <span>+375 ···</span></div><b>Оставить заявку <ArrowUpRight size={12}/></b><p><Check size={12}/> Уведомление о заявке</p></div>}
    {index===4 && <div className="lp-search-preview"><span>ПРИМЕР ОФОРМЛЕНИЯ В ПОИСКЕ</span><small>your-site.by</small><b>Ваша услуга — название компании</b><p>Краткое описание предложения, условий и преимуществ.</p><div><Check size={12}/> Заголовок <Check size={12}/> Описание</div></div>}
    {index===5 && <div className="lp-handover-preview"><div><CheckCircle2 size={26}/><b>Готово к запуску</b></div>{['Мобильная версия','Форма обращения','Доступы и инструкция'].map(label=><p key={label}><Check size={12}/>{label}</p>)}</div>}
  </div>;
}

function StoreScopeVisual({index}) {
 const labels=['КАТАЛОГ','ТОВАР','КОРЗИНА','ОПЛАТА И ДОСТАВКА','ДИЗАЙН И АДАПТИВ','ТЕСТОВЫЙ ЗАКАЗ'];
 return <div className="lp-scope-visual store-scope-visual" aria-hidden="true"><div className="lp-visual-top"><span>{labels[index]}</span><ArrowUpRight size={15}/></div>
 {index===0 && <div className="store-catalog-preview">{['Коллекция 01','Коллекция 02','Коллекция 03'].map((label,i)=><div key={label}><div className={`store-item-shape store-shape-${i}`}/><span>{label}</span></div>)}</div>}
 {index===1 && <div className="store-product-preview"><div className="store-product-image"><div className="store-item-shape"/></div><div><small>КОЛЛЕКЦИЯ</small><b>Ваш товар</b><p>Описание и детали</p><div className="store-size-options"><span>S</span><span>M</span><span>L</span></div><em>В корзину ↗</em></div></div>}
 {index===2 && <div className="store-cart-preview"><div><span>Ваш товар</span><b>− &nbsp; 1 &nbsp; +</b></div><div><span>Доставка</span><small>Выбрать способ</small></div><p>Контакты покупателя</p><em>Оформить заказ ↗</em></div>}
 {index===3 && <div className="store-delivery-preview"><div><span>01</span><b>Способ получения</b></div><p><Check size={12}/> Доставка <span>Самовывоз</span></p><div><span>02</span><b>Способ оплаты</b></div><p><Check size={12}/> Согласованный провайдер</p></div>}
 {index===4 && <div className="lp-devices"><div className="lp-desktop-preview"><div/><b>Каталог</b><div className="store-mini-products"><i/><i/><i/></div></div><div className="lp-mobile-preview"><Smartphone size={12}/><b>Магазин</b><i/><i/><span/></div></div>}
 {index===5 && <div className="lp-handover-preview"><div><CheckCircle2 size={26}/><b>Заказ оформлен</b></div>{['Корзина проверена','Уведомление получено','Каталог передан владельцу'].map(label=><p key={label}><Check size={12}/>{label}</p>)}</div>}
 </div>;
}
