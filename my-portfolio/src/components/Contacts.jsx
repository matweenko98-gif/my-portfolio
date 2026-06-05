import React from 'react';
import contentData from '../contentData';

export default function Contacts() {
  return (
    <section id="contacts" className="py-20 px-6 md:px-12 lg:px-16">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-6">
        {contentData.contacts.title}
      </h2>
      <p className="text-[15px] sm:text-[16px] text-zinc-500 leading-relaxed max-w-[560px] mb-10">
        {contentData.contacts.description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={contentData.contacts.buttons.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-zinc-900 text-white font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto"
        >
          {contentData.contacts.buttons.telegram.text}
        </a>
        <a
          href={contentData.contacts.buttons.email.url}
          className="inline-flex items-center justify-center bg-white text-zinc-900 border border-zinc-200 font-semibold py-3.5 px-7 rounded-xl hover:bg-zinc-50 transition-all duration-200 hover:-translate-y-[1px] text-center text-sm w-full sm:w-auto"
        >
          {contentData.contacts.buttons.email.text}
        </a>
      </div>
    </section>
  );
}
