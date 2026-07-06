import React, { useState, useEffect } from 'react';
import { NewsItem, BannerConfig } from '../types';
import { Megaphone, X, Calendar, ArrowRight } from 'lucide-react';

interface InicioScreenProps {
  news: NewsItem[];
  banner: BannerConfig | null;
  onOpenNews: (item: NewsItem) => void;
}

export const InicioScreen: React.FC<InicioScreenProps> = ({ news, banner, onOpenNews }) => {
  const [dismissed, setDismissed] = useState(false);

  // Reset the session dismissal if the admin publishes a new banner message
  useEffect(() => {
    setDismissed(false);
  }, [banner?.bannerTexto]);

  const featuredItem = news.find(n => n.featured) || news[0];
  const regularNews = news.filter(n => !n.featured || n.id !== featuredItem?.id);

  const showBanner = !!banner?.bannerActivo && !dismissed;

  return (
    <div id="inicio-screen-container" className="flex flex-col gap-5 p-4 animate-fade-in overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Dismissible Promoted/Featured Banner - Styled according to Sleek Interface */}
      {showBanner && (
        <div
          id="featured-banner-dismissible"
          className="relative bg-white border border-gray-100 p-3.5 rounded-2xl flex items-start gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300"
        >
          <span className="bg-[#CC0000] text-white text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0">
            DESTACADO
          </span>
          <div className="flex-1 pr-4">
            <p className="text-[11px] text-neutral-800 font-bold leading-normal">
              {banner!.bannerTexto}
            </p>
          </div>
          <button
            id="btn-close-banner"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-[#CC0000] transition-colors self-start p-0.5 absolute top-3 right-3"
            title="Cerrar anuncio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Featured News Hero Card */}
      {featuredItem && (
        <div id="featured-news-hero" className="flex flex-col gap-2">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
            Noticia Principal
          </h3>
          <div 
            id={`news-card-featured-${featuredItem.id}`}
            onClick={() => onOpenNews(featuredItem)}
            className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-red-100 hover:shadow-md transition-all duration-300 shadow-sm cursor-pointer"
          >
            {/* Dark image overlay */}
            <div className="relative h-44 overflow-hidden">
              <img 
                src={featuredItem.image} 
                alt={featuredItem.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <span className="absolute top-3 left-3 bg-[#CC0000] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                Estudiantil
              </span>
            </div>
            <div className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-1 text-[10px] text-[#CC0000] font-bold font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {featuredItem.date}
              </div>
              <h4 className="text-base font-extrabold text-[#1A1A1A] tracking-tight group-hover:text-[#CC0000] transition-colors leading-snug">
                {featuredItem.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {featuredItem.description}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-[#CC0000] mt-1 group-hover:underline">
                Leer noticia completa
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOVEDADES - Vertical list of news */}
      <div id="news-section-list" className="flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Novedades
          </h3>
          <span className="text-[10px] font-mono text-gray-400">
            {regularNews.length} publicaciones
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {regularNews.map((item) => (
            <div
              key={item.id}
              id={`news-card-${item.id}`}
              onClick={() => onOpenNews(item)}
              className="flex gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-red-100 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm group"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center py-0.5 min-w-0">
                <span className="text-[9px] font-bold text-[#CC0000] font-mono mb-1">
                  {item.date.toUpperCase()}
                </span>
                <h4 className="text-[13px] font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#CC0000] transition-colors leading-tight mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Simple footer margin */}
      <div className="h-4" />
    </div>
  );
};

// Detailed News view component
interface NewsDetailProps {
  item: NewsItem;
  onClose: () => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ item, onClose }) => {
  return (
    <div id="news-detail-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div 
        id={`news-detail-panel-${item.id}`}
        className="bg-white border border-gray-100 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto flex flex-col text-neutral-800 shadow-2xl animate-slide-up"
      >
        {/* Banner image with Close button overlay */}
        <div className="relative h-48 sm:h-52 overflow-hidden shrink-0 bg-gray-100">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
          <button
            id="btn-close-news-detail"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-[#CC0000] p-2 rounded-full border border-white/10 transition-all text-white"
            title="Cerrar noticia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#CC0000] font-bold">
            <span className="bg-red-50 text-[#CC0000] px-2 py-0.5 rounded border border-red-100">
              NOVEDAD
            </span>
            <span>{item.date}</span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] leading-snug">
            {item.title}
          </h2>

          <div className="h-[1px] bg-gray-100 my-1" />

          <p className="text-xs text-neutral-800 font-bold leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/55">
            {item.description}
          </p>

          <div className="text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed flex flex-col gap-3">
            {item.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              id="btn-news-detail-close-bottom"
              onClick={onClose}
              className="bg-[#1A1A1A] hover:bg-[#CC0000] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
