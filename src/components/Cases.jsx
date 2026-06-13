import React from 'react';
import contentData from '../contentData';

export default function Cases() {
  const cases = contentData.cases.items;

  return (
    <section id="cases" className="py-20 px-6 md:px-12 lg:px-16 border-b border-zinc-100">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-10">
        {contentData.cases.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cases.map((project, idx) => {
          const caseNumber = String(idx + 1).padStart(2, '0');
          return (
            <article
              key={idx}
              className="bg-gray-50/50 rounded-3xl p-4 flex flex-col justify-between group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 cursor-pointer"
            >
              <div>
                {/* Внутренний таб-индекс */}
                <span className="text-[11px] font-medium tracking-wider text-gray-400 uppercase mb-3 block">
                  [ Кейс {caseNumber} ]
                </span>

                {/* Графический контейнер с эффектом увеличения при ховере */}
                <div className="relative overflow-hidden aspect-[4/3] rounded-2xl bg-zinc-50 border border-zinc-150/50 transition-all duration-500 group-hover:scale-[1.02]">
                  
                  {/* Слой 1: Основное фото (Статика) */}
                  <img
                    src={project.imageMain}
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out scale-100 md:group-hover:opacity-0 md:group-hover:scale-105"
                  />

                  {/* Слой 2: Второе фото + Затемнение (Hover, только на десктопе) */}
                  <div className="hidden md:block absolute inset-0 w-full h-full transition-all duration-700 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 overflow-hidden">
                    <img
                      src={project.imageHover}
                      alt={`${project.name} preview`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  {/* Слой 3: Стеклянные баджи (Видимы всегда, в нижнем левом углу) */}
                  <div className="absolute bottom-4 left-4 flex flex-row flex-wrap gap-2 z-10">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Слой 4: Ссылка «Смотреть кейс» (Появляется при ховере на десктопе) */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-center transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-20 bg-black/10 backdrop-blur-sm">
                    <span className="text-white font-medium text-base border border-white/30 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-lg">
                      Смотреть кейс →
                    </span>
                  </div>

                </div>
              </div>

              {/* Нижняя текстовая часть */}
              <div className="flex flex-col">
                <h3 className="mt-4 text-base md:text-lg font-normal text-black flex items-center justify-between gap-2 w-full">
                  <span>{project.name}</span>
                  <span className="text-gray-300 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-sm shrink-0">
                    ↗
                  </span>
                </h3>
                
                {/* Адаптивная ссылка для мобильных устройств */}
                <a
                  href={project.link || "#"}
                  className="block md:hidden mt-2 text-sm font-medium text-zinc-800 hover:text-zinc-650 underline decoration-zinc-300 underline-offset-4"
                >
                  Смотреть кейс →
                </a>
              </div>

            </article>
          );
        })}
      </div>
    </section>
  );
}
