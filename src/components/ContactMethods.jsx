import React from 'react';
import contentData from '../contentData';

export default function ContactMethods() {
  return <div className="contact-alternatives">
    <a href={`mailto:${contentData.contacts.email}`}>Написать на email: {contentData.contacts.email}</a>
    <a href={`tel:${contentData.contacts.phone.replace(/[^+\d]/g, '')}`}>Позвонить: {contentData.contacts.phone}</a>
    <a href={contentData.contacts.messengers.max.url} target="_blank" rel="noopener noreferrer">Связь в MAX ↗</a>
    <a href={contentData.contacts.messengers.telegram.url} target="_blank" rel="noopener noreferrer">Связь в Telegram ↗</a>
    <span>Первичное обсуждение бесплатно и без обязательств.</span>
  </div>;
}
