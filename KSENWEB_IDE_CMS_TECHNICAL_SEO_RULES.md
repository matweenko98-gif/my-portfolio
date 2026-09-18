# KSENWEB — IDE / CMS / TECHNICAL SEO PUBLISHING RULES

Версия: 1.0  
Домен: **https://ksenweb.com**  
Назначение: постоянная техническая инструкция для IDE / Codex / разработчика при реализации блога, админки и публикации статей KSENWEB.

---

# 0. ЦЕЛЬ

Нужно один раз реализовать систему публикации статей так, чтобы после этого владелец сайта мог:

1. Подготовить статью в AI.
2. Зайти в админку.
3. Заполнить поля.
4. Загрузить изображения через админку в существующее хранилище Supabase.
5. Нажать Опубликовать.

После публикации система должна автоматически:
- создать публичный URL;
- сформировать metadata;
- canonical;
- Open Graph;
- Article / BlogPosting JSON-LD;
- добавить статью в `/blog`;
- включить её в sitemap;
- сделать её доступной для internal linking;
- корректно отдать robots directives;
- оптимизировать изображения;
- сохранить нормальную индексацию.

SEO-код не должен вручную редактироваться для каждой статьи.

---

# 1. ГЛАВНЫЙ ПРИНЦИП

**Контент вводится через CMS / admin.  
SEO-инфраструктура формируется программно.**

Не требовать от владельца сайта вручную:
- редактировать sitemap.xml;
- писать JSON-LD;
- добавлять canonical;
- менять HTML `<head>`;
- создавать Open Graph meta;
- редактировать robots.txt;
- править код для публикации новой статьи.

---

# 2. ПУБЛИЧНЫЕ ROUTES

Обязательные routes:

`/blog`
— индекс всех опубликованных статей.

`/blog/[slug]`
— отдельная статья.

Дополнительно, если нужны:
`/blog/category/[slug]`
`/author/[slug]`

Не создавать сложную taxonomy на старте без необходимости.

---

# 3. СТАТУСЫ СТАТЬИ

В CMS реализовать минимум:

- `draft`
- `published`

Опционально:
- `scheduled`
- `archived`

Только `published`:
- доступен публично;
- попадает в `/blog`;
- попадает в sitemap;
- indexable по умолчанию.

Draft:
- не должен индексироваться;
- не должен попадать в sitemap;
- желательно вообще не иметь публичного production URL или защищать preview.

---

# 4. ПОЛЯ CMS — ОБЯЗАТЕЛЬНЫЕ

## Основные

- `title`
- `slug`
- `excerpt`
- `content`
- `coverImage`
- `coverAlt`
- `author`
- `publishedAt`
- `updatedAt`
- `status`

## SEO

- `seoTitle`
- `metaDescription`
- `canonicalOverride` — optional
- `noindex` — boolean, default `false`
- `ogTitle` — optional
- `ogDescription` — optional
- `ogImage` — optional

## Classification

- `category`
- `tags` — optional
- `primaryKeyword` — optional editorial field
- `secondaryKeywords` — optional editorial field

## Related

- `relatedArticleIds` — optional/manual override

## Pinterest / campaign

Не обязательно для первой версии админки, но полезно:
- `campaignName`
- `pinterestNotes`

Pinterest pins сами по себе можно хранить вне CMS.

---

# 5. ПОЛЯ CMS — UX

Форма должна быть разделена на вкладки или секции:

1. **Content**
2. **Media**
3. **SEO**
4. **Publishing**
5. **Relations**

Не показывать владельцу технические JSON-LD поля.

---

# 6. SLUG

Slug:
- lowercase;
- latin;
- дефисы;
- без пробелов;
- уникальный.

Пример:
`why-website-looks-cheap`

Финальный URL:
`https://ksenweb.com/blog/why-website-looks-cheap`

CMS должна:
- валидировать slug;
- проверять uniqueness;
- показывать preview URL.

После публикации не менять slug без осознанного решения.

---

# 7. ИЗМЕНЕНИЕ SLUG

Если опубликованный slug меняется:

обязательно создать permanent redirect:

старый:
`/blog/old-slug`

→ новый:
`/blog/new-slug`

