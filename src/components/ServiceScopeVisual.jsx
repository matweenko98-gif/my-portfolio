import React from 'react';
import { ArrowRight, Check, Layers, Monitor, Smartphone, SlidersHorizontal } from 'lucide-react';

const diagrams = {
  redesign: [
    ['РАЗБОР САЙТА','Содержание','Навигация','Обращения'],
    ['НОВАЯ СТРУКТУРА','Главная','Услуги','Контакты'],
    ['ВИЗУАЛЬНЫЙ СТИЛЬ','Типографика','Сетка','Изображения'],
    ['МОБИЛЬНАЯ ВЕРСИЯ','Текст','Меню','Форма'],
    ['ПЕРЕНОС САЙТА','Материалы','Страницы','Подключения'],
    ['ПРОВЕРКА АДРЕСОВ','Старый адрес','Новая страница','Редирект'],
  ],
  'web-apps': [
    ['СЦЕНАРИЙ ПОЛЬЗОВАТЕЛЯ','Вход','Действие','Результат'],
    ['ДИЗАЙН ИНТЕРФЕЙСА','Навигация','Экран','Состояния'],
    ['ДАННЫЕ И ДОСТУПЫ','Пользователь','Роль','Кабинет'],
    ['ПАНЕЛЬ УПРАВЛЕНИЯ','Материалы','Пользователи','Настройки'],
    ['ИНТЕГРАЦИИ','Ваш сервис','API','Внешний сервис'],
    ['ПЕРВЫЙ ЗАПУСК','Сценарии','Проверка','Передача'],
  ],
  'ui-ux-design': [
    ['СТРУКТУРА ПРОЕКТА','Разделы','Экраны','Переходы'],
    ['ПРОТОТИП','Содержание','Композиция','Действие'],
    ['ВИЗУАЛЬНАЯ КОНЦЕПЦИЯ','Типографика','Цвет','Сетка'],
    ['МАКЕТЫ И АДАПТИВ','Компьютер','Планшет','Смартфон'],
    ['КОМПОНЕНТЫ','Поле ввода','Кнопка','Состояние'],
    ['ПЕРЕДАЧА ДИЗАЙНА','Figma','Материалы','Пояснения'],
  ],
};

export function ServiceScopeVisual({ service, index }) {
  const [heading,...labels] = (diagrams[service] || diagrams.redesign)[index];
  return <div className={`service-scope-visual service-scope-visual-${index}`} aria-hidden="true">
    <div className="service-visual-top"><span>{heading}</span><Layers size={15}/></div>
    {index === 2 ? <div className="service-design-sample"><strong>Aa</strong><div><i/><i/><i/></div><p>{labels.join(' · ')}</p></div>
      : index === 3 && service !== 'web-apps' ? <div className="service-device-sample"><Monitor size={66} strokeWidth={1}/><Smartphone size={40} strokeWidth={1}/><span>{labels.join(' · ')}</span></div>
      : index === 1 || index === 3 ? <div className="service-wireframe"><div><SlidersHorizontal size={15}/>{labels[0]}</div><section><b>{labels[1]}</b><i/><i/><span>{labels[2]} <ArrowRight size={13}/></span></section></div>
      : <div className="service-flow-sample">{labels.map((label,i)=><React.Fragment key={label}><div>{index===5 ? <Check size={15}/> : <span>0{i+1}</span>}{label}</div>{i<labels.length-1 && index!==5 && <ArrowRight size={14}/>}</React.Fragment>)}</div>}
  </div>;
}
