export const serviceLeadOptions = {
  websites: { title:'Создание сайта', question:'Какой сайт вам нужен?', choices:['Лендинг','Сайт компании','Интернет-магазин','Нужна помощь с выбором'], placeholder:'Расскажите о бизнесе и задаче' },
  tilda: { title:'Сайт на Tilda', question:'Какой сайт вам нужен?', choices:['Лендинг','Сайт компании','Интернет-магазин','Нужна помощь с выбором'], placeholder:'Расскажите о бизнесе и задаче' },
  redesign: { title:'Редизайн сайта', question:'Что хотите обновить?', choices:['Дизайн','Структуру и содержание','Сайт целиком','Нужен разбор сайта'], placeholder:'Ссылка на текущий сайт и что хочется изменить' },
  'web-apps': { title:'Веб-приложение или сервис', question:'На каком этапе проект?', choices:['Есть идея','Есть макеты','Нужно доработать сервис','Нужна помощь с оценкой'], placeholder:'Что пользователи должны делать в сервисе?' },
  'ui-ux-design': { title:'Дизайн сайта или интерфейса', question:'Что нужно спроектировать?', choices:['Сайт','Интерфейс сервиса','Прототип','Нужна помощь с выбором'], placeholder:'Для кого проект и какая задача у интерфейса?' },
  general: { title:'Обсуждение проекта', question:'Какая у вас задача?', choices:['Новый сайт','Редизайн','Приложение или сервис','Только дизайн','Помогите выбрать'], placeholder:'Пара слов о задаче или ссылка на текущий сайт' },
  landing: { title:'Лендинг', price:30000, question:'Для чего нужен лендинг?', choices:['Услуга','Продукт','Мероприятие','Пока выбираю'], placeholder:'Например, консультации психолога' },
  multipage: { title:'Многостраничный сайт', price:45000, question:'Какая задача у сайта?', choices:['Представить компанию','Показать услуги','Обновить текущий сайт','Нужна помощь с выбором'], placeholder:'Например, строительство или юридические услуги' },
  'online-store': { title:'Интернет-магазин', price:45000, question:'С чего начнём?', choices:['Первый магазин','Перенос магазина','Обновление магазина','Пока изучаю варианты'], placeholder:'Например, одежда, косметика или товары для дома' },
};
export function chooseServiceProjects(items, service) {
  const eligible = items.filter(item => !item.is_ai_concept && !item.isAiConcept && !item.is_in_development && !item.inDevelopment &&
    (item.slug || item.id) && (item.card_image || item.cardImage || item.imageMain || item.hero_image || item.heroImage));
  return [...eligible].sort((a,b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity) || String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0,3);
}
