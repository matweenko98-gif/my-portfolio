import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, ChevronRight, Share2, ArrowUpRight } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { supabase } from '../lib/supabaseClient';
import { avatarImg } from '../utils/imageUtils';
import { FlickeringGrid } from "./ui/FlickeringGrid";

function ensureFormattedHtml(rawContent) {
  if (!rawContent) return '';
  let content = rawContent.trim();
  
  // Strip legacy embedded CTA box HTML from raw content (since it is rendered natively below)
  content = content.replace(/<div\s+class="article-cta-box[\s\S]*?<\/div>\s*<\/div>/gi, '');
  content = content.replace(/<div\s+class="article-cta-box[\s\S]*?<\/div>/gi, '');

  // Collapse newlines inside <a> tags to prevent nested spans from breaking onto new lines
  content = content.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (match) => {
    return match.replace(/\n\s*/g, ' ');
  });

  // If content is plain text or lacks paragraph tags (<p>), auto format it
  if (!/<p\b[^>]*>/i.test(content)) {
    // Convert numbered headers like "1. Первый экран..." into <h2>1. Первый экран...</h2>
    content = content.replace(/(^|\n)(\d+\.\s+[^\n]+)/g, '$1<h2>$2</h2>');
    
    // Split by double newlines into paragraphs
    const blocks = content.split(/\n\s*\n/);
    content = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<a')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    }).filter(Boolean).join('\n\n');
  }

  return content;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchArticleData = async () => {
      setLoading(true);
      try {
        let found = null;
        let allPublished = [];

        // 0. Check localStorage cache first
        let localCacheItem = null;
        try {
          const cachedStr = localStorage.getItem('site_blog_articles');
          if (cachedStr) {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed)) {
              localCacheItem = parsed.find(a => a.slug === slug);
            }
          }
        } catch (e) {}

        // 1. Try Supabase
        const { data: dbArticle } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        const { data: dbAll } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (dbArticle) {
          found = {
            id: dbArticle.id,
            slug: dbArticle.slug,
            title: dbArticle.title,
            excerpt: dbArticle.excerpt,
            content: dbArticle.content,
            coverImage: dbArticle.cover_image || dbArticle.coverImage,
            coverAlt: dbArticle.cover_alt || dbArticle.coverAlt,
            seoTitle: dbArticle.seo_title || dbArticle.seoTitle,
            metaDescription: dbArticle.meta_description || dbArticle.metaDescription,
            canonicalOverride: dbArticle.canonical_override || dbArticle.canonicalOverride,
            noindex: dbArticle.noindex || false,
            ogTitle: dbArticle.og_title || dbArticle.ogTitle,
            ogDescription: dbArticle.og_description || dbArticle.ogDescription,
            ogImage: dbArticle.og_image || dbArticle.ogImage,
            author: dbArticle.author || 'Ксения Матвеенко',
            category: dbArticle.category || 'Статья',
            tags: dbArticle.tags || [],
            publishedAt: dbArticle.published_at || dbArticle.publishedAt,
            updatedAt: dbArticle.updated_at || dbArticle.updatedAt,
            readingTime: dbArticle.reading_time || dbArticle.readingTime || '5 мин'
          };
        }

        // If database article was NOT found, fallback to localCacheItem
        if (!found && localCacheItem) {
          found = {
            ...localCacheItem,
            coverImage: localCacheItem.cover_image || localCacheItem.coverImage,
            coverAlt: localCacheItem.cover_alt || localCacheItem.coverAlt
          };
        }

        if (dbAll && dbAll.length > 0) {
          allPublished = dbAll.map(item => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            coverImage: item.cover_image || item.coverImage,
            coverAlt: item.cover_alt || item.coverAlt,
            category: item.category || 'Статья',
            publishedAt: item.published_at || item.publishedAt,
            readingTime: item.reading_time || item.readingTime || '5 мин'
          }));
        } else {
          allPublished = contentData?.articles?.items || [];
        }

        // 2. Fallback to local contentData if not found in DB or localStorage
        if (!found && contentData?.articles?.items) {
          const localMatch = contentData.articles.items.find(a => a.slug === slug);
          if (localMatch) {
            found = localMatch;
          }
        }

        if (found) {
          setArticle(found);
          const other = allPublished.filter(a => a.slug !== found.slug).slice(0, 3);
          setRelatedArticles(other);
          applySeoMetadata(found);
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        const localMatch = contentData?.articles?.items?.find(a => a.slug === slug);
        if (localMatch) {
          setArticle(localMatch);
          applySeoMetadata(localMatch);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [slug]);

  // SEO & Head tag Injection
  const applySeoMetadata = (art) => {
    const pageTitle = art.seoTitle ? art.seoTitle : `${art.title} | KSENWEB`;
    const pageDesc = art.metaDescription ? art.metaDescription : art.excerpt;
    const pageCanonical = art.canonicalOverride
      ? art.canonicalOverride
      : `https://www.ksenweb.com/blog/${art.slug}`;
    const pageOgImage = art.ogImage || art.coverImage;
    const pageOgTitle = art.ogTitle || art.seoTitle || art.title;
    const pageOgDesc = art.ogDescription || art.metaDescription || art.excerpt;

    document.title = pageTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = pageDesc;

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageCanonical;

    // Robots directive
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = art.noindex ? 'noindex, nofollow' : 'index, follow';

    // OpenGraph
    const setOgMeta = (property, value) => {
      let og = document.querySelector(`meta[property="${property}"]`);
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.content = value;
    };

    setOgMeta('og:type', 'article');
    setOgMeta('og:title', pageOgTitle);
    setOgMeta('og:description', pageOgDesc);
    setOgMeta('og:url', pageCanonical);
    if (pageOgImage) setOgMeta('og:image', pageOgImage);
    if (art.publishedAt) setOgMeta('article:published_time', art.publishedAt);

    // Schema.org BlogPosting JSON-LD
    let scriptLd = document.getElementById('jsonld-blog-posting');
    if (!scriptLd) {
      scriptLd = document.createElement('script');
      scriptLd.id = 'jsonld-blog-posting';
      scriptLd.type = 'application/ld+json';
      document.head.appendChild(scriptLd);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": art.title,
      "description": pageDesc,
      "image": pageOgImage ? [pageOgImage] : [],
      "datePublished": art.publishedAt || new Date().toISOString(),
      "dateModified": art.updatedAt || art.publishedAt || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": art.author || "Ксения Матвеенко",
        "url": "https://www.ksenweb.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "KSENWEB",
        "url": "https://www.ksenweb.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.ksenweb.com/og-image.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageCanonical
      }
    };
    scriptLd.text = JSON.stringify(schemaData);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#FF5B23] rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h1 className="text-2xl font-light text-zinc-900 mb-2">Статья не найдена</h1>
        <p className="text-zinc-500 text-xs mb-6">Возможно, она была перемещена или удалена.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-black text-white rounded-[2px] text-xs font-medium uppercase tracking-wider"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white">
        <FlickeringGrid flickerChance={0.1} gridGap={6} maxOpacity={0.15} squareSize={4} />
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row bg-transparent font-sans text-zinc-900">
        <Sidebar activeSection="blog" />

        <motion.main
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex-1 w-full lg:w-[calc(100%-260px)] lg:max-w-[calc(100%-260px)] lg:ml-[260px] min-h-screen flex flex-col bg-white min-w-0 overflow-x-clip"
        >
          {/* Main Grid Padding aligned left */}
          <div className="relative py-12 px-6 md:px-12 lg:px-16 max-w-4xl">
            {/* Top Back Button */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-black transition-colors py-2 px-3.5 rounded-[2px] border border-zinc-200 bg-white shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            </div>

            {/* Breadcrumbs Navigation */}
            <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs text-zinc-400 mb-8 overflow-x-auto font-normal">
              <Link to="/" className="hover:text-zinc-900 transition-colors shrink-0">Главная</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link to="/blog" className="hover:text-zinc-900 transition-colors shrink-0">Блог</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-zinc-700 truncate max-w-xs">{article.title}</span>
            </nav>

            {/* Semantic Article */}
            <article className="w-full">
              {/* Header */}
              <header className="mb-10">
                <div className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase mb-3">
                  [ {article.category || 'Статья'} ]
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-black leading-tight mb-6">
                  {article.title}
                </h1>

                <p className="text-zinc-500 text-base lg:text-lg leading-relaxed mb-8 font-normal">
                  {article.excerpt}
                </p>

                {/* Author & Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-100 text-xs text-zinc-500 font-normal">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarImg(contentData?.sidebar?.profile?.avatarUrl)}
                      alt={article.author || "Ксения Матвеенко"}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                    />
                    <div>
                      <div className="font-medium text-zinc-900 text-sm">{article.author || "Ксения Матвеенко"}</div>
                      <div className="text-zinc-400 text-[11px]">Веб-дизайнер & Разработчик</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span>{article.readingTime || '5 мин'}</span>
                    </span>
                  </div>
                </div>
              </header>

              {/* Cover Image */}
              {article.coverImage && (
                <figure className="mb-12 rounded-[2px] overflow-hidden border border-zinc-200 bg-zinc-50">
                  <img
                    src={article.coverImage}
                    alt={article.coverAlt || article.title}
                    className="w-full max-h-[520px] object-cover"
                  />
                </figure>
              )}

              {/* Main Content Body */}
              <div
                className="prose prose-zinc max-w-none 
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900
                  prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-zinc-200 prose-h2:font-bold prose-h2:text-zinc-900
                  prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-semibold prose-h3:text-zinc-900
                  prose-p:text-zinc-700 prose-p:leading-[1.75] prose-p:mb-6 prose-p:text-[14px] sm:prose-p:text-[15px] prose-p:font-normal
                  prose-ul:my-6 prose-ol:my-6 prose-ul:pl-5 prose-ol:pl-5
                  prose-li:text-zinc-700 prose-li:my-2 prose-li:text-[14px] sm:prose-li:text-[15px] prose-li:font-normal
                  prose-blockquote:border-l-4 prose-blockquote:border-[#FF5B23] prose-blockquote:bg-orange-50/40 prose-blockquote:p-4 sm:prose-blockquote:p-5 prose-blockquote:my-8 prose-blockquote:rounded-r prose-blockquote:not-italic prose-blockquote:text-zinc-800 prose-blockquote:text-[14px] sm:prose-blockquote:text-[15px] prose-blockquote:font-medium
                  prose-img:rounded-[2px] prose-img:border prose-img:border-zinc-200 prose-img:my-6 prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: ensureFormattedHtml(article.content) }}
              />

              {/* Dedicated Article CTA Box (Standalone React Component) */}
              <div className="mt-14 p-6 sm:p-8 bg-zinc-50 border border-zinc-200/90 rounded-[4px] shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mb-3">
                  Если вы узнали в этом свой сайт
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-normal max-w-2xl">
                  Если ваш сайт работает, но визуально ощущается слабее бизнеса, я могу посмотреть его ключевые экраны и определить, что имеет смысл менять в первую очередь.
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <a
                    href={contentData?.sidebar?.socialLinks?.telegram || "https://t.me/ksen_web"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF5B23] hover:bg-[#e04f1e] text-white text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 no-underline"
                  >
                    <span>Обсудить задачу / Получить аудит</span>
                    <span className="text-sm font-bold">↗</span>
                  </a>

                  <Link
                    to="/cases"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-[#FF5B23] underline decoration-zinc-300 hover:decoration-[#FF5B23] underline-offset-4 transition-colors no-underline py-1"
                  >
                    <span>Смотреть мои кейсы</span>
                    <span className="text-base">→</span>
                  </Link>
                </div>
              </div>
            </article>

            {/* Back to Blog & Share Row */}
            <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-[2px] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: article.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Ссылка скопирована в буфер обмена!');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-[2px] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться ссылкой</span>
              </button>
            </div>

            {/* Related Articles Section ("Читайте также") */}
            {relatedArticles.length > 0 && (
              <section className="mt-20 pt-12 border-t border-zinc-200">
                <h2 className="text-2xl font-light tracking-tight text-black mb-8">
                  Читайте также
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id || rel.slug}
                      to={`/blog/${rel.slug}`}
                      className="group flex flex-col h-full bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-[2px] overflow-hidden transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                        <img
                          src={rel.coverImage}
                          alt={rel.coverAlt || rel.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          {rel.category}
                        </span>
                        <h3 className="text-sm font-medium text-zinc-900 group-hover:text-[#FF5B23] line-clamp-2 leading-snug mb-2">
                          {rel.title}
                        </h3>
                        <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-zinc-400 font-normal">
                          <span>{rel.readingTime}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.main>
      </div>
    </>
  );
}
