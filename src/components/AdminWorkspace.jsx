import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Upload, Loader2, ArrowLeft, Pencil, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import contentData from '../contentData';
import { avatarImg } from '../utils/imageUtils';

const SEO_BRAND_SUFFIX = 'Ксения Матвеенко — разработка сайтов/приложений';

function getAboutText(about, legacyText = '') {
  if (typeof about === 'string') {
    try {
      const parsed = JSON.parse(about);
      if (typeof parsed?.text === 'string') return parsed.text.trim();
    } catch {
      return about.trim();
    }
  }
  if (typeof about?.text === 'string') return about.text.trim();
  return typeof legacyText === 'string' ? legacyText.trim() : '';
}

// Helper to convert and resize image to WebP on the fly
function convertToWebP(file, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(webpFile);
            } else {
              reject(new Error('Canvas to blob conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function transliterateToSlug(text) {
  if (!text) return '';
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  return text
    .toLowerCase()
    .split('')
    .map(char => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function cleanArticleHeading(text = '') {
  return text.replace(/\.\s*$/, '').trim();
}

function removeDarkArticleContainers(html) {
  return html.replace(/<div\b([^>]*)>/gi, (match, attributes) => (
    /\b(?:bg-black|bg-(?:zinc|neutral)-(?:8|9)\d{2})\b/.test(attributes) ? '<div>' : match
  ));
}

function preventArticleHangingWords(value = '') {
  return value.replace(
    /(^|[\s(«—–-])(и|а|но|или|либо|да|в|во|к|ко|с|со|у|о|об|от|до|за|из|по|на|над|под|при|для|без|про|через)\s+/giu,
    '$1$2\u00A0'
  );
}

function createAdminArticlePreview(rawContent) {
  const previewDocument = new DOMParser().parseFromString(autoFormatArticleText(rawContent), 'text/html');
  previewDocument.body.querySelectorAll('div').forEach((container) => {
    if (/\b(?:bg-black|bg-(?:zinc|neutral)-(?:8|9)\d{2})\b/.test(container.className)) {
      container.replaceWith(...Array.from(container.childNodes));
    }
  });
  previewDocument.body.querySelectorAll('p').forEach((paragraph) => {
    if (!paragraph.textContent.trim() && !paragraph.querySelector('img, br')) paragraph.remove();
  });

  const usedIds = new Set();
  const headings = Array.from(previewDocument.body.querySelectorAll('h2')).map((heading, index) => {
    const title = preventArticleHangingWords(cleanArticleHeading(heading.textContent.replace(/\s+/g, ' ').trim()));
    heading.textContent = title;
    const baseId = `preview-section-${index + 1}`;
    let id = baseId;
    let duplicate = 2;
    while (usedIds.has(id)) id = `${baseId}-${duplicate++}`;
    usedIds.add(id);
    heading.id = id;
    return { id, title };
  }).filter((heading) => heading.title);

  const textWalker = previewDocument.createTreeWalker(previewDocument.body, 4);
  const textNodes = [];
  let textNode;
  while ((textNode = textWalker.nextNode())) textNodes.push(textNode);
  textNodes.forEach((node) => {
    if (!['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) {
      node.nodeValue = preventArticleHangingWords(node.nodeValue);
    }
  });

  return { html: previewDocument.body.innerHTML, headings };
}

function formatArticlePreviewDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function createArticleImageAlt({ title = '', caption = '', type = 'image' }) {
  const cleanTitle = cleanArticleHeading(title.trim());
  const cleanCaption = caption.trim();
  if (cleanCaption) return cleanCaption;
  if (cleanTitle) {
    return type === 'cover'
      ? `Обложка статьи «${cleanTitle}»`
      : `Иллюстрация к статье «${cleanTitle}»`;
  }
  return type === 'cover' ? 'Обложка статьи' : 'Иллюстрация к статье';
}

function buildArticleSeoFields({ title, excerpt, content, slug, coverImage }) {
  const sourceDocument = new DOMParser().parseFromString(autoFormatArticleText(content), 'text/html');
  const firstHeading = sourceDocument.body.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const articleText = sourceDocument.body.textContent.replace(/\s+/g, ' ').trim();
  const descriptionSource = excerpt.trim() || [title.trim(), firstHeading, articleText].filter(Boolean).join('. ');
  const description = descriptionSource.length > 160
    ? `${descriptionSource.slice(0, 157).replace(/\s+\S*$/, '').trim()}...`
    : descriptionSource;
  const seoTitle = `${cleanArticleHeading(title.trim()) || firstHeading || 'Статья'} | ${SEO_BRAND_SUFFIX}`;

  return {
    seoTitle,
    metaDescription: description,
    canonical: slug.trim() ? `https://ksenweb.com/blog/${slug.trim().toLowerCase()}` : '',
    ogTitle: seoTitle,
    ogDescription: description,
    ogImage: coverImage.trim()
  };
}

// 1-Click Auto-Formatter logic for option 2
function autoFormatArticleText(rawText) {
  if (!rawText) return '';
  
  // Replace JSX className with HTML class and clean up inline Mso styles from Word
  let text = removeDarkArticleContainers(rawText.replace(/className=/g, 'class=').replace(/style="[^"]*"/gi, ''));
  // A figure is a multi-line semantic block. Preserve it before line-by-line
  // formatting so its <img> and optional <figcaption> are never wrapped in <p>.
  const figures = [];
  text = text.replace(/<figure\b[\s\S]*?<\/figure>/gi, (figure) => {
    const token = `@@ARTICLE_FIGURE_${figures.length}@@`;
    figures.push(figure);
    return `\n${token}\n`;
  });

  const lines = text.split(/\r?\n/).map(l => l.trim());
  let formattedBlocks = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      formattedBlocks.push(`<ul>\n${listItems.map(item => `  <li>${item}</li>`).join('\n')}\n</ul>`);
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) {
      flushList();
      continue;
    }

    const figureToken = /^@@ARTICLE_FIGURE_(\d+)@@$/.exec(line);
    if (figureToken) {
      flushList();
      formattedBlocks.push(figures[Number(figureToken[1])]);
      continue;
    }

    // Check if line is already an HTML tag like <div>, <figure>, <blockquote>, <img />
    if (
      line.startsWith('<div') ||
      line.startsWith('<figure') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<img')
    ) {
      flushList();
      formattedBlocks.push(line);
      continue;
    }

    // Check if line is H2 (e.g. "1. Название...", "Ошибка 1...", "Раздел 1:", or <h2>...</h2>)
    const isH2Pattern = /^(\d+[\.\)]\s+[^\n]+|ошибка\s+\d+[\.\:]?\s+[^\n]+|раздел\s+\d+[\.\:]?\s+[^\n]+|что в итоге[^\n]*|вывод[^\n]*)/i;
    const isExplicitH2 = /^<h2[^>]*>(.*?)<\/h2>/i;

    if (isExplicitH2.test(line)) {
      flushList();
      formattedBlocks.push(line);
      continue;
    }

    if (isH2Pattern.test(line) && line.length < 130) {
      flushList();
      const cleanText = cleanArticleHeading(line.replace(/<\/?h2[^>]*>/gi, ''));
      formattedBlocks.push(`<h2>${cleanText}</h2>`);
      continue;
    }

    // Check if line is H3 (e.g. "1.1. ...", "а) ...", or short subtitle)
    const isH3Pattern = /^([a-яa-zA-ЯA-Z]\)\s+[^\n]+|\d+\.\d+\s+[^\n]+)/i;
    const isExplicitH3 = /^<h3[^>]*>(.*?)<\/h3>/i;

    if (isExplicitH3.test(line)) {
      flushList();
      formattedBlocks.push(line);
      continue;
    }

    if (isH3Pattern.test(line) && line.length < 100) {
      flushList();
      const cleanText = cleanArticleHeading(line.replace(/<\/?h3[^>]*>/gi, ''));
      formattedBlocks.push(`<h3>${cleanText}</h3>`);
      continue;
    }

    // Check if line is a list item (starts with -, •, *, or bullet)
    const isListItem = /^[•\-\*]\s+(.*)/.exec(line);
    if (isListItem) {
      inList = true;
      listItems.push(isListItem[1]);
      continue;
    } else {
      flushList();
    }

    // Check if line is Callout / Что изменить
    if (/^что изменить[:\s]*/i.test(line)) {
      const content = line.replace(/^что изменить[:\s]*/i, '').trim();
      formattedBlocks.push(`\n<div class="article-callout bg-zinc-50 border border-zinc-200/80 rounded-[4px] p-4 sm:p-5 my-6">\n  <div class="text-[11px] font-mono font-medium text-[#FF5B23] uppercase tracking-wider mb-2">Что изменить</div>\n  <p class="text-zinc-700 text-sm mb-0">${content || 'Рекомендация...'}</p>\n</div>\n`);
      continue;
    }

    // Normal paragraph line
    const cleanP = line.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '');
    formattedBlocks.push(`<p>${cleanP}</p>`);
  }

  flushList();
  return formattedBlocks.join('\n\n');
}

// Simple Image Upload component for clean modular state
function ImageUpload({ label, value, onChange, onError, pathPrefix = 'case' }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Auto-convert to WebP and resize on the fly
      const processedFile = await convertToWebP(file, 1600, 0.82);
      const fileName = `${pathPrefix}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.webp`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('case-images')
        .upload(filePath, processedFile, {
          cacheControl: '31536000',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      if (onError) {
        onError('Ошибка при\u00a0загрузке изображения: ' + err.message);
      } else {
        alert('Ошибка при\u00a0загрузке изображения: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 border border-zinc-200 rounded-sm overflow-hidden bg-neutral-50 shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-200"
            >
              Удалить
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 border border-dashed border-zinc-300 rounded-sm flex items-center justify-center bg-zinc-50 shrink-0 text-zinc-400 text-xs">
            Нет фото
          </div>
        )}
        
        <div className="flex-1">
          {uploading ? (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Загрузка в Storage...</span>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 hover:border-black rounded-sm text-xs font-medium cursor-pointer transition-colors bg-white shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Заменить изображение' : 'Выбрать файл'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {value && (
            <span className="block text-[10px] text-zinc-400 mt-1 truncate max-w-xs md:max-w-md">
              URL: {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminWorkspace() {
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    const previousContent = robots?.getAttribute('content');

    if (robots) robots.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (robots && previousContent) robots.setAttribute('content', previousContent);
    };
  }, []);

  // Cases list state (left panel)
  const [casesList, setCasesList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Edit Mode state
  const [editingId, setEditingId] = useState(null);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Form states (right panel)
  const [slug, setSlug] = useState('');
  const [isInDevelopment, setIsInDevelopment] = useState(false);
  const [isAiConcept, setIsAiConcept] = useState(false);
  const [isDesktopOnly, setIsDesktopOnly] = useState(false);
  const [demoUrl, setDemoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Blog Categories state
  const defaultBlogCategories = [
    { id: '1', name: 'Дизайн & UX', slug: 'design-ux', description: 'Разборы интерфейсов, верстки и типографики' },
    { id: '2', name: 'Tilda & Код', slug: 'tilda-dev', description: 'Инструкции и решения по Tilda, Zero Block и React' },
    { id: '3', name: 'ИИ & Автоматизация', slug: 'ai-tech', description: 'Применение нейросетей, vibe-coding и быстрой разработки' },
    { id: '4', name: 'Бизнес-сайты', slug: 'business-sites', description: 'Оптимизация конверсии, первого экрана и продаж' }
  ];

  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const cached = localStorage.getItem('site_blog_categories');
      return cached ? JSON.parse(cached) : defaultBlogCategories;
    } catch (e) {
      return defaultBlogCategories;
    }
  });

  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catToDelete, setCatToDelete] = useState(null);
  const [cardTitle, setCardTitle] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [cardTags, setCardTags] = useState('');
  
  // Metadata state
  const [sphere, setSphere] = useState('');
  const [type, setType] = useState('');
  const [stack, setStack] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [shortBio, setShortBio] = useState('');

  // Task & Solution
  const [task, setTask] = useState('');
  const [solution, setSolution] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  // Visibility Toggles aligned to current structures
  const [visibility, setVisibility] = useState({
    process: true,
    challenge: true,
    desktop: true,
    mobile: true,
    panorama: true,
    outro: true,
    custom: true
  });

  // Dynamic arrays
  const [processSteps, setProcessSteps] = useState([]);
  const [desktopFeatures, setDesktopFeatures] = useState([]);
  const [mobileFeatures, setMobileFeatures] = useState([]);
  
  // Panorama state
  const [panorama, setPanorama] = useState([]);

  // Outro State
  const [outroImages, setOutroImages] = useState([]);

  // Custom Blocks state
  const [customBlocks, setCustomBlocks] = useState([]);

  // Submission load state
  const [publishing, setPublishing] = useState(false);

  // Tab control state
  const [activeTab, setActiveTab] = useState('cases');

  // Other projects states
  const [otherProjects, setOtherProjects] = useState([]);
  const [loadingOther, setLoadingOther] = useState(true);
  const [otherProjToDelete, setOtherProjToDelete] = useState(null);

  // Other project edit state
  const [editingOtherId, setEditingOtherId] = useState(null);
  const [otherNum, setOtherNum] = useState('');
  const [otherTitle, setOtherTitle] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [otherLinkUrl, setOtherLinkUrl] = useState('');
  const [savingOther, setSavingOther] = useState(false);

  // Contact settings state
  const [contactPhone, setContactPhone] = useState(contentData.contacts?.phone || '+375 25 914 09 59');
  const [contactEmail, setContactEmail] = useState(contentData.contacts?.email || 'verameeva77@mail.ru');
  const [contactTelegramUrl, setContactTelegramUrl] = useState(contentData.sidebar?.socialLinks?.telegram || 'https://t.me/ksen_web');
  const [contactMaxUrl, setContactMaxUrl] = useState(contentData.sidebar?.socialLinks?.max || 'https://max.ru/u/f9LHodD0cOLc1tgODx5Hvuln4-rgmfFJqN4Q5OLgnaxmSTG2FxgU9ZVRnGg');
  const [savingContacts, setSavingContacts] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // Item to delete state
  const [itemToDelete, setItemToDelete] = useState(null);

  // Blog Articles state
  const [articlesList, setArticlesList] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleFormSection, setArticleFormSection] = useState('content'); // 'content', 'media', 'seo', 'publishing'
  const [showArticlePreview, setShowArticlePreview] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);

  // Article form fields
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleCoverImage, setArticleCoverImage] = useState('');
  const [articleCoverAlt, setArticleCoverAlt] = useState('');
  const [articleSeoTitle, setArticleSeoTitle] = useState('');
  const [articleMetaDescription, setArticleMetaDescription] = useState('');
  const [articleCanonicalOverride, setArticleCanonicalOverride] = useState('');
  const [articleNoindex, setArticleNoindex] = useState(false);
  const [articleOgTitle, setArticleOgTitle] = useState('');
  const [articleOgDescription, setArticleOgDescription] = useState('');
  const [articleOgImage, setArticleOgImage] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('Ксения Матвеенко');
  const [articleCategory, setArticleCategory] = useState('Дизайн & UX');
  const [articleTags, setArticleTags] = useState('');
  const [articleStatus, setArticleStatus] = useState('published');
  const [articlePublishedAt, setArticlePublishedAt] = useState(new Date().toISOString());
  const [articleReadingTime, setArticleReadingTime] = useState('5 мин');
  const [inlineImageAlt, setInlineImageAlt] = useState('');
  const [inlineImageCaption, setInlineImageCaption] = useState('');
  const articlePreview = useMemo(() => createAdminArticlePreview(articleContent), [articleContent]);

  useEffect(() => {
    if (articleTitle.trim()) {
      setArticleCoverAlt((current) => current || createArticleImageAlt({ title: articleTitle, type: 'cover' }));
    }
  }, [articleTitle]);

  const fillArticleSeoFields = () => {
    const generated = buildArticleSeoFields({
      title: articleTitle,
      excerpt: articleExcerpt,
      content: articleContent,
      slug: articleSlug,
      coverImage: articleCoverImage
    });
    setArticleSeoTitle((current) => (!current || /\|\s*KSENWEB\s*$/i.test(current) ? generated.seoTitle : current));
    setArticleMetaDescription((current) => current || generated.metaDescription);
    setArticleCanonicalOverride((current) => current || generated.canonical);
    setArticleOgTitle((current) => (!current || /\|\s*KSENWEB\s*$/i.test(current) ? generated.ogTitle : current));
    setArticleOgDescription((current) => current || generated.ogDescription);
    setArticleOgImage((current) => current || generated.ogImage);
  };

  useEffect(() => {
    const cached = localStorage.getItem('site_contacts_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.phone) setContactPhone(parsed.phone);
        if (parsed.email) setContactEmail(parsed.email);
        if (parsed.telegramUrl) setContactTelegramUrl(parsed.telegramUrl);
        if (parsed.maxUrl) setContactMaxUrl(parsed.maxUrl);
      } catch (e) {}
    }
  }, []);

  const handleSaveContacts = async (e) => {
    e.preventDefault();
    setSavingContacts(true);
    try {
      const contactObj = {
        phone: contactPhone,
        email: contactEmail,
        telegramUrl: contactTelegramUrl,
        maxUrl: contactMaxUrl,
      };

      try {
        await supabase
          .from('site_settings')
          .upsert({ id: 'contacts', data: contactObj });
      } catch (err) {
        console.warn('Supabase site_settings upsert note:', err);
      }

      localStorage.setItem('site_contacts_settings', JSON.stringify(contactObj));

      contentData.contacts.phone = contactPhone;
      contentData.contacts.email = contactEmail;
      if (contentData.contacts.messengers) {
        if (contentData.contacts.messengers.telegram) contentData.contacts.messengers.telegram.url = contactTelegramUrl;
        if (contentData.contacts.messengers.max) contentData.contacts.messengers.max.url = contactMaxUrl;
      }
      if (contentData.sidebar && contentData.sidebar.socialLinks) {
        contentData.sidebar.socialLinks.telegram = contactTelegramUrl;
        contentData.sidebar.socialLinks.max = contactMaxUrl;
      }

      setToast({ show: true, message: 'Контактные данные и ссылки успешно сохранены!', type: 'success' });
    } catch (err) {
      console.error('Error saving contacts:', err);
      setToast({ show: true, message: 'Ошибка при сохранении: ' + err.message, type: 'error' });
    } finally {
      setSavingContacts(false);
    }
  };

  // Auto dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Load existing cases sorted by sort_order
  const fetchCases = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, slug, title, card_title, sort_order')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCasesList(data || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const seedOtherProjects = async () => {
    try {
      const defaultProjects = [
        {
          num: "01",
          title: "Интернет-магазин одежды FORME",
          description: "Онлайн-магазин одежды с\u00a0фокусом на\u00a0форму, посадку и\u00a0визуальную чистоту. Проект ориентирован на\u00a0аудиторию, для\u00a0которой важны не тренды «на\u00a0один сезон», а\u00a0силуэт, качество и\u00a0ощущение собранного образа.",
          link_url: "",
          sort_order: 0
        },
        {
          num: "02",
          title: "Типография цифровых решений",
          description: "Многостраничный сайт. Основной фокус — B2B-клиенты, для\u00a0которых важны скорость, качество, точная цветопередача и\u00a0надёжность подрядчика.",
          link_url: "",
          sort_order: 1
        },
        {
          num: "03",
          title: "Корпоративный сайт косметологического кабинета",
          description: "Косметологический кабинет для\u00a0девушек с\u00a0проблемной, чувствительной и\u00a0реактивной кожей. Формат — частный специалист. Сайт должен был работать как\u00a0система: объяснять подход специалиста, показывать логику работы с\u00a0кожей и\u00a0формировать ощущение безопасного пространства.",
          link_url: "",
          sort_order: 2
        },
        {
          num: "04",
          title: "Nempl — автоматизация бизнеса",
          description: "Nempl — компания, занимающаяся внедрением ИИ-сотрудников для\u00a0автоматизации продаж и\u00a0бизнес-процессов. Основной продукт — ИИ-ассистенты для\u00a0отделов продаж, поддержки и\u00a0коммуникаций, интегрируемые с\u00a0CRM и\u00a0мессенджерами.",
          link_url: "",
          sort_order: 3
        }
      ];

      const { error } = await supabase
        .from('other_projects')
        .insert(defaultProjects);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error seeding other projects:', err);
    }
  };

  const fetchOtherProjects = async () => {
    setLoadingOther(true);
    try {
      const { data, error } = await supabase
        .from('other_projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      
      if (data && data.length > 0) {
        setOtherProjects(data);
      } else {
        await seedOtherProjects();
        const { data: refetched } = await supabase
          .from('other_projects')
          .select('*')
          .order('sort_order', { ascending: true });
        setOtherProjects(refetched || []);
      }
    } catch (err) {
      console.error('Error fetching other projects:', err);
    } finally {
      setLoadingOther(false);
    }
  };

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticlesList(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setArticlesList([]);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchOtherProjects();
    fetchArticles();
  }, []);

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleSlug('');
    setArticleExcerpt('');
    setArticleContent('');
    setArticleCoverImage('');
    setArticleCoverAlt('');
    setArticleSeoTitle('');
    setArticleMetaDescription('');
    setArticleCanonicalOverride('');
    setArticleNoindex(false);
    setArticleOgTitle('');
    setArticleOgDescription('');
    setArticleOgImage('');
    setArticleAuthor('Ксения Матвеенко');
    setArticleCategory('Дизайн & UX');
    setArticleTags('');
    setArticleStatus('published');
    setArticlePublishedAt(new Date().toISOString());
    setArticleReadingTime('5 мин');
    setInlineImageAlt('');
    setInlineImageCaption('');
    setArticleFormSection('content');
  };

  const handleStartEditArticle = (art) => {
    setEditingArticleId(art.id || art.slug);
    setArticleTitle(art.title || '');
    setArticleSlug(art.slug || '');
    setArticleExcerpt(art.excerpt || '');
    setArticleContent(art.content || '');
    setArticleCoverImage(art.cover_image || art.coverImage || '');
    setArticleCoverAlt(art.cover_alt || art.coverAlt || '');
    setArticleSeoTitle(art.seo_title || art.seoTitle || '');
    setArticleMetaDescription(art.meta_description || art.metaDescription || '');
    setArticleCanonicalOverride(art.canonical_override || art.canonicalOverride || '');
    setArticleNoindex(!!art.noindex);
    setArticleOgTitle(art.og_title || art.ogTitle || '');
    setArticleOgDescription(art.og_description || art.ogDescription || '');
    setArticleOgImage(art.og_image || art.ogImage || '');
    setArticleAuthor(art.author || 'Ксения Матвеенко');
    setArticleCategory(art.category || 'Дизайн & UX');
    setArticleTags(Array.isArray(art.tags) ? art.tags.join(', ') : (art.tags || ''));
    setArticleStatus(art.status || 'published');
    setArticlePublishedAt(art.published_at || art.publishedAt || new Date().toISOString());
    setArticleReadingTime(art.reading_time || art.readingTime || '5 мин');
    setArticleFormSection('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveArticle = async (e) => {
    if (e) e.preventDefault();
    if (!articleTitle.trim()) {
      setToast({ show: true, message: 'Укажите заголовок статьи (Title)', type: 'error' });
      return;
    }
    if (!articleSlug.trim()) {
      setToast({ show: true, message: 'Укажите уникальный URL статьи (Slug)', type: 'error' });
      return;
    }
    if (!articleExcerpt.trim()) {
      setToast({ show: true, message: 'Заполните краткое описание статьи (Excerpt)', type: 'error' });
      return;
    }
    if (!articleContent.trim()) {
      setToast({ show: true, message: 'Заполните текст статьи (Content)', type: 'error' });
      return;
    }

    setSavingArticle(true);
    try {
      const formattedTags = articleTags ? articleTags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const formattedContent = autoFormatArticleText(articleContent);

      const payload = {
        title: articleTitle,
        slug: articleSlug.toLowerCase().trim(),
        excerpt: articleExcerpt,
        content: formattedContent,
        cover_image: articleCoverImage,
        cover_alt: articleCoverAlt,
        seo_title: articleSeoTitle,
        meta_description: articleMetaDescription,
        canonical_override: articleCanonicalOverride,
        noindex: articleNoindex,
        og_title: articleOgTitle,
        og_description: articleOgDescription,
        og_image: articleOgImage,
        author: articleAuthor,
        category: articleCategory,
        tags: formattedTags,
        status: articleStatus,
        published_at: articlePublishedAt,
        updated_at: new Date().toISOString(),
        reading_time: articleReadingTime
      };

      const request = editingArticleId && typeof editingArticleId !== 'string'
        ? supabase.from('articles').update(payload).eq('id', editingArticleId)
        : supabase.from('articles').insert([payload]);
      const { error } = await request;
      if (error) throw error;

      setToast({ show: true, message: '✨ Статья успешно сохранена и обновлена!', type: 'success' });
      resetArticleForm();
      fetchArticles();
    } catch (err) {
      console.error('Save article error:', err);
      setToast({ show: true, message: 'Ошибка при сохранении: ' + err.message, type: 'error' });
    } finally {
      setSavingArticle(false);
    }
  };

  // Category CRUD Handlers
  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
  };

  const handleStartEditCat = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name || '');
    setCatSlug(cat.slug || '');
    setCatDescription(cat.description || '');
  };

  const handleSaveCategory = (e) => {
    if (e) e.preventDefault();
    if (!catName.trim()) {
      setToast({ show: true, message: 'Укажите название категории', type: 'error' });
      return;
    }

    const generatedSlug = catSlug.trim() ? catSlug.trim().toLowerCase() : transliterateToSlug(catName);
    const newCat = {
      id: editingCatId || `cat-${Date.now()}`,
      name: catName.trim(),
      slug: generatedSlug,
      description: catDescription.trim()
    };

    let updatedList = [...categoriesList];
    if (editingCatId) {
      updatedList = updatedList.map(c => c.id === editingCatId ? newCat : c);
    } else {
      updatedList.push(newCat);
    }

    setCategoriesList(updatedList);
    try {
      localStorage.setItem('site_blog_categories', JSON.stringify(updatedList));
    } catch (e) {}

    setToast({ show: true, message: editingCatId ? 'Категория обновлена!' : 'Новая категория добавлена!', type: 'success' });
    resetCatForm();
  };

  const handleDeleteCategory = (catId) => {
    const updated = categoriesList.filter(c => c.id !== catId);
    setCategoriesList(updated);
    try {
      localStorage.setItem('site_blog_categories', JSON.stringify(updated));
    } catch (e) {}
    setToast({ show: true, message: 'Категория удалена', type: 'info' });
  };

  const handleDeleteArticle = async (art) => {
    try {
      if (art.id && typeof art.id !== 'string') {
        const { error } = await supabase.from('articles').delete().eq('id', art.id);
        if (error) throw error;
      }
      setToast({ show: true, message: `Статья "${art.title}" удалена.`, type: 'success' });
      if (editingArticleId === art.id || editingArticleId === art.slug) {
        resetArticleForm();
      }
      fetchArticles();
    } catch (err) {
      console.error('Delete article error:', err);
      setToast({ show: true, message: 'Ошибка при удалении: ' + err.message, type: 'error' });
    }
  };

  // Deletion handler
  const handleDeleteCase = async (id, slug) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ show: true, message: `Кейс ${slug} успешно удален.`, type: 'success' });
      if (editingId === id) {
        resetForm();
      }
      fetchCases();
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0удалении: ' + err.message, type: 'error' });
    }
  };

  // Re-ordering logic (swapping sort_order)
  const handleMoveCase = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= casesList.length) return;

    const currentItem = casesList[index];
    const targetItem = casesList[targetIndex];

    try {
      let currentSort = currentItem.sort_order !== null && currentItem.sort_order !== undefined ? currentItem.sort_order : 0;
      let targetSort = targetItem.sort_order !== null && targetItem.sort_order !== undefined ? targetItem.sort_order : 0;

      if (currentSort === targetSort) {
        if (direction === 'up') {
          currentSort = targetSort - 1;
        } else {
          currentSort = targetSort + 1;
        }
      } else {
        const temp = currentSort;
        currentSort = targetSort;
        targetSort = temp;
      }

      // Update currentItem sort_order
      const { error: err1 } = await supabase
        .from('cases')
        .update({ sort_order: currentSort })
        .eq('id', currentItem.id);

      if (err1) throw err1;

      // Update targetItem sort_order
      const { error: err2 } = await supabase
        .from('cases')
        .update({ sort_order: targetSort })
        .eq('id', targetItem.id);

      if (err2) throw err2;

      fetchCases();
    } catch (err) {
      console.error('Error swapping positions:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перемещении: ' + err.message, type: 'error' });
    }
  };

  // Edit Mode starter
  const handleStartEdit = async (item) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', item.id)
        .single();

      const isAi = !!data.is_ai_concept || !!data.isAiConcept;
      if (isAi) {
        setActiveTab('ai');
      } else {
        setActiveTab('cases');
      }

      setEditingId(data.id);
      setSlug(data.slug || '');
      setIsInDevelopment(!!data.is_in_development);
      setIsAiConcept(isAi);
      setIsDesktopOnly(!!data.is_desktop_only || !!data.isDesktopOnly);
      setDemoUrl(data.demo_url || data.demoUrl || '');
      setDescription(data.description || '');
      setTitle(data.title || data.card_title || '');
      setSubtitle(data.subtitle || '');
      setHeroImage(data.heroImage || '');

      // Load Preview Card fields
      setCardTitle(data.card_title || data.title || '');
      setCardImage(data.card_image || '');
      setCardTags(Array.isArray(data.card_tags) ? data.card_tags.join(', ') : (data.card_tags || ''));
      
      // Metadata
      setSphere(data.meta?.sphere || '');
      setType(data.meta?.type || '');
      setStack(data.meta?.stack || '');
      setYear(data.meta?.year || '');
      setShortBio(getAboutText(data.about, data.about_text || data.subtitle));

      // Task & Solution
      setTask(data.challenge?.task || '');
      setSolution(data.challenge?.solution || '');
      setLiveUrl(data.challenge?.liveUrl || '');

      // Visibility toggles
      setVisibility({
        process: data.visibility?.process !== false,
        challenge: data.visibility?.challenge !== false,
        desktop: data.visibility?.desktop !== false,
        mobile: data.visibility?.mobile !== false,
        panorama: data.visibility?.panorama !== false,
        outro: data.visibility?.outro !== false,
        custom: data.visibility?.custom !== false
      });

      // Process steps formatting (tags as string for inputs)
      const formattedSteps = (data.process || []).map(step => ({
        ...step,
        tags: Array.isArray(step.tags) ? step.tags.join(', ') : (step.tags || '')
      }));
      setProcessSteps(formattedSteps);

      // Arrays and graphics
      setDesktopFeatures(data.features || []);
      setMobileFeatures(data.mobile_features || []);
      setPanorama(data.panorama_images || []);
      const fetchedOutro = data.outro?.images || (data.outro?.image ? [data.outro.image] : []);
      setOutroImages(fetchedOutro);
      setCustomBlocks(data.custom_blocks || []);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error loading case for edit:', err);
      setToast({ show: true, message: 'Не удалось загрузить данные кейса: ' + err.message, type: 'error' });
    }
  };

  const smoothScrollToElement = (elementId) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Drag and drop event handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reorderedList = [...casesList];
    const [draggedItem] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIndex, 0, draggedItem);

    try {
      setLoadingList(true);
      const updatePromises = reorderedList.map((item, idx) => {
        return supabase
          .from('cases')
          .update({ sort_order: idx })
          .eq('id', item.id);
      });

      const results = await Promise.all(updatePromises);
      const firstError = results.find(r => r.error);
      if (firstError) throw firstError.error;

      setToast({ show: true, message: 'Порядок кейсов успешно изменен!', type: 'success' });
      fetchCases();
    } catch (err) {
      console.error('Error updating positions after drag & drop:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перетаскивании: ' + err.message, type: 'error' });
    } finally {
      setDraggedIndex(null);
      setLoadingList(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Add items dynamically to arrays
  const addProcessStep = () => {
    const nextIdx = processSteps.length;
    setProcessSteps([...processSteps, { title: '', duration: '', tags: '' }]);
    smoothScrollToElement(`process-step-${nextIdx}`);
  };

  const removeProcessStep = (index) => {
    setProcessSteps(processSteps.filter((_, idx) => idx !== index));
  };

  const updateProcessStep = (index, field, val) => {
    const next = [...processSteps];
    next[index][field] = val;
    setProcessSteps(next);
  };

  const addDesktopFeature = () => {
    const nextIdx = desktopFeatures.length;
    setDesktopFeatures([...desktopFeatures, { title: '', text: '', image: '' }]);
    smoothScrollToElement(`desktop-feature-${nextIdx}`);
  };

  const removeDesktopFeature = (index) => {
    setDesktopFeatures(desktopFeatures.filter((_, idx) => idx !== index));
  };

  const updateDesktopFeature = (index, field, val) => {
    const next = [...desktopFeatures];
    next[index][field] = val;
    setDesktopFeatures(next);
  };

  const addMobileFeature = () => {
    const nextIdx = mobileFeatures.length;
    setMobileFeatures([...mobileFeatures, { title: '', label: '', image: '' }]);
    smoothScrollToElement(`mobile-feature-${nextIdx}`);
  };

  const removeMobileFeature = (index) => {
    setMobileFeatures(mobileFeatures.filter((_, idx) => idx !== index));
  };

  const updateMobileFeature = (index, field, val) => {
    const next = [...mobileFeatures];
    next[index][field] = val;
    setMobileFeatures(next);
  };

  const addPanoramaImage = () => {
    const nextIdx = panorama.length;
    setPanorama([...panorama, '']);
    smoothScrollToElement(`panorama-image-${nextIdx}`);
  };

  const removePanoramaImage = (index) => {
    setPanorama(panorama.filter((_, idx) => idx !== index));
  };

  const updatePanoramaImage = (index, val) => {
    const next = [...panorama];
    next[index] = val;
    setPanorama(next);
  };

  const addCustomBlock = () => {
    const nextIdx = customBlocks.length;
    setCustomBlocks([...customBlocks, { type: 'text', content: '' }]);
    smoothScrollToElement(`custom-block-${nextIdx}`);
  };

  const removeCustomBlock = (index) => {
    setCustomBlocks(customBlocks.filter((_, idx) => idx !== index));
  };

  const updateCustomBlock = (index, field, val) => {
    const next = [...customBlocks];
    next[index][field] = val;
    setCustomBlocks(next);
  };

  // --- Other Projects CRUD Operations ---
  const resetOtherForm = () => {
    setEditingOtherId(null);
    setOtherNum('');
    setOtherTitle('');
    setOtherDescription('');
    setOtherLinkUrl('');
  };

  const handleStartEditOther = (proj) => {
    setEditingOtherId(proj.id);
    setOtherNum(proj.num || '');
    setOtherTitle(proj.title || '');
    setOtherDescription(proj.description || '');
    setOtherLinkUrl(proj.link_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishOtherProject = async (e) => {
    e.preventDefault();
    if (!otherNum || !otherTitle || !otherDescription) {
      setToast({ show: true, message: 'Пожалуйста, заполните Номер, Название и\u00a0Описание', type: 'error' });
      return;
    }

    setSavingOther(true);
    try {
      const payload = {
        num: otherNum,
        title: otherTitle,
        description: otherDescription,
        link_url: otherLinkUrl || null
      };

      if (editingOtherId) {
        // Update existing project
        const { error } = await supabase
          .from('other_projects')
          .update(payload)
          .eq('id', editingOtherId);
        if (error) throw error;
        setToast({ show: true, message: 'Проект успешно сохранен!', type: 'success' });
      } else {
        // Insert new project
        let nextSort = 0;
        if (otherProjects.length > 0) {
          const orders = otherProjects.map(p => p.sort_order).filter(o => o !== null && o !== undefined);
          if (orders.length > 0) {
            nextSort = Math.max(...orders) + 1;
          }
        }
        payload.sort_order = nextSort;

        const { error } = await supabase
          .from('other_projects')
          .insert([payload]);
        if (error) throw error;
        setToast({ show: true, message: 'Проект успешно добавлен в\u00a0базу!', type: 'success' });
      }
      resetOtherForm();
      fetchOtherProjects();
    } catch (err) {
      console.error('Error saving other project:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0сохранении: ' + err.message, type: 'error' });
    } finally {
      setSavingOther(false);
    }
  };

  const handleDeleteOtherProject = async (id) => {
    try {
      const { error } = await supabase
        .from('other_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setToast({ show: true, message: 'Проект успешно удален из\u00a0базы!', type: 'success' });
      if (editingOtherId === id) {
        resetOtherForm();
      }
      fetchOtherProjects();
    } catch (err) {
      console.error('Error deleting other project:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0удалении: ' + err.message, type: 'error' });
    }
  };

  const handleMoveOtherProject = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= otherProjects.length) return;

    const currentItem = otherProjects[index];
    const targetItem = otherProjects[targetIdx];

    try {
      const tempSort = currentItem.sort_order;
      
      const { error: err1 } = await supabase
        .from('other_projects')
        .update({ sort_order: targetItem.sort_order })
        .eq('id', currentItem.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('other_projects')
        .update({ sort_order: tempSort })
        .eq('id', targetItem.id);
      if (err2) throw err2;

      setToast({ show: true, message: 'Порядок успешно изменен!', type: 'success' });
      fetchOtherProjects();
    } catch (err) {
      console.error('Error changing order:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перемещении: ' + err.message, type: 'error' });
    }
  };

  // Reset form states
  const resetForm = () => {
    setEditingId(null);
    setSlug('');
    setIsInDevelopment(false);
    setIsAiConcept(activeTab === 'ai');
    setIsDesktopOnly(false);
    setDemoUrl('');
    setDescription('');
    setTitle('');
    setSubtitle('');
    setHeroImage('');
    setCardTitle('');
    setCardImage('');
    setCardTags('');
    setSphere('');
    setType('');
    setStack('');
    setYear(new Date().getFullYear().toString());
    setShortBio('');
    setTask('');
    setSolution('');
    setLiveUrl('');
    setProcessSteps([]);
    setDesktopFeatures([]);
    setMobileFeatures([]);
    setPanorama([]);
    setOutroImages([]);
    setCustomBlocks([]);
    setVisibility({
      process: true,
      challenge: true,
      desktop: true,
      mobile: true,
      panorama: true,
      outro: true,
      custom: true
    });
  };

  // Publish / Save Handler
  const handlePublishCase = async (e) => {
    e.preventDefault();
    if (!slug) {
      setToast({ show: true, message: 'Пожалуйста, укажите URL-адрес роута (slug)', type: 'error' });
      return;
    }

    setPublishing(true);
    try {
      // Split card tags by comma
      const formattedCardTags = cardTags ? cardTags.split(',').map(t => t.trim()).filter(Boolean) : [];

      let payload;
      if (activeTab === 'ai' || isAiConcept) {
        payload = {
          slug,
          is_in_development: isInDevelopment,
          is_ai_concept: true,
          is_desktop_only: isDesktopOnly,
          demo_url: demoUrl || '/demos/apex-detailing/index.html',
          description: description || subtitle,
          title: title || cardTitle,
          card_title: cardTitle || title,
          card_image: cardImage,
          card_tags: formattedCardTags.length > 0 ? formattedCardTags : ['ИИ-КОНЦЕПТ']
        };
      } else {
        // Structure steps tags from string to array of strings
        const formattedProcessSteps = processSteps.map(step => ({
          ...step,
          tags: step.tags ? step.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        }));

        payload = {
          slug,
          is_in_development: isInDevelopment,
          is_ai_concept: false,
          demo_url: demoUrl,
          description: description || shortBio,
          title,
          subtitle,
          heroImage,
          card_title: cardTitle,
          card_image: cardImage,
          card_tags: formattedCardTags,
          meta: {
            sphere,
            type,
            stack,
            year
          },
          about: JSON.stringify({
            title: 'О\u00a0проекте',
            text: shortBio.trim()
          }),
          challenge: {
            task,
            solution,
            liveUrl
          },
          visibility,
          process: formattedProcessSteps,
          features: desktopFeatures,
          mobile_features: mobileFeatures,
          panorama_images: panorama,
          outro: {
            images: outroImages,
            image: outroImages[0] || ''
          },
          custom_blocks: customBlocks
        };
      }

      if (editingId) {
        // Edit mode: Update record
        const { error } = await supabase
          .from('cases')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        setToast({ show: true, message: 'Изменения успешно сохранены!', type: 'success' });
      } else {
        // Creation mode: Calculate sort_order (min - 1)
        let calculatedSortOrder = 0;
        if (casesList.length > 0) {
          const orders = casesList.map(c => c.sort_order).filter(o => o !== null && o !== undefined);
          if (orders.length > 0) {
            calculatedSortOrder = Math.min(...orders) - 1;
          }
        }
        
        payload.sort_order = calculatedSortOrder;

        const { error } = await supabase
          .from('cases')
          .insert([payload]);

        if (error) throw error;
        setToast({ show: true, message: 'Кейс успешно опубликован!', type: 'success' });
      }

      resetForm();
      fetchCases();
    } catch (err) {
      console.error('Saving error:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0сохранении кейса: ' + err.message, type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-zinc-900 font-sans antialiased">
      
      {/* LEFT COLUMN: Project List (Narrow sidebar) */}
      <aside className="w-full lg:w-96 border-r border-zinc-200 bg-white p-6 shrink-0">
        <div className="sticky top-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black hover:underline mb-8 no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться на сайт</span>
          </Link>

          <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-4">
            {activeTab === 'cases'
              ? '[ Управление кейсами ]'
              : activeTab === 'blog'
              ? '[ Управление статьями блога ]'
              : activeTab === 'other'
              ? '[ Управление другими проектами ]'
              : '[ Контактные данные ]'}
          </h2>

          <div className="border-t border-zinc-100 my-4" />

          {activeTab === 'cases' ? (
            editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать новый кейс</span>
              </button>
            )
          ) : activeTab === 'blog' ? (
            editingArticleId !== null && (
              <button
                type="button"
                onClick={resetArticleForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать новую статью</span>
              </button>
            )
          ) : (
            editingOtherId !== null && (
              <button
                type="button"
                onClick={resetOtherForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать новый проект</span>
              </button>
            )
          )}

          {activeTab === 'cases' ? (
            loadingList ? (
              <div className="flex items-center gap-2 py-4 text-xs text-neutral-450">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5B23]" />
                <span>Загрузка списка...</span>
              </div>
            ) : (() => {
              const filteredList = casesList.filter(item => {
                const isAi = !!item.is_ai_concept || !!item.isAiConcept || (item.card_tags && String(item.card_tags).toLowerCase().includes('ии'));
                return !isAi;
              });

              if (filteredList.length === 0) {
                return <p className="text-xs text-zinc-400 italic py-4">Список кейсов пуст</p>;
              }

              return (
                <ul className="space-y-2 pl-0 list-none my-0">
                  {filteredList.map((item, index) => {
                    const caseNumber = String(index + 1).padStart(2, '0');
                    return (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-start justify-between gap-3 p-3 border rounded-sm transition-all cursor-grab active:cursor-grabbing ${
                          draggedIndex === index ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-50' :
                          editingId === item.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex gap-2.5 min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-[#FF5B23] select-none shrink-0 mt-[1px]">
                            {caseNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-black break-words whitespace-normal leading-normal">
                              {item.title || item.card_title || '(Без\u00a0названия)'}
                            </span>
                            <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                              /{item.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-[1px]">
                          <div className="flex items-center gap-0.5 border border-zinc-100 rounded-sm p-[2px] bg-zinc-50/50">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveCase(index, 'up')}
                              className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                              title="Переместить вверх"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={index === filteredList.length - 1}
                              onClick={() => handleMoveCase(index, 'down')}
                              className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                              title="Переместить вниз"
                            >
                              ▼
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer p-0"
                            title="Редактировать"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-red-50 hover:text-red-650 cursor-pointer p-0"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()
          ) : activeTab === 'blog' ? (
            loadingArticles ? (
              <div className="flex items-center gap-2 py-4 text-xs text-neutral-450">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5B23]" />
                <span>Загрузка статей...</span>
              </div>
            ) : articlesList.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">Список статей пуст</p>
            ) : (
              <ul className="space-y-2 pl-0 list-none my-0">
                {articlesList.map((item, index) => {
                  const artNumber = String(index + 1).padStart(2, '0');
                  const isCurrent = editingArticleId === item.id || editingArticleId === item.slug;
                  const isPublished = item.status === 'published';
                  return (
                    <li
                      key={item.id || item.slug}
                      className={`flex items-start justify-between gap-3 p-3 border rounded-sm transition-all ${
                        isCurrent ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#FF5B23] select-none shrink-0 mt-[1px]">
                          {artNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <span className="block text-xs font-semibold text-black break-words whitespace-normal leading-normal">
                            {item.title || '(Без названия)'}
                          </span>
                          <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                            /blog/{item.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 mt-[1px]">
                        <button
                          type="button"
                          onClick={() => handleStartEditArticle(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer p-0"
                          title="Редактировать"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-red-50 hover:text-red-650 cursor-pointer p-0"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            loadingOther ? (
              <div className="flex items-center gap-2 py-4 text-xs text-neutral-450">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5B23]" />
                <span>Загрузка проектов...</span>
              </div>
            ) : otherProjects.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">Список проектов пуст</p>
            ) : (
              <ul className="space-y-2 pl-0 list-none my-0">
                {otherProjects.map((item, index) => {
                  const projNumber = String(index + 1).padStart(2, '0');
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-start justify-between gap-3 p-3 border rounded-sm transition-all cursor-grab active:cursor-grabbing ${
                        draggedIndex === index ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-50' :
                        editingOtherId === item.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#FF5B23] select-none shrink-0 mt-[1px]">
                          {projNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-black break-words whitespace-normal leading-normal">
                            {item.title || '(Без\u00a0названия)'}
                          </span>
                          <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                            № {item.num}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mt-[1px]">
                        <div className="flex items-center gap-0.5 border border-zinc-100 rounded-sm p-[2px] bg-zinc-50/50">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOtherProject(index, 'up')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вверх"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === otherProjects.length - 1}
                            onClick={() => handleMoveOtherProject(index, 'down')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вниз"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditOther(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer p-0"
                          title="Редактировать"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtherProjToDelete(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-red-50 hover:text-red-650 cursor-pointer p-0"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: Form Constructor (Wide workspace) */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl bg-white">
        {/* Tab switcher tabs bar */}
        <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cases');
              resetForm();
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cases'
                ? 'border-[#FF5B23] text-[#FF5B23] font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            📁 Кейсы
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('blog');
              resetArticleForm();
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'blog'
                ? 'border-[#FF5B23] text-[#FF5B23] font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            📝 Блог и Статьи
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('other');
              resetOtherForm();
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'other'
                ? 'border-[#FF5B23] text-[#FF5B23] font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            ⚡ Прочие проекты
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-[#FF5B23] text-[#FF5B23] font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            ⚙️ Контакты и ссылки
          </button>
        </div>

        {activeTab === 'cases' && (
          <>
            {/* Toggle Mode header action */}
            {editingId !== null && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-sm cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>[+] Создать новый кейс</span>
                </button>
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tighter text-black mb-8">
              {editingId !== null ? `Редактирование кейса: ${slug}` : '+ Добавить новый кейс'}
            </h1>

            <form onSubmit={handlePublishCase} className="space-y-12">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b border-zinc-100 pb-2">
                  [ 1. Основные параметры Hero ]
                </h3>

                {/* PREVIEW CARD FIELDS */}
                <div className="bg-zinc-50/40 p-4 border border-zinc-200 rounded-sm space-y-4">
                  <span className="block text-[10px] font-bold text-[#FF5B23] uppercase tracking-wider">
                    Превью карточки для главной страницы
                  </span>

                  {/* Checkboxes: In Development & AI Concept */}
                  <div className="flex flex-wrap items-center gap-6 py-1 border-b border-zinc-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-in-development"
                        checked={isInDevelopment}
                        onChange={(e) => setIsInDevelopment(e.target.checked)}
                        className="w-4 h-4 accent-black rounded-[2px]"
                      />
                      <label htmlFor="is-in-development" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 cursor-pointer select-none">
                        В разработке (is_in_development)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-ai-concept"
                        checked={isAiConcept}
                        onChange={(e) => setIsAiConcept(e.target.checked)}
                        className="w-4 h-4 accent-[#FF5B23] rounded-[2px]"
                      />
                      <label htmlFor="is-ai-concept" className="text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer select-none flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-[#FF5B23] text-white text-[10px] rounded">ИИ-КОНЦЕПТ</span>
                        <span>Живой ИИ-концепт</span>
                      </label>
                    </div>
                  </div>

                  {/* AI Concept specific fields */}
                  {isAiConcept && (
                    <div className="p-3 bg-[#FF5B23]/5 border border-[#FF5B23]/20 rounded-sm space-y-3 my-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#FF5B23] mb-1">
                          Ссылка на HTML файл демо (demo_url)
                        </label>
                        <input
                          type="text"
                          placeholder="/demos/concept_1.html"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-[#FF5B23] focus:ring-0 outline-none transition-colors font-mono"
                        />
                        <span className="block text-[11px] text-zinc-500 mt-1">
                          Укажите путь к файлу в папке public (например: <code>/demos/concept_1.html</code>) или внешнюю URL ссылку.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                          Краткое описание концепта
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Интерактивный промо-сайт студии авто-детейлинга с кастомной версткой..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                        Заголовок на превью
                      </label>
                      <input
                        type="text"
                        placeholder="Одежда FORME"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                      />
                      <span className="block text-[11px] text-zinc-400 mt-1">
                        Краткое название карточки
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                        Теги карточки
                      </label>
                      <input
                        type="text"
                        placeholder="E-commerce, UX/UI, Web Design"
                        value={cardTags}
                        onChange={(e) => setCardTags(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                      />
                      <span className="block text-[11px] text-zinc-400 mt-1">
                        Через запятую
                      </span>
                    </div>
                  </div>

                  <ImageUpload
                    label="Изображение карточки"
                    value={cardImage}
                    onChange={setCardImage}
                    onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                    pathPrefix={`${slug}-card`}
                  />
                </div>

                <div className="border-t border-zinc-100 my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      URL-адрес (Slug)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="forme-shop"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors font-mono"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Только латиница, цифры, дефисы. Пример: dynamic-case
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Главный заголовок кейса (Title)
                    </label>
                    <input
                      type="text"
                      placeholder="Интернет-магазин FORME"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Отображается на обложке кейса
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Подзаголовок кейса (Subtitle)
                    </label>
                    <input
                      type="text"
                      placeholder="Сайт с\u00a0акцентом на\u00a0чистые силуэты и\u00a0форму..."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Краткое введение под главным заголовком
                    </span>
                  </div>
                </div>

                <ImageUpload
                  label="Главное изображение обложки (Hero)"
                  value={heroImage}
                  onChange={setHeroImage}
                  onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                  pathPrefix={`${slug}-hero`}
                />
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 2: METADATA & ABOUT */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-200 pb-2">
                  [ 2. Мета-данные и Описание ]
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Сфера
                    </label>
                    <input
                      type="text"
                      placeholder="E-commerce"
                      value={sphere}
                      onChange={(e) => setSphere(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Например: Ритейл
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Тип проекта
                    </label>
                    <input
                      type="text"
                      placeholder="Интернет-магазин"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Например: Лендинг
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Стек
                    </label>
                    <input
                      type="text"
                      placeholder="UX/UI, React, Next.js"
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Через запятую
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Год
                    </label>
                    <input
                      type="text"
                      placeholder="2025"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      4 цифры года
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Краткое описание параграфа
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Расскажите в\u00a03-5 предложениях о\u00a0целях, задачах и\u00a0сути проекта..."
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                  />
                  <span className="block text-[11px] text-zinc-400 mt-1">
                    Выводится в блоке «О проекте»
                  </span>
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 3: TASK & SOLUTION */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-100 pb-2">
                  [ 3. Задача и Решение ]
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Задача проекта (Task)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Опишите техническую сложность или\u00a0бизнес-задачу..."
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Что нужно было сделать
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Решение (Solution)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Опишите спроектированный путь решения проблемы..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Как была решена задача
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Ссылка на живой сайт
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                  />
                  <span className="block text-[11px] text-zinc-400 mt-1">
                    Если оставить пустым, кнопка View Experience автоматически скроется на сайте
                  </span>
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 4: VISIBILITY TOGGLES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-200 pb-2">
                  [ 4. Видимость блоков на сайте ]
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(visibility).map((key) => {
                    const labels = {
                      process: (
                        <>
                          Показывать блок 'Процесс работы' <span className="text-zinc-400 font-normal">(№5)</span>
                        </>
                      ),
                      challenge: (
                        <>
                          Показывать блок 'Задача и\u00a0Решение' <span className="text-zinc-400 font-normal">(№3)</span>
                        </>
                      ),
                      desktop: (
                        <>
                          Показывать блок 'Десктопные фичи' <span className="text-zinc-400 font-normal">(№7)</span>
                        </>
                      ),
                      mobile: (
                        <>
                          Показывать блок 'Мобильная версия' <span className="text-zinc-400 font-normal">(№8)</span>
                        </>
                      ),
                      panorama: (
                        <>
                          Показывать блок 'Панорамный шоукейс' <span className="text-zinc-400 font-normal">(№6)</span>
                        </>
                      ),
                      outro: (
                        <>
                          Показывать блок 'Финальный шоукейс' <span className="text-zinc-400 font-normal">(№9)</span>
                        </>
                      ),
                      custom: (
                        <>
                          Показывать блок 'Инфо/Кастом' <span className="text-zinc-400 font-normal">(№10)</span>
                        </>
                      )
                    };

                    return (
                      <div key={key} className="flex items-center gap-2 border border-zinc-200 bg-white p-2.5 rounded-sm">
                        <input
                          type="checkbox"
                          id={`visible-${key}`}
                          checked={visibility[key]}
                          onChange={(e) => setVisibility({ ...visibility, [key]: e.target.checked })}
                          className="w-4 h-4 accent-black rounded-[2px]"
                        />
                        <label htmlFor={`visible-${key}`} className="text-[11px] font-semibold text-zinc-800 cursor-pointer select-none">
                          {labels[key] || key}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 5: PROCESS STEPS */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 5. Конструктор процесса реализации ]
                  </h3>
                  <button
                    type="button"
                    onClick={addProcessStep}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить этап</span>
                  </button>
                </div>

                {processSteps.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Этапы процесса не добавлены. Будут использоваться заглушки.</p>
                ) : (
                  <div className="space-y-4">
                    {processSteps.map((step, idx) => (
                      <div key={idx} id={`process-step-${idx}`} className="p-4 border border-zinc-200 rounded-sm space-y-3 relative bg-zinc-50/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Этап {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProcessStep(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название этапа
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Анализ и\u00a0стратегия"
                              value={step.title}
                              onChange={(e) => updateProcessStep(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Срок выполнения
                            </label>
                            <input
                              type="text"
                              placeholder="2-3 дня / 1 неделя"
                              value={step.duration}
                              onChange={(e) => updateProcessStep(idx, 'duration', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                            Краткое описание / детализация
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Например: Сбор требований, анализ конкурентов, проектирование..."
                            value={step.description || ''}
                            onChange={(e) => updateProcessStep(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                            Теги этапа (через запятую)
                          </label>
                          <input
                            type="text"
                            placeholder="Исследования, Аналитика, CJM"
                            value={step.tags || ''}
                            onChange={(e) => updateProcessStep(idx, 'tags', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 6: DESKTOP FEATURES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 6. Ключевые функции (Desktop) ]
                  </h3>
                  <button
                    type="button"
                    onClick={addDesktopFeature}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить фичу</span>
                  </button>
                </div>

                {desktopFeatures.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Функции десктопа не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {desktopFeatures.map((card, idx) => (
                      <div key={idx} id={`desktop-feature-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-white space-y-4 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Десктопная функция #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeDesktopFeature(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название функции
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Онлайн-запись к\u00a0врачу"
                              value={card.title}
                              onChange={(e) => updateDesktopFeature(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Описание функции
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Опишите, что делает эта десктопная функция..."
                              value={card.text}
                              onChange={(e) => updateDesktopFeature(idx, 'text', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                            />
                          </div>
                        </div>

                        <ImageUpload
                          label="Изображение десктопной функции"
                          value={card.image}
                          onChange={(url) => updateDesktopFeature(idx, 'image', url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-d-feat-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 7: MOBILE FEATURES */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 7. Ключевые функции (Mobile) ]
                  </h3>
                  <button
                    type="button"
                    onClick={addMobileFeature}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить мобильную фичу</span>
                  </button>
                </div>

                {mobileFeatures.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Мобильные функции не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {mobileFeatures.map((card, idx) => (
                      <div key={idx} id={`mobile-feature-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-zinc-50/10 space-y-4 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Мобильная функция #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMobileFeature(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название функции
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Телемед чат"
                              value={card.title}
                              onChange={(e) => updateMobileFeature(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Лейбл/Категория (например, Консультация)
                            </label>
                            <input
                              type="text"
                              placeholder="Консультация"
                              value={card.label}
                              onChange={(e) => updateMobileFeature(idx, 'label', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        </div>

                        <ImageUpload
                          label="Изображение мобильной фичи"
                          value={card.image}
                          onChange={(url) => updateMobileFeature(idx, 'image', url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-m-feat-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 8: PANORAMA IMAGES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 8. Панорамный шоукейс ]
                  </h3>
                  <button
                    type="button"
                    onClick={addPanoramaImage}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить изображение</span>
                  </button>
                </div>

                {panorama.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Панорамные изображения не добавлены.</p>
                ) : (
                  <div className="space-y-4">
                    {panorama.map((imgUrl, idx) => (
                      <div key={idx} id={`panorama-image-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-white space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Изображение #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePanoramaImage(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <ImageUpload
                          label="Загрузить изображение"
                          value={imgUrl}
                          onChange={(url) => updatePanoramaImage(idx, url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-pan-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 9: OUTRO IMAGES */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 9. Финальный шоукейс (Outro) ]
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOutroImages([...outroImages, ''])}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить изображение</span>
                  </button>
                </div>

                {outroImages.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Финальные изображения не добавлены.</p>
                ) : (
                  <div className="space-y-4">
                    {outroImages.map((imgUrl, idx) => (
                      <div key={idx} className="p-4 border border-zinc-200 rounded-sm bg-zinc-50/10 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Финальное изображение #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setOutroImages(outroImages.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <ImageUpload
                          label="Загрузить изображение"
                          value={imgUrl}
                          onChange={(url) => {
                            const next = [...outroImages];
                            next[idx] = url;
                            setOutroImages(next);
                          }}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-outro-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 10: CUSTOM BLOCKS */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 10. Кастомные инфо-блоки ]
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomBlock}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить блок</span>
                  </button>
                </div>

                {customBlocks.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Кастомные блоки не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {customBlocks.map((block, idx) => (
                      <div key={idx} id={`custom-block-${idx}`} className="p-5 border border-zinc-200 rounded-sm relative bg-white space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400">Блок #{idx + 1}</span>
                            <select
                              value={block.type}
                              onChange={(e) => updateCustomBlock(idx, 'type', e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-zinc-200 rounded-[2px] outline-none"
                            >
                              <option value="text">Текст</option>
                              <option value="image">Картинка</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomBlock(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        {block.type === 'text' ? (
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Кастомный текст
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Введите кастомный текст..."
                              value={block.content}
                              onChange={(e) => updateCustomBlock(idx, 'content', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        ) : (
                            <ImageUpload
                              label="Кастомное изображение"
                              value={block.content}
                              onChange={(url) => updateCustomBlock(idx, 'content', url)}
                              onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                              pathPrefix={`${slug}-custom-${idx}`}
                            />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PUBLISH ACTION */}
              <div className="pt-6 border-t border-zinc-200 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={publishing}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white hover:bg-neutral-800 rounded-sm text-sm font-semibold transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{publishing ? 'Сохранение...' : (editingId !== null ? 'Сохранить изменения' : 'Опубликовать новый кейс')}</span>
                </button>
              </div>

            </form>
          </>
        )}

        {activeTab === 'other' && (
          <>
            {/* TAB 2: OTHER PROJECTS SINGLE FORM */}
            {editingOtherId !== null && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={resetOtherForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-sm cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>[+] Создать новый проект</span>
                </button>
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tighter text-black mb-8">
              {editingOtherId !== null ? `Редактирование проекта: ${otherTitle}` : '+ Добавить новый проект в\u00a0архив'}
            </h1>

            <form onSubmit={handlePublishOtherProject} className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Номер
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    maxLength={4}
                    value={otherNum}
                    onChange={(e) => setOtherNum(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Название проекта
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Интернет-магазин FORME"
                    value={otherTitle}
                    onChange={(e) => setOtherTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                  Ссылка (необязательно)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={otherLinkUrl}
                  onChange={(e) => setOtherLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                  Описание проекта
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Опишите проект, его суть и\u00a0технологическую направленность..."
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                {editingOtherId !== null && (
                  <button
                    type="button"
                    onClick={resetOtherForm}
                    className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
                  >
                    Отмена
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingOther}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black text-white hover:bg-neutral-800 rounded-sm text-xs font-bold tracking-wider uppercase transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingOther && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingOther ? 'Сохранение...' : (editingOtherId !== null ? 'Сохранить изменения' : 'Добавить проект')}</span>
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'blog' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-light tracking-tighter text-black">
                  {editingArticleId !== null ? `Редактирование статьи: ${articleSlug}` : '+ Создать новую статью'}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Публикация через CMS с автогенерацией SEO, Canonical, OpenGraph и JSON-LD
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowArticlePreview(true)}
                  className="px-3.5 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  👁️ Предпросмотр (Preview)
                </button>
                {editingArticleId !== null && (
                  <button
                    type="button"
                    onClick={resetArticleForm}
                    className="px-3.5 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-semibold bg-white transition-colors cursor-pointer"
                  >
                    + Создать новую
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tabs bar for Rule #5 UX: Content, Media, SEO, Publishing */}
            <div className="flex border-b border-zinc-200 mb-6 bg-zinc-50/50 p-1 rounded-sm gap-1">
              {[
                { id: 'content', label: '1. Контент' },
                { id: 'media', label: '2. Медиа' },
                { id: 'seo', label: '3. SEO & OG' },
                { id: 'publishing', label: '4. Публикация & Доступ' }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  type="button"
                  onClick={() => {
                    if (subTab.id === 'seo') fillArticleSeoFields();
                    setArticleFormSection(subTab.id);
                  }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                    articleFormSection === subTab.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-6">
              {/* SUBTAB 1: CONTENT */}
              {articleFormSection === 'content' && (
                <div className="space-y-5 bg-white p-6 border border-zinc-200 rounded-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                      Заголовок статьи (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Почему сайт выглядит дешево и как это исправить"
                      value={articleTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setArticleTitle(val);
                        if (!editingArticleId && !articleSlug) {
                          setArticleSlug(transliterateToSlug(val));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-semibold text-zinc-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                        URL статьи (Slug) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setArticleSlug(transliterateToSlug(articleTitle))}
                        className="text-[10px] font-semibold text-[#FF5B23] hover:underline cursor-pointer"
                      >
                        Сгенерировать из названия
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-zinc-100 border border-r-0 border-zinc-300 text-xs text-zinc-500 rounded-l-sm">
                        https://ksenweb.com/blog/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="why-website-looks-cheap"
                        value={articleSlug}
                        onChange={(e) => setArticleSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-300 rounded-r-sm focus:border-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                      Краткое анонсное описание (Excerpt) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Краткое описание статьи в 2-3 предложениях для карточки в блоге и соцсетей..."
                      value={articleExcerpt}
                      onChange={(e) => setArticleExcerpt(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none resize-y"
                    />
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Основной текст статьи (Content) *
                      </label>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        💡 Выделите любой фразу или текст мышкою в поле ниже и нажмите нужную кнопку для форматирования!
                      </span>
                    </div>

                    {/* 1-Click Magic Auto-Formatter Banner */}
                    <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-3.5 rounded-t-sm flex flex-wrap items-center justify-between gap-3 shadow-sm border border-orange-600 border-b-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl animate-pulse">🪄</span>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-white">
                            Авто-форматирование структуры в 1 клик
                          </div>
                          <div className="text-[11px] text-orange-100 font-normal">
                            Вставьте любой скопированный сырой текст из Word / Notion и нажмите эту кнопку!
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!articleContent || !articleContent.trim()) {
                              setToast({ show: true, message: 'Сначала вставьте текст статьи в поле ниже!', type: 'error' });
                              return;
                            }
                            const formatted = autoFormatArticleText(articleContent);
                            setArticleContent(formatted);
                            setToast({ show: true, message: '✨ Текст статьи отформатирован! Расставлены H2, H3 и отступы.', type: 'success' });
                          }}
                          className="px-4 py-2 bg-white hover:bg-orange-50 text-orange-600 font-bold text-xs rounded shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>🪄 Авто-форматировать текст (1 клик)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Очистить HTML-теги и оставить только простой текст?')) {
                              const clean = articleContent.replace(/<[^>]*>/g, '');
                              setArticleContent(clean);
                              setToast({ show: true, message: 'HTML-теги удалены', type: 'info' });
                            }
                          }}
                          className="px-2.5 py-2 bg-orange-700/60 hover:bg-orange-800/80 text-white text-[11px] font-medium rounded transition-colors cursor-pointer"
                          title="Очистить HTML-теги и оставить простой текст"
                        >
                          Очистить теги
                        </button>
                      </div>
                    </div>

                    {/* Rich Formatting Toolbar & Selection Wrappers */}
                    <div className="bg-zinc-100 p-3 border border-zinc-300 border-b-0 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                        <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                          Выбор размера шрифта и заголовков:
                        </span>
                        <span className="text-[10px] text-zinc-500 italic">
                          (Основной наборный текст статьи по умолчанию 14px-15px)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = cleanArticleHeading(selected || 'Заголовок раздела (H2)');
                            const newText = articleContent.substring(0, start) + `<h2>${contentToWrap}</h2>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-900 font-semibold cursor-pointer shadow-xs"
                          title="Применить заголовок H2 (24px)"
                        >
                          H2 (24px)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = cleanArticleHeading(selected || 'Подзаголовок раздела (H3)');
                            const newText = articleContent.substring(0, start) + `<h3>${contentToWrap}</h3>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-800 font-medium cursor-pointer shadow-xs"
                          title="Применить подзаголовок H3 (20px)"
                        >
                          H3 (20px)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || 'Текст параграфа...';
                            const newText = articleContent.substring(0, start) + `<p>${contentToWrap}</p>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-700 cursor-pointer shadow-xs font-normal"
                          title="Обычный текст P (14px по умолчанию)"
                        >
                          P (14px по умолчанию)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || 'Мелкая подпись';
                            const newText = articleContent.substring(0, start) + `<small>${contentToWrap}</small>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-500 text-[11px] cursor-pointer shadow-xs"
                          title="Мелкая подпись (12px)"
                        >
                          12px (Small)
                        </button>
                        <span className="h-4 w-px bg-zinc-300 mx-1" />
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || 'выделенный текст';
                            const newText = articleContent.substring(0, start) + `<strong>${contentToWrap}</strong>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded font-bold text-zinc-900 cursor-pointer shadow-xs"
                          title="Сделать выделенный текст жирным"
                        >
                          Ж (Жирный)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || 'текст курсивом';
                            const newText = articleContent.substring(0, start) + `<em>${contentToWrap}</em>` + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded italic text-zinc-800 cursor-pointer shadow-xs"
                          title="Сделать выделенный текст курсивом"
                        >
                          К (Курсив)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || 'Главная рекомендация или совет...';
                            const snippet = `\n<div class="article-callout bg-zinc-50 border border-zinc-200/80 rounded-[4px] p-4 sm:p-5 my-6">\n  <div class="text-[11px] font-mono font-medium text-[#FF5B23] uppercase tracking-wider mb-2">Что изменить</div>\n  <p class="text-zinc-700 text-sm mb-0">${contentToWrap}</p>\n</div>\n`;
                            const newText = articleContent.substring(0, start) + snippet + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded text-[#FF5B23] font-semibold cursor-pointer shadow-xs"
                        >
                          + 💡 Плашка "Что изменить"
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const contentToWrap = selected || '«Важная мысль или вопрос пользователя...»';
                            const snippet = `\n<blockquote class="my-6 p-4 bg-orange-50/60 border-l-4 border-[#FF5B23] rounded-r text-zinc-800 font-medium italic text-sm sm:text-base">\n  ${contentToWrap}\n</blockquote>\n`;
                            const newText = articleContent.substring(0, start) + snippet + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-800 font-medium italic cursor-pointer shadow-xs"
                        >
                          + 💬 Цитата
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const items = selected ? selected.split('\n').filter(Boolean).map(line => `  <li>${line}</li>`).join('\n') : '  <li>Пункт 1</li>\n  <li>Пункт 2</li>';
                            const snippet = `\n<ul>\n${items}\n</ul>\n`;
                            const newText = articleContent.substring(0, start) + snippet + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-700 cursor-pointer shadow-xs"
                        >
                          + 📋 Список
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById('article-content-textarea');
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = articleContent.substring(start, end);
                            const items = selected ? selected.split('\n').filter(Boolean).map((line, idx) => `  <li>${idx + 1}. ${line}</li>`).join('\n') : '  <li>1. Шаг первый</li>\n  <li>2. Шаг второй</li>';
                            const snippet = `\n<ol>\n${items}\n</ol>\n`;
                            const newText = articleContent.substring(0, start) + snippet + articleContent.substring(end);
                            setArticleContent(newText);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded text-zinc-700 cursor-pointer shadow-xs"
                        >
                          + 🔢 Нумерация
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!articleContent) return;
                            const cleaned = articleContent.replace(/<figure class="my-6 p-4 border border-dashed[\s\S]*?<\/figure>\n?/g, '');
                            setArticleContent(cleaned);
                            setToast({ show: true, message: 'Заглушки фото удалены из текста статьи!', type: 'success' });
                          }}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-600 font-semibold cursor-pointer shadow-xs"
                          title="Удалить все блоки-заглушки для фото из текста статьи"
                        >
                          🗑️ Удалить заглушки фото
                        </button>
                      </div>

                      {/* Built-in Instant Image Uploader for inline visuals */}
                      <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={inlineImageAlt}
                            onChange={(e) => setInlineImageAlt(e.target.value)}
                            placeholder={createArticleImageAlt({ title: articleTitle })}
                            className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded focus:border-black outline-none"
                          />
                          <input
                            type="text"
                            value={inlineImageCaption}
                            onChange={(e) => setInlineImageCaption(e.target.value)}
                            placeholder="Подпись или источник — необязательно"
                            className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded focus:border-black outline-none"
                          />
                        </div>
                        <span className="text-[11px] text-zinc-500">Alt-текст создаётся из подписи или названия статьи; его можно изменить до загрузки. Пустая подпись не будет показана.</span>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Загрузить фото в текст</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setToast({ show: true, message: 'Загрузка визуала...', type: 'info' });
                                const webpFile = await convertToWebP(file, 1600, 0.85);
                                const fileName = `inline-article-${Date.now()}-${Math.random().toString(36).substring(2,7)}.webp`;
                                const filePath = `uploads/${fileName}`;

                                const { error: upErr } = await supabase.storage
                                  .from('case-images')
                                  .upload(filePath, webpFile, { upsert: true });

                                if (upErr) throw upErr;

                                const { data: { publicUrl } } = supabase.storage
                                  .from('case-images')
                                  .getPublicUrl(filePath);

                                const textarea = document.getElementById('article-content-textarea');
                                const start = textarea ? textarea.selectionStart : articleContent.length;
                                const escapeHtmlAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                const escapeHtmlText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                const caption = inlineImageCaption.trim();
                                const generatedAlt = createArticleImageAlt({ title: articleTitle, caption });
                                const alt = escapeHtmlAttribute(inlineImageAlt.trim() || generatedAlt);
                                const captionHtml = caption ? `\n  <figcaption>${escapeHtmlText(caption)}</figcaption>` : '';
                                const figureHtml = `\n<figure class="article-inline-image">\n  <img src="${publicUrl}" alt="${alt}" />${captionHtml}\n</figure>\n`;
                                const newText = articleContent.substring(0, start) + figureHtml + articleContent.substring(start);
                                setArticleContent(newText);
                                setInlineImageAlt('');
                                setInlineImageCaption('');
                                setToast({ show: true, message: 'Визуал успешно вставлен в текст!', type: 'success' });
                              } catch (err) {
                                console.error('Inline image upload error:', err);
                                setToast({ show: true, message: 'Ошибка при загрузке картинки: ' + err.message, type: 'error' });
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <textarea
                      id="article-content-textarea"
                      required
                      rows={14}
                      placeholder="Вставьте весь текст статьи. Выделяйте нужные предложения мышкою и нажимайте кнопки на панели выше (H2, H3, P 14px, Жирный, Картинка...), чтобы применить стили к выделенному фрагменту!"
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      className="w-full px-3.5 py-3 text-xs font-mono bg-white border border-zinc-300 rounded-b-sm focus:border-black outline-none leading-relaxed"
                    />
                  </div>

                  {/* Formatted Live Visual Preview Box right below textarea */}
                  <div className="mt-4 p-4 border border-zinc-200 rounded-sm bg-zinc-50/50">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      👁️ Живой вид форматированного текста (Как будет выглядеть статья):
                    </div>
                    <div
                      className="prose prose-zinc max-w-none bg-white p-4 sm:p-6 border border-zinc-200 rounded-sm
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900
                        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-5 prose-h2:border-t prose-h2:border-zinc-200 prose-h2:font-bold prose-h2:text-zinc-900
                        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-semibold prose-h3:text-zinc-900
                        prose-p:text-zinc-700 prose-p:text-[14px] sm:prose-p:text-[15px] prose-p:leading-[1.75] prose-p:mb-6 prose-p:font-normal
                        prose-ul:my-6 prose-ol:my-6 prose-li:text-zinc-700 prose-li:text-[14px] sm:prose-li:text-[15px] prose-li:my-2"
                      dangerouslySetInnerHTML={{ __html: autoFormatArticleText(articleContent) || '<p class="text-zinc-400 italic">Начните вводить текст статьи...</p>' }}
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB 2: MEDIA */}
              {articleFormSection === 'media' && (
                <div className="space-y-5 bg-white p-6 border border-zinc-200 rounded-sm">
                  <ImageUpload
                    label="Обложка статьи (Cover Image)"
                    value={articleCoverImage}
                    onChange={(url) => {
                      setArticleCoverImage(url);
                      setArticleCoverAlt((current) => current || createArticleImageAlt({ title: articleTitle, type: 'cover' }));
                    }}
                    onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                    pathPrefix="article"
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                      Alt-описание для обложки (Cover Alt) *
                    </label>
                    <input
                      type="text"
                      placeholder="Опишите, что изображено на картинке для поисковиков и скринридеров"
                      value={articleCoverAlt}
                      onChange={(e) => setArticleCoverAlt(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Заполняется автоматически из названия статьи. Проверьте и при необходимости уточните, что изображено на фото.
                    </span>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: SEO & OG */}
              {articleFormSection === 'seo' && (
                <div className="space-y-5 bg-white p-6 border border-zinc-200 rounded-sm">
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                    <p className="text-xs text-zinc-500 leading-relaxed">Поля заполнены из названия, анонса, текста, H2 и обложки. Их можно отредактировать вручную.</p>
                    <button
                      type="button"
                      onClick={fillArticleSeoFields}
                      className="shrink-0 px-3 py-2 border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                    >
                      Обновить SEO
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        SEO Title (заголовок для поисковиков)
                      </label>
                      <span className={`text-[10px] font-mono ${articleSeoTitle.length > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
                        {articleSeoTitle.length} / 60 символов
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={articleTitle ? `${articleTitle} | ${SEO_BRAND_SUFFIX}` : "Заголовок для вывода в Google"}
                      value={articleSeoTitle}
                      onChange={(e) => setArticleSeoTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Используется заголовок статьи + «{SEO_BRAND_SUFFIX}».
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Meta Description (описание в вычече Search Console / Google)
                      </label>
                      <span className={`text-[10px] font-mono ${articleMetaDescription.length > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                        {articleMetaDescription.length} / 160 символов
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder={articleExcerpt || "Описание статьи для поисковой выдачи..."}
                      value={articleMetaDescription}
                      onChange={(e) => setArticleMetaDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                      Canonical URL Override (опционально)
                    </label>
                    <input
                      type="text"
                      placeholder="https://ksenweb.com/blog/your-slug"
                      value={articleCanonicalOverride}
                      onChange={(e) => setArticleCanonicalOverride(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="article-noindex"
                      checked={articleNoindex}
                      onChange={(e) => setArticleNoindex(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded-[2px]"
                    />
                    <label htmlFor="article-noindex" className="text-xs font-bold uppercase tracking-wider text-zinc-800 cursor-pointer select-none">
                      Скрыть от индексации (noindex, nofollow)
                    </label>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: PUBLISHING & CATEGORIES */}
              {articleFormSection === 'publishing' && (
                <div className="space-y-6 bg-white p-6 border border-zinc-200 rounded-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                      Статус публикации *
                    </label>
                    <select
                      value={articleStatus}
                      onChange={(e) => setArticleStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-semibold text-zinc-900"
                    >
                      <option value="published">Опубликовано (Published)</option>
                      <option value="draft">Черновик (Draft — не индексируется)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                        Категория статьи *
                      </label>
                      <select
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-semibold text-zinc-900"
                      >
                        {categoriesList.map(cat => (
                          <option key={cat.id || cat.slug} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                        Время чтения
                      </label>
                      <input
                        type="text"
                        placeholder="5 мин"
                        value={articleReadingTime}
                        onChange={(e) => setArticleReadingTime(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                        Теги (через запятую)
                      </label>
                      <input
                        type="text"
                        placeholder="UI/UX, Tilda, Разработка"
                        value={articleTags}
                        onChange={(e) => setArticleTags(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                        Автор статьи
                      </label>
                      <input
                        type="text"
                        value={articleAuthor}
                        onChange={(e) => setArticleAuthor(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Blog Category Manager */}
                  <div className="pt-6 border-t border-zinc-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF5B23]">
                        [ 🏷️ Управление категориями блога ]
                      </h4>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Всего категорий: {categoriesList.length}
                      </span>
                    </div>

                    {/* Existing categories list */}
                    <div className="border border-zinc-200 rounded-sm overflow-hidden bg-zinc-50 divide-y divide-zinc-200">
                      {categoriesList.map((cat) => (
                        <div key={cat.id || cat.slug} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-zinc-50 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{cat.name}</span>
                              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-600 rounded">
                                /{cat.slug}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">{cat.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditCat(cat)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
                            >
                              ✏️ Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() => setCatToDelete(cat)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors cursor-pointer"
                            >
                              🗑️ Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add / Edit Category Form */}
                    <div className="p-4 border border-zinc-200 rounded-sm bg-zinc-50/80 space-y-3">
                      <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        {editingCatId !== null ? `Редактирование категории: ${catName}` : '+ Добавить новую категорию'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Название категории *
                          </label>
                          <input
                            type="text"
                            placeholder="например: Маркетинг & Рост"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            URL-слаг (Slug)
                          </label>
                          <input
                            type="text"
                            placeholder="например: marketing-growth"
                            value={catSlug}
                            onChange={(e) => setCatSlug(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Краткое описание категории
                        </label>
                        <input
                          type="text"
                          placeholder="Статьи про оптимизацию конверсии, позиционирование и продажи..."
                          value={catDescription}
                          onChange={(e) => setCatDescription(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-sm focus:border-black outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {editingCatId !== null && (
                          <button
                            type="button"
                            onClick={resetCatForm}
                            className="px-3 py-1.5 border border-zinc-300 hover:border-black rounded text-xs font-medium text-zinc-700 bg-white cursor-pointer"
                          >
                            Отмена
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveCategory}
                          className="px-4 py-1.5 bg-[#FF5B23] hover:bg-[#e04f1e] text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                        >
                          {editingCatId !== null ? 'Сохранить изменения' : '+ Добавить категорию'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Submit Action Bar */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowArticlePreview(true)}
                  className="px-4 py-2.5 border border-zinc-200 hover:border-black rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  👁️ Предпросмотр (Preview)
                </button>

                <div className="flex items-center gap-3">
                  {editingArticleId !== null && (
                    <button
                      type="button"
                      onClick={resetArticleForm}
                      className="px-4 py-2.5 border border-zinc-200 hover:border-black rounded-sm text-xs font-semibold bg-white text-zinc-700 transition-colors cursor-pointer"
                    >
                      Отмена
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingArticle}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FF5B23] hover:bg-[#e04f1e] text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingArticle && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{savingArticle ? 'Сохранение...' : (editingArticleId !== null ? 'Обновить статью' : 'Опубликовать статью')}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {activeTab === 'contacts' && (
          <form onSubmit={handleSaveContacts} className="space-y-6">
            <div>
              <h1 className="text-3xl font-light tracking-tighter text-black mb-1">
                Контакты и социальные ссылки
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Здесь можно легко изменить номер телефона, почту под номером, ссылки на Telegram и MAX на всём сайте.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                  Номер телефона в футере
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+375 25 914 09 59"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-black font-medium text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                  Email адрес под номером телефона
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="verameeva77@mail.ru"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-black font-medium text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                  Ссылка на Telegram (https://t.me/...)
                </label>
                <input
                  type="text"
                  value={contactTelegramUrl}
                  onChange={(e) => setContactTelegramUrl(e.target.value)}
                  placeholder="https://t.me/ksen_web"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] font-medium text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1">
                  Ссылка на MAX
                </label>
                <input
                  type="text"
                  value={contactMaxUrl}
                  onChange={(e) => setContactMaxUrl(e.target.value)}
                  placeholder="https://max.ru/u/..."
                  className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-300 rounded-sm focus:outline-none focus:border-[#FF5B23] font-medium text-zinc-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <button
                type="submit"
                disabled={savingContacts}
                className="inline-flex items-center justify-center gap-2 bg-[#FF5B23] hover:bg-[#e04f1e] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm transition-colors duration-200 cursor-pointer shadow-sm border-none disabled:opacity-50"
              >
                {savingContacts && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{savingContacts ? 'Сохранение...' : 'Сохранить контакты и ссылки'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Article Preview Modal (Rule #33) */}
      {showArticlePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-6 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                  [ Предпросмотр статьи ]
                </span>
                <span className={`ml-3 px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                  articleStatus === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {articleStatus}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowArticlePreview(false)}
                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-sm text-xs font-bold text-zinc-800 cursor-pointer"
              >
                Закрыть (Esc)
              </button>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="mb-8 p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Предпросмотр в выдаче Google Search
              </span>
              <div className="text-xs text-emerald-700 truncate font-mono">
                https://ksenweb.com/blog/{articleSlug || 'your-slug'}
              </div>
              <div className="text-base font-semibold text-blue-700 hover:underline cursor-pointer">
                {articleSeoTitle || `${articleTitle || 'Заголовок статьи'} | ${SEO_BRAND_SUFFIX}`}
              </div>
              <div className="text-xs text-zinc-600 line-clamp-2">
                {articleMetaDescription || articleExcerpt || 'Описание статьи в поиске...'}
              </div>
            </div>

            {/* Public article rendering preview */}
            <div className="max-w-4xl mx-auto">
              <article className="w-full">
                <header className="mb-10">
                  <div className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase mb-3">
                    [ {articleCategory || 'Статья'} ]
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-black leading-tight mb-6">
                    {preventArticleHangingWords(cleanArticleHeading(articleTitle || 'Название вашей статьи'))}
                  </h1>
                  <p className="text-zinc-500 text-base lg:text-lg leading-relaxed mb-8 font-normal">
                    {preventArticleHangingWords(articleExcerpt || 'Краткое описание статьи появится здесь.')}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-100 text-xs text-zinc-500 font-normal">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarImg(contentData?.sidebar?.profile?.avatarUrl)}
                        alt={articleAuthor || 'Ксения Матвеенко'}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <div className="font-medium text-zinc-900 text-sm">{articleAuthor || 'Ксения Матвеенко'}</div>
                        <div className="text-zinc-400 text-[11px]">Веб-дизайнер & Разработчик</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-400" />{formatArticlePreviewDate(articlePublishedAt)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-400" />{articleReadingTime || '5 мин'}</span>
                    </div>
                  </div>
                </header>

                {articleCoverImage && (
                  <figure className="mb-12 rounded-[2px] overflow-hidden border border-zinc-200 bg-zinc-50">
                    <img src={articleCoverImage} alt={articleCoverAlt || articleTitle} className="w-full max-h-[520px] object-cover" />
                  </figure>
                )}

                {articlePreview.headings.length > 0 && (
                  <nav aria-label="Содержание статьи" className="mb-10 border border-zinc-200 bg-zinc-50/70 rounded-[3px] p-4 sm:p-5">
                    <div className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-zinc-500 mb-3">Содержание</div>
                    <div className="flex flex-col gap-2">
                      {articlePreview.headings.map((heading, index) => (
                        <div key={heading.id} className="w-full rounded-[2px] border border-zinc-200 bg-white px-3 py-2.5 text-left text-[13px] sm:text-sm leading-snug text-zinc-700">
                          <span className="mr-1.5 font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span>
                          {heading.title}
                        </div>
                      ))}
                    </div>
                  </nav>
                )}

                <div
                  className="article-content-body prose prose-zinc max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900
                    prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-zinc-200
                    prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-semibold
                    prose-p:text-zinc-700 prose-p:leading-[1.75] prose-p:mb-6 prose-p:text-[14px] sm:prose-p:text-[15px]
                    prose-ul:my-6 prose-ol:my-6 prose-ul:pl-5 prose-ol:pl-5 prose-li:text-zinc-700 prose-li:my-2 prose-li:text-[14px] sm:prose-li:text-[15px]
                    prose-img:rounded-[2px] prose-img:border prose-img:border-zinc-200 prose-img:my-6 prose-img:w-full"
                  dangerouslySetInnerHTML={{ __html: articlePreview.html || '<p>Содержимое статьи...</p>' }}
                />
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-xs font-semibold tracking-wider uppercase px-4 py-3 border rounded-sm shadow-xl flex items-center gap-2 transition-all duration-300 animate-toast ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-black text-white border-neutral-800'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 rounded-sm p-6 max-w-sm w-full shadow-2xl animate-toast">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-3">
              [ Подтверждение удаления ]
            </h4>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-6">
              Вы уверены, что хотите полностью удалить кейс "{itemToDelete.title || itemToDelete.card_title || itemToDelete.slug}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCase(itemToDelete.id, itemToDelete.slug);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Other Project Confirmation Modal */}
      {otherProjToDelete !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 rounded-sm p-6 max-w-sm w-full shadow-2xl animate-toast">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-3">
              [ Подтверждение удаления ]
            </h4>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-6">
              Вы уверены, что хотите удалить проект "{otherProjToDelete.title || otherProjToDelete.num}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOtherProjToDelete(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteOtherProject(otherProjToDelete.id, !!otherProjToDelete.isTemp);
                  setOtherProjToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {catToDelete !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 rounded-sm p-6 max-w-sm w-full shadow-2xl animate-toast">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-3">
              [ Подтверждение удаления категории ]
            </h4>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-6">
              Вы уверены, что хотите удалить категорию "{catToDelete.name}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCategory(catToDelete.id);
                  setCatToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-toast {
          animation: toastFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}
