import React from 'react';
import ServiceContact from './ServiceContact';
import ContactMethods from './ContactMethods';
import './MultipageServicePage.css';
export default function Contacts() {
  return <div className="home-contact">
    <ServiceContact id="contacts" dark title="Давайте обсудим ваш проект"/>
    <ContactMethods/>
  </div>;
}
