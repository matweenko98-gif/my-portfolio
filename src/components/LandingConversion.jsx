import { serviceLeadOptions, chooseServiceProjects } from '../utils/serviceLeads';
import { caseCardImg } from '../utils/imageUtils';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import contentData from '../contentData';
import { normalizeCaseRecord } from '../utils/caseRecord';
import { submitBrief } from '../utils/submitBrief';
import { trackConversion } from '../utils/analytics';
import { usePricing } from './CurrencyProvider';

export function LandingProjects({ service = 'landing' }) {
  const [projects, setProjects] = useState(() => chooseServiceProjects((contentData.cases?.items || []).map(normalizeCaseRecord), service));
  useEffect(() => {
    let active = true;
    import('../lib/supabaseClient').then(({ supabase }) => supabase.from('cases').select('*').order('sort_order', { ascending: true })).then(({ data }) => {
      if (!active) return;
      const items = (data?.length ? data : contentData.cases?.items || []).map(normalizeCaseRecord);
      setProjects(chooseServiceProjects(items, service));
    }).catch(() => {});
    return () => { active = false; };
  }, [service]);
  if (!projects.length) return null;
  return <div className="lp-project-grid lp-home-cards">{projects.map((item,index) => {
    const title = item.card_title || item.title || 'Пример сайта';
    const image = item.card_image || item.cardImage || item.imageMain || item.hero_image || item.heroImage;
    const tags = Array.isArray(item.card_tags) ? item.card_tags : (Array.isArray(item.tags) ? item.tags : []);
    return <Link aria-label={`Смотреть кейс: ${title}`} className="lp-home-case group" key={item.id || item.slug} to={`/case/${encodeURIComponent(item.slug || item.id)}`}>
      <article>
        <div className="lp-case-top"><span>[ КЕЙС {String(index+1).padStart(2,'0')} ]</span><small>Разбор кейса</small></div>
        <div className="lp-case-cover"><img src={caseCardImg(image)} alt={title} loading="lazy" decoding="async" width="650" height="488"/><div className="lp-case-hover"><span>СМОТРЕТЬ КЕЙС ↗</span></div><div className="lp-case-tags">{tags.slice(0,3).map(tag=><span key={String(tag)}>{tag}</span>)}</div></div>
        <h3><span>{title}</span><span aria-hidden="true">↗</span></h3>
        <span className="lp-case-mobile-link">Смотреть кейс →</span>
      </article>
    </Link>;
  })}</div>;
}

export function LandingLeadForm({ service = 'landing' }) {
  const config = serviceLeadOptions[service] || serviceLeadOptions.general;
  const [goal, setGoal] = useState('');
  const { money } = usePricing();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const contact = String(fields.get('contact') || '').trim();
    if (contact.length < 3) { setError('Укажите телефон, email или имя пользователя в Telegram.'); return; }
    setStatus('sending'); setError('');
    const message = `Заявка: ${config.title}\n\nИмя: ${String(fields.get('name') || '').trim() || 'Не указано'}\nКонтакт: ${contact}\n\nЗадача: ${goal || 'Обсудить проект'}\n\nО задаче:\n${String(fields.get('industry') || '').trim() || 'Не указано'}${config.price ? `\n\nСтоимость на странице: от ${money(config.price)}` : ''}`;
    const ok = await submitBrief(message, fields.get('consent') === 'on');
    if (ok) { setStatus('success'); trackConversion('lead_submitted', { form_type:'service_short', service }); }
    else { setStatus('idle'); setError('Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram.'); }
  }
  if (status === 'success') return <div role="status"><h3>Заявка отправлена</h3><p>Свяжусь с вами в течение 1 рабочего дня, уточню задачу и подготовлю предварительную оценку.</p></div>;
  return <form className="lp-lead-form" onSubmit={submit}>
    <fieldset className="service-lead-choice"><legend>{config.question}</legend><div>{config.choices.map(choice => <label key={choice} className={goal === choice ? 'is-selected' : ''}><input type="radio" name="goal" value={choice} checked={goal === choice} onChange={() => setGoal(choice)}/><span>{choice}</span></label>)}</div></fieldset>
    <label>Ваш контакт<input name="contact" autoComplete="off" placeholder="Телефон, email или @telegram" maxLength={200} required /></label>
    <label>О задаче <span>(необязательно)</span><textarea name="industry" placeholder={config.placeholder} maxLength={2000} rows={3}/></label>
    <label>Как к вам обращаться <span>(необязательно)</span><input name="name" autoComplete="name" maxLength={100}/></label>

    <label className="lp-consent"><input name="consent" type="checkbox" required/><span>Согласен с <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности (в новой вкладке)</Link> и обработкой данных для ответа на заявку.</span></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit" className="mp-button" disabled={status === 'sending'}>{status === 'sending' ? 'Отправка…' : 'Получить предварительную оценку'}</button>
    <p>Отвечаю в течение 1 рабочего дня. Уточним задачу, состав работ, стоимость и сроки.</p>
  </form>;
}
