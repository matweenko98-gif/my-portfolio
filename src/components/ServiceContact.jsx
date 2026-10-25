import React from 'react';
import { LandingLeadForm } from './LandingConversion';
import contentData from '../contentData';

export default function ServiceContact({ service = 'general', id = 'mp-contact', title = 'Обсудим ваш проект', dark = false }) {
  return <section id={id} className={`mp-contact mp-section unified-contact${dark ? ' unified-contact-dark' : ''}`}>
    <div className="mp-contact-bottom lp-contact-layout">
      <div className="lp-contact-intro">
        <p className="mp-eyebrow">[ СЛЕДУЮЩИЙ ШАГ ]</p>
        <h2>{title}</h2>
        <p>Оставьте контакт и пару слов о задаче. В течение 1 рабочего дня свяжусь с вами, уточню детали и подготовлю предварительную оценку стоимости и сроков. Если пока не знаете, какое решение нужно, помогу выбрать.</p>
        <a className="mp-text-link lp-telegram-link" href={contentData.contacts.messengers.telegram.url} target="_blank" rel="noopener noreferrer">Или написать в Telegram ↗</a>
      </div>
      <LandingLeadForm key={service} service={service}/>
    </div>
  </section>;
}