Использовать 301/308 permanent redirect.

Хранить историю предыдущих slug или redirect mapping.

Не допускать бесконечных redirect chains.

---

# 8. SEO TITLE

Логика:

если заполнен `seoTitle`
→ использовать его.

иначе
→ использовать `title`.

Опционально шаблон:
`{seoTitle} | KSENWEB`

Но избегать слишком длинного title.

CMS желательно показывает character preview, но не блокирует публикацию только по длине.

---

# 9. META DESCRIPTION

Если заполнен `metaDescription`
→ использовать его.

Если нет:
→ fallback из `excerpt`.

Не генерировать случайный fragment из HTML body.

---

# 10. CANONICAL

Для каждой опубликованной статьи:

по умолчанию:

`https://ksenweb.com/blog/{slug}`

В `<head>`:

`rel="canonical"`

UTM URL:
`?utm_source=pinterest...`

не должен становиться отдельным canonical.

Canonical всегда должен указывать на чистый production URL без UTM и tracking parameters.

`canonicalOverride` использовать только в исключительных случаях.

---

# 11. OPEN GRAPH

На каждой статье автоматически:

- `og:type = article`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `article:published_time`
- `article:modified_time`

Fallbacks:

`ogTitle` → `seoTitle` → `title`

`ogDescription` → `metaDescription` → `excerpt`

`ogImage` → `coverImage`

OG URL всегда canonical production URL.

---

# 12. SOCIAL IMAGE

Cover может использоваться как default OG.

Рекомендуется позволить отдельный OG image.

Изображение:
- доступно публично;
- имеет абсолютный URL;
- не требует auth;
- стабильно после публикации.

---

# 13. STRUCTURED DATA

Для статьи автоматически генерировать JSON-LD:

тип:
`BlogPosting` или `Article`.

Минимум:
- `@context`
- `@type`
- `headline`
- `description`
- `image`
- `datePublished`
- `dateModified`
- `author`
- `mainEntityOfPage`

Если есть author page — указать URL автора.

JSON-LD должен соответствовать реально отображаемому контенту.

Не вставлять данные, которых нет на странице.

---

# 14. DATES

Хранить:
- `publishedAt`
- `updatedAt`

`updatedAt` изменять только при содержательном обновлении статьи, а не при каждом техническом deploy.

Показывать дату публикации на странице.

Если статья существенно обновлена — можно показывать:
`Обновлено: ...`

---

# 15. AUTHOR

Автор статьи должен быть реальным.

CMS:
- author name;
- optional author page;
- optional avatar.

Не создавать фальшивого «редакционного отдела».

---

# 16. SITEMAP.XML

## Ключевое правило

**Sitemap должен быть динамическим / программно генерируемым.**

Не поддерживать список статей вручную.

При запросе `/sitemap.xml` система должна формировать список:
- основных indexable страниц;
- всех `published` статей;
- других публичных indexable routes.

Не включать:
- drafts;
- admin;
- API;
- preview;
- noindex pages;
- internal system routes.

Для статей указывать:
- `loc`
- `lastmod`, если есть корректный `updatedAt`.

## Search Console

После появления блога и реализации sitemap:

1. Проверить `https://ksenweb.com/sitemap.xml`.
2. Один раз отправить этот URL в Google Search Console, если он ещё не отправлен.
3. После этого **не нужно вручную повторно добавлять sitemap после каждой статьи**.
4. Новые статьи автоматически появляются в том же sitemap.
5. Google периодически перечитывает sitemap.

Можно вручную использовать URL Inspection для важных новых материалов, но это не является обязательным шагом публикации каждой статьи.

---

# 17. ROBOTS.TXT

Создать / проверить:

`https://ksenweb.com/robots.txt`

Production:

- разрешить обычный public crawl;
- закрыть технические зоны.

Пример логики:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
```

Добавить:

`Sitemap: https://ksenweb.com/sitemap.xml`

Не использовать `robots.txt` как основной способ noindex публичной страницы.

---

# 18. NOINDEX

Для:
- preview;
- test pages;
- drafts, если они публично доступны;
- admin;
- internal search / utility routes, если такие появятся.

Использовать page-level robots:
`noindex`.

Production article default:
`index, follow`.

