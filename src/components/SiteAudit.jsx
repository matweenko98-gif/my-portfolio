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
    } catch { setError('Укажите адрес сайта, например example.ru.'); return; }
    if (contact.length < 3) { setError('Укажите телефон, email или @telegram.'); return; }
    setStatus('sending'); setError('');
    const message = `Заявка: Аудит сайта\n\nСайт для аудита: ${site}\nКонтакт: ${contact}\n\nЧто проверить:\n${String(fields.get('problem') || '').trim() || 'Нужен общий разбор сайта'}`;
    if (await submitBrief(message, fields.get('consent') === 'on')) {
      setStatus('success');
      trackConversion('lead_submitted', { form_type: 'site_audit', service: 'audit' });
    } else { setStatus('idle'); setError('Не удалось отправить заявку. Попробуйте ещё раз чуть позже.'); }
  }
  return <section id="site-audit" className="site-audit" aria-labelledby="site-audit-title">
    <div className="site-audit-top"><span>[ АУДИТ САЙТА ]</span><ScanSearch size={24} aria-hidden="true"/></div>
    <div className="site-audit-grid">
      <div className="site-audit-intro">
        <h2 id="site-audit-title">Что улучшить<br/>на вашем сайте<br/><span>и почему</span></h2>
        <p>Вы получите подробный PDF-разбор сайта с конкретными точками для улучшения. По каждому пункту — что мешает пользователю, почему это важно и как исправить.</p>
        <ul>{[
          ['Конкретные проблемы', 'Какие страницы и элементы требуют внимания: от предложения и навигации до форм и мобильной версии.'],
          ['Объяснение и рекомендации', 'Почему возникает сложность и что именно изменить, чтобы посетителю было проще выбрать и оставить заявку.'],
          ['План исправлений по приоритету', 'С чего начать, что доработать позже и что уже работает хорошо. PDF можно передать дизайнеру или разработчику.'],
        ].map(([title, text]) => <li key={title}><Check size={16} aria-hidden="true"/><div><strong>{title}</strong><span>{text}</span></div></li>)}</ul>
        <p className="site-audit-note">Результат — понятный план доработок в PDF, к которому можно возвращаться в процессе работы. Объём, стоимость и сроки аудита согласуем до начала.</p>
      </div>
      <div className="site-audit-form-panel">
        <h3>Получите план улучшения сайта</h3>
        <p>Пришлите ссылку — обсудим вашу задачу, состав PDF-разбора, стоимость и сроки.</p>
        {status === 'success' ? <div className="site-audit-success" role="status"><Check size={28}/><h3>Заявка на аудит отправлена</h3><p>Свяжусь с вами в течение 1 рабочего дня, чтобы уточнить задачу и согласовать следующий шаг.</p></div> : <form className="lp-lead-form" onSubmit={submit}>
          <label>Ссылка на сайт<input name="website" type="text" inputMode="url" autoComplete="url" placeholder="example.ru" required maxLength={500}/></label>
          <label>Ваш контакт<input name="contact" placeholder="Телефон, email или @telegram" required maxLength={200}/></label>
          <label>Что вас не устраивает? <span>(необязательно)</span><textarea name="problem" placeholder="Например: посетители есть, но заявок почти нет" rows={3} maxLength={2000}/></label>
          <label className="lp-consent"><input type="checkbox" name="consent" required/><span>Согласен с <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности (в новой вкладке)</Link> и обработкой данных для ответа на заявку.</span></label>
          {error && <p role="alert">{error}</p>}
          <button className="mp-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправка…' : 'Обсудить аудит сайта'}<ArrowUpRight size={16} aria-hidden="true"/></button>
          <p>Отвечу в течение 1 рабочего дня.</p>
        </form>}
      </div>
    </div>
  </section>;
}
