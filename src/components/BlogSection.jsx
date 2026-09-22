import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import contentData from '../contentData';
import { supabase } from '../lib/supabaseClient';

const EASE = [0.215, 0.610, 0.355, 1.000];

export default function BlogSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map(item => ({
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
          setArticles(formatted);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error('Error fetching blog articles for section:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // We ensure a 3-slot grid is always rendered
  const slots = [0, 1, 2];

  return (
    <section
      id="blog"
      className="relative py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100 bg-white"
    >
      {/* Background Coordinate Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-4 gap-0">
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
        <div className="border-l border-neutral-200/30 h-full" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0, margin: "200px 0px 0px 0px" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-black mb-0"
              >
                {contentData?.articles?.title || "Полезные материалы и разборы"}
              </motion.h2>
            </div>
            <p className="text-[14.5px] text-zinc-500 max-w-[500px] leading-relaxed mt-3">
              {contentData?.articles?.subtitle || "Разборы веб-дизайна, разработки на Tilda и React, интерфейсов и ИИ-технологий."}
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-[2px] transition-colors shadow-sm shrink-0 self-start md:self-end"
          >
            <span>Все статьи блога</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Column Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-96 rounded-[2px] bg-zinc-100 animate-pulse border border-zinc-200/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((index) => {
              const article = articles[index];

              if (article) {
                return (
                  <motion.div
                    key={article.id || article.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
                  >
                    <Link
                      to={`/blog/${article.slug}`}
                      className="group flex flex-col h-full bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-[2px] overflow-hidden transition-all duration-300 hover:shadow-sm"
                    >
                      {/* Image Container */}
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

                      {/* Content Container */}
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

                        <h3 className="text-[17px] font-medium text-zinc-900 group-hover:text-[#FF5B23] transition-colors duration-200 line-clamp-2 leading-snug mb-2">
                          {article.title}
                        </h3>

                        <p className="text-[13px] font-normal text-zinc-500 line-clamp-3 leading-relaxed mb-6 flex-1">
                          {article.excerpt}
                        </p>

                        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto text-xs font-medium text-zinc-900 group-hover:text-[#FF5B23]">
                          <span>Читать статью</span>
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              }

              // Empty slot reserved for future articles
              return (
                <div
                  key={`empty-${index}`}
                  className="hidden md:flex flex-col items-center justify-center border border-dashed border-zinc-200/80 rounded-[2px] bg-zinc-50/20 p-8 text-center text-zinc-400 min-h-[380px]"
                >
                  <span className="text-[11px] font-mono tracking-widest text-zinc-300 uppercase mb-2">
                    [ СЛОТ 0{index + 1} ]
                  </span>
                  <p className="text-xs font-normal text-zinc-400 max-w-[180px] leading-relaxed">
                    Скоро здесь появится новая статья
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
