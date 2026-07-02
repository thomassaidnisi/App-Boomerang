import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  isHome?: boolean;
}

export const BoomerangLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg 
    className={`${className} text-white transform -rotate-12 transition-transform hover:rotate-12 duration-500`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* High fidelity boomerang silhouette */}
    <path 
      d="M3 21c5-8 11-11 18-9L19 3C11 3 5 8 3 21z" 
      fill="currentColor" 
      fillOpacity="0.15"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ 
  showBack = false, 
  onBack, 
  title = "Boomerang", 
  isHome = false 
}) => {
  if (isHome) {
    return (
      <div 
        id="home-hero-header"
        className="relative overflow-hidden bg-gradient-to-br from-[#CC0000] to-[#1A1A1A] px-6 pt-8 pb-8 rounded-b-[32px] text-white shadow-lg shrink-0"
      >
        {/* Subtle geometric grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold tracking-widest text-red-200 uppercase opacity-80">
                CENTRO DE ESTUDIANTES · IJA
              </span>
              <h1 className="text-3xl font-black tracking-tighter">
                {title}
              </h1>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md shadow-sm transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <BoomerangLogo className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs font-medium text-red-100/90 italic tracking-wide pl-0.5">
            "Un ida y vuelta de ideas"
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 border border-white/10 text-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              Estudiantes Activos
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#CC0000]/60 border border-[#CC0000]/30 text-white">
              IJA Córdoba
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="app-top-bar"
      className="sticky top-0 z-40 flex items-center justify-between bg-[#1A1A1A] px-4 py-4 text-white border-b border-neutral-900 shadow-md"
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            id="btn-header-back"
            onClick={onBack}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#CC0000] text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="bg-[#CC0000] p-1.5 rounded-lg">
            <BoomerangLogo className="w-5 h-5 text-white" />
          </div>
        )}
        <h2 className="text-lg font-bold tracking-tight">
          {title}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
        <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">IJA</span>
      </div>
    </div>
  );
};
