import React, { useState } from 'react';
import { DocItem, EventItem, TeamMember, BonoInfo } from '../types';
import { FileText, Calendar, Users, Ticket, ChevronRight, ArrowLeft, Download, Shield, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { BonoScreen } from './BonoScreen';

interface MasScreenProps {
  documents: DocItem[];
  events: EventItem[];
  team: TeamMember[];
  bonoInfo: BonoInfo;
  isAdminMode: boolean;
  onToggleAdmin: (val: boolean) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

type SubSection = 'menu' | 'documentos' | 'agenda' | 'nosotros' | 'bono';

export const MasScreen: React.FC<MasScreenProps> = ({
  documents,
  events,
  team,
  bonoInfo,
  isAdminMode,
  onToggleAdmin,
  onShowToast,
}) => {
  const [activeSection, setActiveSection] = useState<SubSection>('menu');

  const handleDownloadDoc = (doc: DocItem) => {
    onShowToast(`Descargando "${doc.title}"...`, 'success');
  };

  // Main Category Menu
  if (activeSection === 'menu') {
    return (
      <div id="mas-menu-container" className="flex flex-col gap-5 p-4 animate-fade-in overflow-y-auto max-h-[calc(100vh-140px)] pb-16 bg-gray-50 scrollbar-none">
        
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Más Secciones
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Explorá los documentos oficiales, enterate de los próximos eventos, conocé a tus representantes o el estado del bono contribución.
          </p>
        </div>

        {/* Menu Cards */}
        <div className="flex flex-col gap-3">
          
          {/* Card 1: Documentos */}
          <button
            id="btn-menu-documentos"
            onClick={() => setActiveSection('documentos')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-100 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000] group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-neutral-800 group-hover:text-[#CC0000] transition-colors uppercase tracking-wider">
                Documentos Oficiales
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Estatutos, balances mensuales e informes contables.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
          </button>

          {/* Card 2: Agenda */}
          <button
            id="btn-menu-agenda"
            onClick={() => setActiveSection('agenda')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-100 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000] group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-neutral-800 group-hover:text-[#CC0000] transition-colors uppercase tracking-wider">
                Agenda Escolar
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Asambleas, torneos deportivos y fechas importantes.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
          </button>

          {/* Card 3: Nosotros */}
          <button
            id="btn-menu-nosotros"
            onClick={() => setActiveSection('nosotros')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-100 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000] group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-neutral-800 group-hover:text-[#CC0000] transition-colors uppercase tracking-wider">
                Quiénes Somos (Comisión)
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Conocé a los integrantes de la Comisión Directiva Boomerang.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
          </button>

          {/* Card 4: Bono Contribución */}
          <button
            id="btn-menu-bono"
            onClick={() => setActiveSection('bono')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-100 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000] group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-neutral-800 group-hover:text-[#CC0000] transition-colors uppercase tracking-wider">
                Bono Contribución
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Sorteos, premios y ranking de ventas por curso.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
          </button>

        </div>

        {/* ADMIN MODE TOGGLE SWITCH CARD */}
        <div 
          id="admin-toggle-panel"
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mt-2 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isAdminMode ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
              {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Panel de Administración</span>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed max-w-[180px]">
                Habilitá esto para moderar propuestas, publicar noticias y subir el bono.
              </p>
            </div>
          </div>

          <button
            id="btn-admin-toggle"
            onClick={() => {
              const next = !isAdminMode;
              onToggleAdmin(next);
              onShowToast(
                next ? 'Modo Administrador Activo' : 'Modo Estudiante Activo',
                next ? 'success' : 'info'
              );
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAdminMode ? 'bg-[#CC0000]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isAdminMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </div>
    );
  }

  // --- SUB-VIEWS ---

  // 1. Documentos Sub-View
  if (activeSection === 'documentos') {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-gray-50">
        {/* Back header */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
          <button
            id="btn-back-docs"
            onClick={() => setActiveSection('menu')}
            className="p-1.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-[#CC0000] text-neutral-700 transition-colors cursor-pointer border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#1A1A1A]">Documentos Oficiales</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-16 scrollbar-none">
          {documents.map((doc) => (
            <div
              key={doc.id}
              id={`doc-card-${doc.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000]">
                  <FileText className="w-5 h-5 text-[#CC0000]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 leading-tight pr-2">{doc.title}</span>
                  <span className="text-[10px] font-mono text-gray-400 mt-1">
                    {doc.fileType} • {doc.size} • {doc.date}
                  </span>
                </div>
              </div>
              <button
                id={`btn-download-doc-${doc.id}`}
                onClick={() => handleDownloadDoc(doc)}
                className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-[#CC0000] transition-all cursor-pointer shrink-0 border border-gray-100"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Agenda Escolar Sub-View
  if (activeSection === 'agenda') {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-gray-50">
        {/* Back header */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
          <button
            id="btn-back-agenda"
            onClick={() => setActiveSection('menu')}
            className="p-1.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-[#CC0000] text-neutral-700 transition-colors cursor-pointer border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#1A1A1A]">Agenda & Próximos Eventos</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-16 scrollbar-none">
          {events.map((evt) => (
            <div
              key={evt.id}
              id={`event-card-${evt.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-xs font-extrabold text-[#1a1a1a] leading-tight uppercase tracking-wider">
                  {evt.title}
                </h4>
                <span className="bg-red-50 text-[#CC0000] border border-red-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                  {evt.date.split(',')[0]}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-mono text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#CC0000]/60" />
                  {evt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#CC0000]/60" />
                  {evt.location}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mt-1">
                {evt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Quiénes Somos / Comisión Sub-View
  if (activeSection === 'nosotros') {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-gray-50">
        {/* Back header */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
          <button
            id="btn-back-nosotros"
            onClick={() => setActiveSection('menu')}
            className="p-1.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-[#CC0000] text-neutral-700 transition-colors cursor-pointer border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#1A1A1A]">Mesa Directiva</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-16 scrollbar-none">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col gap-1.5 text-center shadow-sm">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest">Lista Boomerang</h4>
            <span className="text-xs font-bold text-neutral-800">"Un ida y vuelta de ideas"</span>
            <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
              Somos un equipo representativo del Instituto Jóvenes Argentinos, elegidos democráticamente por la comunidad estudiantil para defender tus derechos y construir juntos el colegio que soñamos.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {team.map((member) => (
              <div
                key={member.id}
                id={`team-member-${member.id}`}
                className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-xs font-bold text-neutral-800">{member.name}</span>
                  <span className="text-[10px] text-[#CC0000] font-extrabold uppercase tracking-wide mt-0.5">{member.role}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl text-[9px] text-gray-400 font-mono">
                  MESA CEC
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Bono Contribución Sub-View
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-gray-50">
      {/* Back header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
        <button
          id="btn-back-bono"
          onClick={() => setActiveSection('menu')}
          className="p-1.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-[#CC0000] text-neutral-700 transition-colors cursor-pointer border border-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-extrabold tracking-wider uppercase text-[#1A1A1A]">Bono Contribución</span>
      </div>

      <div className="flex-1 min-h-0">
        <BonoScreen bonoInfo={bonoInfo} />
      </div>
    </div>
  );
};
