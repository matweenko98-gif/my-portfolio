export const serviceLeadOptions = {
  landing: { title:'Лендинг', price:30000, question:'Для чего нужен лендинг?', choices:['Услуга','Продукт','Мероприятие','Пока выбираю'], placeholder:'Например, консультации психолога' },
  multipage: { title:'Многостраничный сайт', price:45000, question:'Какая задача у сайта?', choices:['Представить компанию','Показать услуги','Обновить текущий сайт','Нужна помощь с выбором'], placeholder:'Например, строительство или юридические услуги' },
  'online-store': { title:'Интернет-магазин', price:45000, question:'С чего начнём?', choices:['Первый магазин','Перенос магазина','Обновление магазина','Пока изучаю варианты'], placeholder:'Например, одежда, косметика или товары для дома' },
};
export function chooseServiceProjects(items, service) {
  const eligible = items.filter(item => !item.is_ai_concept && !item.isAiConcept && !item.is_in_development && !item.inDevelopment &&
    !/приложен|mvp|платформ|сервис/i.test(item.meta?.type || '') &&
    (item.slug || item.id) && (item.card_image || item.cardImage || item.imageMain || item.hero_image || item.heroImage));
  const expression = service === 'online-store' ? /магазин|каталог|ecommerce|e-commerce|shop|store/i : service === 'multipage' ? /многостранич|корпоратив|компани|строител|b2b/i : /лендинг|landing|одностранич/i;
  const relevant = eligible.filter(item => expression.test([item.title,item.card_title,item.meta?.type,...(Array.isArray(item.tags)?item.tags:[]),...(Array.isArray(item.card_tags)?item.card_tags:[])].join(' ')));
  return (relevant.length ? relevant : eligible).slice(0,3);
}
