import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import Sidebar from './Sidebar';
import contentData from '../contentData';
import { supabase } from '../lib/supabaseClient';
import { FlickeringGrid } from "./ui/FlickeringGrid";

const EASE = [0.215, 0.610, 0.355, 1.000];

export default function BlogPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Dynamic SEO Metadata for /blog
    document.title = "Блог о веб-дизайне, разработке сайтов и ИИ | KSENWEB";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Полезные статьи и материалы для владельцев бизнеса: как сделать сайт эффективным, избежать ошибок в дизайне и выстроить системные продажи в сети.";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://www.ksenweb.com/blog';

    window.scrollTo(0, 0);

    const fetchArticles = async () => {
      try {
        let cached = null;
        try {
          const cachedStr = localStorage.getItem('site_blog_articles');
          if (cachedStr) {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              cached = parsed.map(item => ({
                id: item.id,
                slug: item.slug,
                title: item.title,
                excerpt: item.excerpt,
                coverImage: item.cover_image || item.coverImage,
                coverAlt: item.cover_alt || item.coverAlt,
                category: item.category || 'Статья',
                tags: item.tags || [],
                publishedAt: item.published_at || item.publishedAt,
                readingTime: item.reading_time || item.readingTime || '5 мин'
              }));
            }
          }
        } catch (e) {}

        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            coverImage: item.cover_image || item.coverImage,
            coverAlt: item.cover_alt || item.coverAlt,
            category: item.category || 'Статья',
            tags: item.tags || [],
            publishedAt: item.published_at || item.publishedAt,
            readingTime: item.reading_time || item.readingTime || '5 мин'
          }));
          setArticles(formatted);
        } else if (cached) {
          setArticles(cached);
        } else {
          setArticles(contentData?.articles?.items || []);
        }
      } catch (err) {
        console.error('Error loading blog articles:', err);
        const cachedStr = localStorage.getItem('site_blog_articles');
        if (cachedStr) {
          try {
            setArticles(JSON.parse(cachedStr));
          } catch (e) {
            setArticles(contentData?.articles?.items || []);
          }
        } else {
          setArticles(contentData?.articles?.items || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    return searchQuery.trim() === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

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
          <div className="relative py-12 px-6 md:px-12 lg:px-16">
            {/* Top Navigation Back Button */}
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

            {/* Page Header */}
            <div className="mb-12 border-b border-zinc-150 pb-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-black mb-4">
                Блог & Гайды
              </h1>
              <p className="text-[14.5px] text-zinc-500 max-w-2xl leading-relaxed">
                Полезные статьи и материалы для владельцев бизнеса: как сделать сайт эффективным, избежать ошибок в дизайне и выстроить системные продажи в сети.
              </p>

              {/* Search Bar */}
              <div className="mt-8 relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Поиск по статьям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-[2px] text-xs focus:outline-none focus:border-black font-normal transition-colors"
                />
              </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-[2px] bg-zinc-100 animate-pulse border border-zinc-200/60" />
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-zinc-200 rounded-[2px] bg-zinc-50/50">
                <p className="text-zinc-500 text-xs font-normal">Ничего не найдено по вашему запросу.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-medium text-[#FF5B23] hover:underline cursor-pointer"
                >
                  Сбросить поиск
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id || article.slug}
                    to={`/blog/${article.slug}`}
                    className="group flex flex-col h-full bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-[2px] overflow-hidden transition-all duration-300 hover:shadow-sm"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                      <img
                        src={article.coverImage}
                        alt={article.coverAlt || article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-[2px] text-[10px] font-mono text-zinc-800 tracking-wider uppercase">
                        {article.category}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-4 text-xs text-zinc-400 font-normal mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readingTime}
                        </span>
                      </div>

                      <h2 className="text-[17px] font-medium text-zinc-900 group-hover:text-[#FF5B23] transition-colors duration-200 line-clamp-2 leading-snug mb-2">
                        {article.title}
                      </h2>

                      <p className="text-[13px] font-normal text-zinc-500 line-clamp-3 leading-relaxed mb-6 flex-1">
                        {article.excerpt}
                      </p>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto text-xs font-medium text-zinc-900 group-hover:text-[#FF5B23]">
                        <span>Читать статью</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.main>
      </div>
    </>
  );
}
