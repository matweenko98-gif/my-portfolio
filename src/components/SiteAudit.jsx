import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ScanSearch } from 'lucide-react';
import { submitBrief } from '../utils/submitBrief';
import { trackConversion } from '../utils/analytics';
import './SiteAudit.css';

export default function SiteAudit() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    const fields = new FormData(event.currentTarget);
    const site = String(fields.get('website') || '').trim();
    const contact = String(fields.get('contact') || '').trim();
    try {
      const url = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`);
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error();
    } catch { setError('Укажите адрес сайта, например example.ru'); return; }
    if (contact.length < 3) { setError('Укажите телефон, email или @telegram'); return; }
    setStatus('sending'); setError('');
    const message = `Заявка: Бесплатный экспресс-аудит сайта\n\nСайт для аудита: ${site}\nКонтакт: ${contact}\n\nЧто проверить:\n${String(fields.get('problem') || '').trim() || 'Нужен экспресс-разбор сайта'}`;
    if (await submitBrief(message, fields.get('consent') === 'on')) {
      setStatus('success');
      trackConversion('lead_submitted', { form_type: 'site_audit', service: 'audit' });
    } else { setStatus('idle'); setError('Не удалось отправить заявку. Попробуйте ещё раз чуть позже'); }
  }
  return <section id="site-audit" className="site-audit" aria-labelledby="site-audit-title">
    <div className="site-audit-top"><span>[ БЕСПЛАТНЫЙ ЭКСПРЕСС-АУДИТ ]</span><ScanSearch size={24} aria-hidden="true"/></div>
    <div className="site-audit-grid">
      <div className="site-audit-intro">
        <h2 id="site-audit-title">Что мешает<br/>вашему сайту?<br/><span>Посмотрим бесплатно</span></h2>
        <p>Если чувствуете, что сайт можно улучшить, но не знаете, с чего начать, пришлите ссылку. Я посмотрю основные страницы и соберу небольшой PDF на несколько страниц: что стоит исправить в первую очередь и почему</p>
        <ul>{[
          ['Свежий взгляд на сайт', 'Отмечу самые заметные сложности в подаче, навигации и мобильной версии — то, что может мешать посетителю понять предложение и связаться с вами'],
          ['Конкретные замечания в PDF', 'Покажу на примерах с вашего сайта, что можно улучшить, объясню почему и предложу направление исправлений'],
          ['Понятный первый шаг', 'Выделю несколько приоритетных доработок, чтобы вы понимали, с чего начать. Рекомендации можно обсудить со своим дизайнером или разработчиком'],
        ].map(([title, text]) => <li key={title}><Check size={16} aria-hidden="true"/><div><strong>{title}</strong><span>{text}</span></div></li>)}</ul>
        <p className="site-audit-note">Это короткий обзор, а не полный аудит всех страниц, SEO и технической части. Бесплатно и без обязательства заказывать доработки</p>
      </div>
      <div className="site-audit-form-panel">
        <h3>Получите бесплатный экспресс-аудит</h3>
        <p>Оставьте ссылку и контакт — подготовлю краткий разбор в PDF на несколько страниц. Если есть конкретный вопрос к сайту, напишите его ниже</p>
        {status === 'success' ? <div className="site-audit-success" role="status"><Check size={28}/><h3>Заявка на экспресс-аудит отправлена</h3><p>Свяжусь с вами в течение 1 рабочего дня, чтобы уточнить задачу и сообщить, когда будет готов PDF-разбор</p></div> : <form className="lp-lead-form" onSubmit={submit}>
          <label>Ссылка на сайт<input name="website" type="text" inputMode="url" autoComplete="url" placeholder="example.ru" required maxLength={500}/></label>
          <label>Ваш контакт<input name="contact" placeholder="Телефон, email или @telegram" required maxLength={200}/></label>
          <label>Что вас не устраивает? <span>(необязательно)</span><textarea name="problem" placeholder="Например: посетители есть, но заявок почти нет" rows={3} maxLength={2000}/></label>
          <label className="lp-consent"><input type="checkbox" name="consent" required/><span>Согласен с <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности (в новой вкладке)</Link> и обработкой данных для ответа на заявку</span></label>
          {error && <p role="alert">{error}</p>}
          <button className="mp-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправка…' : 'Получить бесплатный разбор'}<ArrowUpRight size={16} aria-hidden="true"/></button>
          <p>Отвечу в течение 1 рабочего дня</p>
        </form>}
      </div>
    </div>
  </section>;
}