---

# 19. VERCEL / PREVIEW ENVIRONMENTS

Если сайт размещается на Vercel:

Production domain:
`ksenweb.com`
→ indexable.

Vercel preview deployments:
→ noindex.

Старый `*.vercel.app` production alias:
предпочтительно permanent redirect на `https://ksenweb.com`.

Не допускать, чтобы одинаковый production-контент индексировался одновременно на:
- `ksenweb.com`
- старом `vercel.app`

---

# 20. BLOG INDEX

`/blog` должен:
- быть server-rendered/static-rendered для поисковика;
- иметь обычные crawlable `<a href>` ссылки;
- содержать title/excerpt/cover/date;
- не зависеть исключительно от client-side search/filter для обнаружения статей.

Новые статьи должны появляться автоматически после Publish.

---

# 21. ARTICLE HTML STRUCTURE

Использовать semantic HTML:

- `<article>`
- `<header>`
- `<h1>`
- `<h2>`
- `<h3>` при реальной вложенности
- `<figure>`
- `<figcaption>` где нужно
- `<nav>` для breadcrumbs / related navigation
- `<time datetime="">`

Только один H1 на статье.

Не использовать headings как декоративные элементы.

---

# 22. BODY CONTENT

Редактор должен поддерживать минимум:

- paragraph;
- H2;
- H3;
- bullet list;
- numbered list;
- links;
- image;
- caption;
- quote;
- callout;
- optional table;
- code block, если понадобится.

Важно:
не хранить статью только как визуальный screenshot.

Текст должен существовать как нормальный HTML content для crawl/index.

---

# 23. CONTENT STORAGE

Подходит:
- structured JSON;
- rich text JSON;
- Markdown;
- sanitized HTML.

Выбрать формат, совместимый с текущим проектом.

Главное:
- безопасный render;
- нормальная HTML-семантика;
- возможность редактировать;
- изображения имеют отдельные alt/caption.

---

# 24. SUPABASE IMAGES

Так как изображения кейсов уже хранятся в Supabase, использовать существующую архитектуру, если она стабильна.

Для статей:
- отдельный bucket/folder prefix `articles/` желательно;
- уникальные имена файлов;
- не перезаписывать публичный image URL случайно;
- хранить reference URL/path в статье.

Пример структуры:

`articles/{article-id}/cover/...`
`articles/{article-id}/body/...`

Не хранить image bytes внутри записи статьи.

---

# 25. IMAGE ADMIN FIELDS

Для каждого изображения:
- file;
- alt;
- optional caption;
- optional width/height metadata.

Для cover:
- cover image;
- cover alt.

Не разрешать publish статьи с cover без alt, если cover смысловой.

---

# 26. IMAGE PERFORMANCE

Автоматически:
- responsive sizes;
- width/height для предотвращения layout shift;
- lazy loading изображений ниже первого экрана;
- cover/LCP image не lazy-load без необходимости;
- WebP/AVIF через image pipeline/framework, если доступно;
- адекватное сжатие.

Не отдавать многомегабайтные исходники напрямую, если можно оптимизировать.

---

# 27. IMAGE URL / SEO

Filename желательно осмысленный, но это secondary concern.

Alt важнее filename.

Не использовать keyword stuffing в alt.

---

# 28. INTERNAL LINKS

Внутренние ссылки — часть content architecture.

CMS должна позволять:
- выбирать related articles;
- вставлять normal internal links в body.

По возможности автоматически отображать блок:

`Читайте также`

из 2–4 релевантных статей.

На старте related articles могут выбираться вручную.

Позже можно автоматизировать по category/tags.

---

# 29. BREADCRUMBS

Рекомендуется:

Главная → Блог → Название статьи

Добавить обычные ссылки.

Опционально:
BreadcrumbList structured data.

---

# 30. CATEGORY / TAGS

На старте не создавать десятки категорий.

Можно начать с 4–6:
- Web Design
- Redesign
- UX/UI
- Development
- AI & Web
- Business Websites

Tags использовать только если они реально нужны навигации.

Не создавать индексируемые пустые tag pages.

---

# 31. PAGINATION

Если статей немного — простой `/blog`.

