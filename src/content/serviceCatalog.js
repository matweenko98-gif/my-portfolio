export const serviceCatalog = {
  landing: { name: 'Лендинг', description: 'Одна страница для услуги, продукта или события.', price: 30000 },
  multipage: { name: 'Сайт компании', description: 'Отдельные страницы услуг, проектов и информации о компании.', price: 45000 },
  'online-store': { name: 'Интернет-магазин', description: 'Каталог, карточки товаров, корзина и оформление заказа.', price: 45000 },
  redesign: { name: 'Редизайн сайта', description: 'Обновление существующего сайта и его структуры.', price: 20000 },
  'web-apps': { name: 'Веб-приложение или сервис', description: 'Личные кабинеты, данные и рабочие сценарии.', price: 40000 },
  'ui-ux-design': { name: 'Дизайн без разработки', description: 'Прототипы и макеты для вашего разработчика.', price: 20000 },
};

// Explicit choices in the existing JSON meta column need no database migration.
// Legacy projects keep working until their author chooses services in the editor.
export function caseServices(item) {
  const explicit = item.meta?.services;
  if (Array.isArray(explicit)) return explicit.filter(key => serviceCatalog[key]);
  const primary = [item.title, item.card_title, item.meta?.type].join(' ');
  const label = [primary, ...(Array.isArray(item.card_tags) ? item.card_tags : []), ...(Array.isArray(item.tags) ? item.tags : [])].join(' ');
  const keys = [];
  if (/лендинг|landing|одностранич|тарталет/i.test(label)) keys.push('landing');
  if (/многостранич|корпоратив|строитель|b2b/i.test(label)) keys.push('multipage');
  // A corporate catalogue tagged E-commerce is not necessarily an online store.
  if (/интернет.магазин|онлайн.магазин/i.test(primary) || (!keys.includes('multipage') && /e.?commerce|интернет.магазин|онлайн.магазин/i.test(label))) keys.push('online-store');
  if (/редизайн|redesign/i.test(label)) keys.push('redesign');
  if (/приложен|платформ|сервис|mvp|saas/i.test(label)) keys.push('web-apps');
  if (/figma|дизайн|ux|ui/i.test([label, item.meta?.stack].join(' '))) keys.push('ui-ux-design');
  return [...new Set(keys)];
}

export function relatedCaseServices(item) {
  const priorities = ['redesign', 'web-apps', 'landing', 'online-store', 'multipage', 'ui-ux-design'];
  return caseServices(item).sort((a,b) => priorities.indexOf(a) - priorities.indexOf(b)).slice(0,2).map(key => ({ key, ...serviceCatalog[key] }));
}
