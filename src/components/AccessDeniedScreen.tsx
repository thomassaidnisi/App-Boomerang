import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedScreenProps {
  onBack: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ onBack }) => {
  return (
    <div
      id="access-denied-screen"
      className="flex flex-col items-center justify-center h-full bg-white px-8 py-14 gap-6 animate-fade-in text-center"
    >
      <div className="bg-red-50 p-4 rounded-3xl">
        <ShieldAlert className="w-10 h-10 text-[#CC0000]" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-black text-[#1A1A1A]">Acceso Denegado</h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-[260px]">
          Tu email no está autorizado. Contactá al Centro de Estudiantes Boomerang.
        </p>
        <p className="text-xs font-bold text-[#CC0000] mt-1">cec.boomerang@ija.edu.ar</p>
      </div>

      <button
        id="btn-access-denied-back"
        onClick={onBack}
        className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>
    </div>
  );
};