Если станет много:
- crawlable pagination;
- не делать бесконечный scroll единственным способом доступа.

---

# 32. PUBLICATION VALIDATION

Перед Publish CMS должна проверять минимум:

- title;
- unique slug;
- excerpt;
- content;
- cover;
- cover alt;
- seo title или fallback;
- meta description или fallback;
- publishedAt;
- author.

Показывать preview:
- article;
- Google title/description approximation;
- social card.

Не блокировать публикацию из-за субъективных SEO «scores».

---

# 33. PUBLISHING WORKFLOW

## Draft
Редактирование.

## Preview
Проверить:
- desktop;
- mobile;
- headings;
- images;
- links;
- metadata.

Preview не индексируется.

## Publish
После нажатия:
- status = published;
- page public;
- `/blog` обновился;
- sitemap содержит URL;
- metadata доступны;
- Article JSON-LD доступен;
- canonical правильный.

---

# 34. UPDATE WORKFLOW

При обновлении:
- URL сохраняется;
- content обновляется;
- `updatedAt` меняется при содержательной правке;
- sitemap `lastmod` обновляется;
- structured data `dateModified` обновляется.

Не создавать новый URL для новой версии одной статьи без причины.

---

# 35. DELETE / UNPUBLISH

Если статья временно снимается:
- определить стратегию.

Если больше не нужна и есть релевантная замена:
→ 301/308 на замену.

Если навсегда удалена и замены нет:
→ 404/410.

Не редиректить все удалённые статьи на homepage.

Удалить URL из sitemap.

---

# 36. SEARCH CONSOLE WORKFLOW

Google Search Console уже подтверждён.

После внедрения блога:

1. Проверить домен property.
2. Открыть `/sitemap.xml`.
3. Убедиться, что blog URLs присутствуют.
4. Отправить sitemap один раз, если текущий sitemap ещё не зарегистрирован.
5. Проверить первую опубликованную статью через URL Inspection.
6. Проверить rendered page.
7. При желании Request indexing для первых важных статей.
8. Далее sitemap обновляется автоматически.

Регулярно смотреть:
- Pages / indexing;
- Search results;
- queries;
- impressions;
- CTR;
- clicks.

---

# 37. GOOGLE INDEXING: ВАЖНО

Публикация статьи не означает мгновенную индексацию.

Система должна обеспечить:
- crawlable URL;
- internal link;
- sitemap presence;
- index allowed;
- canonical;
- нормальный content HTML.

Дальше решение и скорость индексации остаются за поисковиком.

Не внедрять сомнительные «instant indexing hacks».

---

# 38. PERFORMANCE / CORE WEB VITALS

Blog pages не должны заметно ухудшать сайт.

Следить за:
- LCP;
- CLS;
- INP;
- image weight;
- font loading;
- unnecessary JS.

Не превращать статью в тяжёлое SPA без необходимости.

Контент статьи должен быть доступен в initial HTML / server-rendered output.

---

# 39. ACCESSIBILITY

Минимум:
- alt;
- semantic headings;
- adequate contrast;
- keyboard-accessible links/buttons;
- visible focus;
- captions where useful.

Это одновременно улучшает качество сайта и HTML structure.

---

# 40. TRACKING

Для Pinterest использовать UTM.

UTM не должен:
- менять canonical;
- создавать отдельные sitemap entries.

Analytics должна сохранять:
- source;
- medium;
- campaign;
- content.

Пример:
`utm_source=pinterest`
`utm_medium=organic`
`utm_campaign=cheap-website`
`utm_content=checklist`

---

# 41. ADMIN ANALYTICS — OPTIONAL

Позже можно добавить в CMS:
- article views;
- organic visits;
- Pinterest visits;
- top UTM content.

Это не обязательно для первой версии.

---

# 42. TECHNICAL SEO CHECKLIST — ONE TIME

- [ ] Production domain = `https://ksenweb.com`
- [ ] HTTPS
- [ ] old Vercel domain redirects
- [ ] robots.txt
- [ ] dynamic sitemap.xml
- [ ] sitemap listed in robots.txt
- [ ] `/blog`
- [ ] `/blog/[slug]`
- [ ] dynamic metadata
- [ ] canonical
- [ ] OG
- [ ] Article/BlogPosting JSON-LD
- [ ] noindex preview
- [ ] internal links
- [ ] Supabase images
- [ ] image optimization
- [ ] semantic article HTML
- [ ] 404 handling
- [ ] redirects for slug changes

