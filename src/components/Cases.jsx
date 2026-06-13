import React from 'react';
import { motion } from 'framer-motion';
import contentData from '../contentData';

export default function Cases() {
  const cases = contentData.cases.items;

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  return (
    <motion.section
      id="cases"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
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
        <div className="overflow-hidden mb-10">
          <motion.h2
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-black mb-0"
          >
            {contentData.cases.title}
          </motion.h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cases.map((project, idx) => {
            const caseNumber = String(idx + 1).padStart(2, '0');
            return (
              <motion.article
                key={idx}
                variants={cardVariants}
                className="bg-gray-50/40 border border-neutral-200/80 rounded-sm p-3 flex flex-col justify-between group cursor-pointer transition-all duration-500 ease-out hover:bg-white hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              >
                <div>
                  {/* Внутренний таб-индекс */}
                  <span className="text-[10px] font-semibold tracking-wider text-[#FF5B23] uppercase mb-3 block">
                    [ Кейс {caseNumber} ]
                  </span>

                  {/* Графический контейнер с эффектом увеличения при ховере */}
                  <div className="relative overflow-hidden aspect-[4/3] rounded-sm bg-zinc-50 border border-zinc-100/50">

                    {/* Слой 1: Основное фото (Статика с зумом при ховере) */}
                    <img
                      src={project.imageMain}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Слой 3: Стеклянные баджи (Видимы всегда, в нижнем левом углу) */}
                    <div className="absolute bottom-3 left-3 flex flex-row flex-wrap gap-1.5 z-10">
                      {project.tags.map((tag, tIdx) => {
                        const isFirst = tIdx === 0;
                        return (
                          <span
                            key={tIdx}
                            className={`backdrop-blur-md text-[10px] px-2.5 py-1 rounded-sm shadow-sm tracking-wide uppercase font-medium ${
                              isFirst
                                ? 'bg-[#E0FB4A]/90 border border-[#E0FB4A]/30 text-zinc-950 font-semibold'
                                : 'bg-white/10 border border-white/20 text-white'
                            }`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Нижняя текстовая часть */}
                <div className="flex flex-col pt-5 mt-1">
                  <h3 className="text-xl md:text-2xl font-light tracking-tight text-black flex items-center justify-between gap-2 w-full">
                    <span>{project.name}</span>
                    <span className="text-gray-300 transition-all duration-300 text-sm shrink-0 group-hover:text-[#FF5B23] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </h3>

                  {/* Адаптивная ссылка для мобильных устройств */}
                  <a
                    href={project.link || "#"}
                    className="block md:hidden mt-2 text-sm font-medium text-zinc-800 hover:text-zinc-600 underline decoration-zinc-300 underline-offset-4"
                  >
                    Смотреть кейс →
                  </a>
                </div>

              </motion.article>
          );
        })}
      </motion.div>
      </div>
    </motion.section>
  );
}