---

# 43. ARTICLE QA — AUTOMATIC / MANUAL

Для каждой статьи проверить:

- [ ] HTTP 200
- [ ] title
- [ ] meta description
- [ ] canonical = clean production URL
- [ ] index allowed
- [ ] H1 = one
- [ ] images load
- [ ] alt present
- [ ] OG image loads
- [ ] structured data valid
- [ ] internal links work
- [ ] page appears in blog index
- [ ] URL appears in sitemap
- [ ] mobile layout valid

---

# 44. WHAT NOT TO DO

Не:
- редактировать sitemap вручную для каждой статьи;
- manually paste JSON-LD в body статьи;
- вводить canonical вручную каждый раз;
- создавать отдельный HTML-файл каждой статьи через IDE;
- хранить drafts в sitemap;
- индексировать preview Vercel URLs;
- генерировать отдельную страницу под каждый Pinterest UTM;
- использовать duplicate content на старом Vercel домене;
- делать все SEO-поля обязательными, если есть безопасный fallback;
- автоматически выдумывать alt из keyword list.

---

# 45. РЕКОМЕНДУЕМАЯ СХЕМА ДАННЫХ

Пример концептуально:

```ts
Article {
  id
  title
  slug
  excerpt
  content
  coverImage
  coverAlt

  seoTitle
  metaDescription
  canonicalOverride
  noindex
  ogTitle
  ogDescription
  ogImage

  authorId
  categoryId
  tags

  status
  publishedAt
  updatedAt
  createdAt
}
```

Адаптировать к существующей базе / Supabase.

Не мигрировать без необходимости существующую архитектуру кейсов.

---

# 46. ARTICLE INPUT FROM CHATGPT

Контентный чат должен передавать минимум:

```yaml
title:
slug:
excerpt:

seo:
  title:
  description:

content:
  h1:
  body:

media:
  cover_brief:
  cover_alt:
  visuals:
    - placement:
      brief:
      alt:

taxonomy:
  category:
  tags:

links:
  internal_suggestions:

pinterest:
  campaign:
```

CMS не обязана импортировать YAML автоматически.

Это просто стабильный формат передачи данных между ChatGPT и админкой.

---

# 47. IMPLEMENTATION RULE FOR IDE / CODEX

Перед изменением кода IDE должна:

1. Изучить существующий стек.
2. Найти текущую admin architecture.
3. Найти Supabase schema и image upload flow.
4. Переиспользовать существующие patterns.
5. Не ломать pages/cases.
6. Добавить blog как отдельный модуль.
7. Проверить production/preview SEO behavior.
8. Не менять глобальный дизайн сайта без задачи.

---

# 48. DEFINITION OF DONE

Блог считается технически готовым, когда можно:

1. Создать draft через admin.
2. Добавить body и Supabase images.
3. Заполнить SEO fields.
4. Preview без индексации.
5. Publish.
6. Открыть public `/blog/[slug]`.
7. Увидеть статью на `/blog`.
8. Увидеть URL в `/sitemap.xml`.
9. Проверить canonical.
10. Проверить OG.
11. Проверить JSON-LD.
12. Проверить mobile.
13. Проверить отсутствие duplicate indexed Vercel version.

---

# 49. ГОТОВАЯ КОМАНДА ДЛЯ IDE

> Используй `KSENWEB_IDE_CMS_TECHNICAL_SEO_RULES.md` как обязательную техническую спецификацию. Сначала проанализируй существующий проект, текущую админку, Supabase-схему и загрузку изображений. Затем реализуй блог и publishing pipeline, переиспользуя существующую архитектуру. Все SEO-механизмы — metadata, canonical, Open Graph, Article/BlogPosting JSON-LD, robots behavior и dynamic sitemap — должны формироваться автоматически. Новая статья должна публиковаться через админку без ручного изменения кода или sitemap. Preview/draft не индексировать. Production URL использовать только на `https://ksenweb.com`.