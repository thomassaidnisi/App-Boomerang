import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Proposal, ProposalStatus } from '../types';
import { Plus, ThumbsUp, ThumbsDown, Filter, Calendar, User, MessageCircle, ChevronRight, X, Clock, HelpCircle, CheckCircle } from 'lucide-react';

// Zod schema for proposal submission
const proposalSchema = z.object({
  title: z.string()
    .min(6, { message: 'El título debe tener al menos 6 caracteres' })
    .max(50, { message: 'El título no puede superar los 50 caracteres' }),
  description: z.string()
    .min(15, { message: 'Explicá tu propuesta con más detalle (mínimo 15 caracteres)' })
    .max(400, { message: 'La descripción no puede superar los 400 caracteres' }),
  course: z.string().min(1, { message: 'Seleccioná tu curso' }),
  author: z.string()
    .min(3, { message: 'Ingresá tu nombre o "Anónimo"' })
    .max(30, { message: 'El nombre es demasiado largo' }),
});

type ProposalFormInput = z.infer<typeof proposalSchema>;

interface PropuestasScreenProps {
  proposals: Proposal[];
  onCreateProposal: (proposal: Omit<Proposal, 'id' | 'date' | 'upvotes' | 'downvotes' | 'userVote' | 'responses'>) => void;
  onVoteProposal: (id: string, type: 'up' | 'down') => void;
}

export const PropuestasScreen: React.FC<PropuestasScreenProps> = ({ 
  proposals, 
  onCreateProposal, 
  onVoteProposal 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | 'Todas'>('Todas');
  const [activeDetailProposal, setActiveDetailProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter chips
  const filterStatuses: (ProposalStatus | 'Todas')[] = [
    'Todas', 'Recibida', 'En análisis', 'En el CEC', 'Resuelta', 'Archivada'
  ];

  const filteredProposals = proposals.filter(p => 
    selectedStatus === 'Todas' ? true : p.status === selectedStatus
  );

  const getStatusStyle = (status: ProposalStatus) => {
    switch (status) {
      case 'Recibida':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'En análisis':
        return 'bg-red-50 text-[#CC0000] border border-red-100';
      case 'En el CEC':
        return 'bg-[#1A1A1A] text-white border border-[#1A1A1A]';
      case 'Resuelta':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Archivada':
        return 'bg-gray-100 text-gray-400 border border-gray-200';
    }
  };

  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<ProposalFormInput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      description: '',
      course: '',
      author: ''
    }
  });

  const onSubmitForm = (data: ProposalFormInput) => {
    onCreateProposal({
      title: data.title,
      description: data.description,
      course: data.course,
      author: data.author,
      status: 'Recibida'
    });
    reset();
    setShowCreateModal(false);
  };

  const courses = [
    '1° Año A', '1° Año B', '2° Año A', '2° Año B', '3° Año A', '3° Año B',
    '4° Año A Naturales', '4° Año B Economía', '4° Año C Sociales',
    '5° Año A Comunicación', '5° Año B Economía', '5° Año C Sociales',
    '6° Año A Naturales', '6° Año B Sociales'
  ];

  return (
    <div id="propuestas-screen-container" className="flex flex-col h-[calc(100vh-140px)] relative bg-gray-50">
      
      {/* Scrollable filters & list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-20 scrollbar-none">
        
        {/* Intro */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Propuestas Estudiantiles
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tu espacio para proponer mejoras en el IJA. Votá las ideas de tus compañeros o cargá tu propia propuesta.
          </p>
        </div>

        {/* Filter Chips - Horizontal Scrolling */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {filterStatuses.map((status) => (
            <button
              key={status}
              id={`filter-chip-${status.replace(/\s+/g, '-')}`}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                selectedStatus === status 
                  ? 'bg-[#CC0000] text-white shadow-[0_2px_8px_rgba(204,0,0,0.2)]' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:text-[#1A1A1A] hover:bg-gray-50 shadow-sm'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div id="propuestas-empty-state" className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
            {/* SVG Illustration in Red/Black */}
            <svg className="w-16 h-16 text-[#CC0000]/40 opacity-80 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
              <path d="M12 8v4" strokeLinecap="round" />
              <path d="M12 16h.01" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-neutral-800">No se encontraron propuestas</h4>
              <p className="text-xs text-gray-400 max-w-xs">
                Sé el primero en proponer una idea para tu curso o elegí otro filtro arriba.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredProposals.map((prop) => (
              <div
                key={prop.id}
                id={`proposal-card-${prop.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-red-100 hover:shadow-md transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${getStatusStyle(prop.status)}`}>
                    {prop.status}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{prop.date}</span>
                </div>

                {/* Body */}
                <div 
                  id={`proposal-trigger-${prop.id}`}
                  onClick={() => {
                    setActiveDetailProposal(prop);
                  }}
                  className="cursor-pointer flex flex-col gap-1"
                >
                  <h4 className="text-[14px] font-extrabold text-[#1A1A1A] group-hover:text-[#CC0000] transition-colors leading-snug">
                    {prop.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {prop.description}
                  </p>
                  <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-[#CC0000]" />
                    {prop.author} • {prop.course}
                  </div>
                </div>

                <div className="h-[1px] bg-gray-50 my-1" />

                {/* Footer Controls (Voting) */}
                <div className="flex justify-between items-center">
                  <button
                    id={`btn-open-detail-${prop.id}`}
                    onClick={() => setActiveDetailProposal(prop)}
                    className="text-[11px] font-bold text-[#CC0000] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Ver historial
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Upvote */}
                    <button
                      id={`btn-upvote-${prop.id}`}
                      onClick={() => onVoteProposal(prop.id, 'up')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        prop.userVote === 'up'
                          ? 'bg-[#CC0000] border-[#CC0000] text-white'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-[#CC0000] hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{prop.upvotes}</span>
                    </button>

                    {/* Downvote */}
                    <button
                      id={`btn-downvote-${prop.id}`}
                      onClick={() => onVoteProposal(prop.id, 'down')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        prop.userVote === 'down'
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-[#CC0000] hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{prop.downvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON (+) */}
      <button
        id="btn-fab-create-proposal"
        onClick={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6 bg-[#CC0000] hover:bg-red-700 text-white p-4 rounded-full shadow-[0_4px_16px_rgba(204,0,0,0.3)] transition-all transform hover:scale-110 active:scale-95 duration-200 z-30 cursor-pointer border border-[#CC0000]"
        title="Crear nueva propuesta"
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>

      {/* PROPOSAL DETAIL MODAL */}
      {activeDetailProposal && (
        <div id="proposal-detail-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div 
            id={`proposal-detail-panel-${activeDetailProposal.id}`}
            className="bg-white border border-gray-100 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto flex flex-col text-neutral-800 shadow-2xl animate-slide-up"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono tracking-widest text-[#CC0000] font-extrabold">DETALLES DE PROPUESTA</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full max-w-max ${getStatusStyle(activeDetailProposal.status)}`}>
                  {activeDetailProposal.status}
                </span>
              </div>
              <button
                id="btn-close-proposal-detail"
                onClick={() => setActiveDetailProposal(null)}
                className="text-gray-400 hover:text-white p-1 bg-gray-100 hover:bg-[#CC0000] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-extrabold text-[#1A1A1A] leading-snug">
                  {activeDetailProposal.title}
                </h3>
                <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#CC0000]" />
                  <span>Subido por: <strong>{activeDetailProposal.author}</strong></span>
                  <span>•</span>
                  <span>{activeDetailProposal.course}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                {activeDetailProposal.description}
              </div>

              {/* Status Timeline */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
                  Línea de Progreso
                </h4>
                <div className="relative pl-6 flex flex-col gap-5 border-l-2 border-gray-100 ml-2 py-1">
                  
                  {/* Step 1: Recibida */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 bg-white p-1 rounded-full border border-gray-200">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800">1. Propuesta Recibida</span>
                      <span className="text-[10px] text-gray-400">Registrada el {activeDetailProposal.date}</span>
                    </div>
                  </div>

                  {/* Step 2: En análisis */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 bg-white p-1 rounded-full border border-gray-200">
                      {['En análisis', 'En el CEC', 'Resuelta', 'Archivada'].includes(activeDetailProposal.status) ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${['En análisis', 'En el CEC', 'Resuelta', 'Archivada'].includes(activeDetailProposal.status) ? 'text-neutral-800' : 'text-gray-400'}`}>
                        2. Análisis del CEC Boomerang
                      </span>
                      <span className="text-[10px] text-gray-400">Evaluación de viabilidad técnica y consenso general.</span>
                    </div>
                  </div>

                  {/* Step 3: Presentación al Colegio (En el CEC/Directivos) */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 bg-white p-1 rounded-full border border-gray-200">
                      {['En el CEC', 'Resuelta', 'Archivada'].includes(activeDetailProposal.status) ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${['En el CEC', 'Resuelta', 'Archivada'].includes(activeDetailProposal.status) ? 'text-neutral-800' : 'text-gray-400'}`}>
                        3. Mesa de Enlace y Negociación
                      </span>
                      <span className="text-[10px] text-gray-400">Presentada ante Dirección y Cooperadora de IJA.</span>
                    </div>
                  </div>

                  {/* Step 4: Resolution */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 bg-white p-1 rounded-full border border-gray-200">
                      {activeDetailProposal.status === 'Resuelta' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : activeDetailProposal.status === 'Archivada' ? (
                        <X className="w-3 h-3 text-red-500" />
                      ) : (
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${activeDetailProposal.status === 'Resuelta' ? 'text-emerald-600' : activeDetailProposal.status === 'Archivada' ? 'text-red-500' : 'text-gray-400'}`}>
                        4. Resolución Final
                      </span>
                      <span className="text-[10px] text-gray-400">Aprobación, archivo fundamentado o ejecución completa.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Official response */}
              {activeDetailProposal.responses.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
                    Respuesta Oficial del CEC
                  </h4>
                  {activeDetailProposal.responses.map((resp, i) => (
                    <div key={i} className="bg-red-50/50 border-l-4 border-[#CC0000] p-4 rounded-r-xl border border-red-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-extrabold text-[#CC0000]">{resp.responder}</span>
                        <span className="text-[9px] font-mono text-gray-400">{resp.date}</span>
                      </div>
                      <p className="text-xs text-neutral-800 leading-relaxed font-semibold">
                        {resp.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center text-xs text-gray-400 italic">
                  Todavía no hay respuestas oficiales cargadas para esta propuesta.
                </div>
              )}

              {/* Bottom vote button inside detail */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                <span className="text-xs text-gray-500 font-bold">¿Qué te parece la idea?</span>
                <div className="flex gap-2">
                  <button
                    id={`btn-detail-upvote-${activeDetailProposal.id}`}
                    onClick={() => {
                      onVoteProposal(activeDetailProposal.id, 'up');
                      // Local sync to avoid stale view
                      const fresh = proposals.find(p => p.id === activeDetailProposal.id);
                      if (fresh) setActiveDetailProposal(fresh);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activeDetailProposal.userVote === 'up'
                        ? 'bg-[#CC0000] border-[#CC0000] text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-[#CC0000]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activeDetailProposal.upvotes}</span>
                  </button>

                  <button
                    id={`btn-detail-downvote-${activeDetailProposal.id}`}
                    onClick={() => {
                      onVoteProposal(activeDetailProposal.id, 'down');
                      // Local sync to avoid stale view
                      const fresh = proposals.find(p => p.id === activeDetailProposal.id);
                      if (fresh) setActiveDetailProposal(fresh);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activeDetailProposal.userVote === 'down'
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-[#CC0000]'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{activeDetailProposal.downvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROPOSAL FORM DIALOG */}
      {showCreateModal && (
        <div id="proposal-create-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div 
            id="proposal-create-panel"
            className="bg-white border border-gray-100 w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col text-neutral-800 shadow-2xl animate-zoom-in"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="bg-[#CC0000] p-1.5 rounded-lg">
                  <Plus className="w-4 h-4 text-white stroke-[3px]" />
                </div>
                <h3 className="text-base font-black text-neutral-900">Nueva Propuesta</h3>
              </div>
              <button
                id="btn-close-create-modal"
                onClick={() => {
                  reset();
                  setShowCreateModal(false);
                }}
                className="text-gray-400 hover:text-white p-1 bg-gray-100 hover:bg-[#CC0000] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitForm)} className="p-5 flex flex-col gap-4">
              
              {/* Author */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Tu nombre y apellido (o "Anónimo")
                </label>
                <input
                  id="input-author"
                  type="text"
                  placeholder="Ej: Bautista Rossi (o 'Anónimo')"
                  {...register('author')}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]/20 transition-colors shadow-sm"
                />
                {errors.author && (
                  <span id="error-author" className="text-[10px] text-[#CC0000] font-bold">{errors.author.message}</span>
                )}
              </div>

              {/* Course */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  División / Curso
                </label>
                <select
                  id="select-course"
                  {...register('course')}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]/20 transition-colors shadow-sm appearance-none"
                >
                  <option value="">-- Seleccioná tu curso --</option>
                  {courses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.course && (
                  <span id="error-course" className="text-[10px] text-[#CC0000] font-bold">{errors.course.message}</span>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Título de la propuesta
                </label>
                <input
                  id="input-title"
                  type="text"
                  placeholder="Ej: Dispensers de agua fría/calor..."
                  {...register('title')}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]/20 transition-colors shadow-sm"
                />
                {errors.title && (
                  <span id="error-title" className="text-[10px] text-[#CC0000] font-bold">{errors.title.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Descripción detallada
                </label>
                <textarea
                  id="textarea-description"
                  rows={4}
                  placeholder="Escribí de qué se trata la propuesta, qué problema soluciona y cómo la llevarías a cabo..."
                  {...register('description')}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]/20 transition-colors resize-none shadow-sm"
                />
                {errors.description && (
                  <span id="error-description" className="text-[10px] text-[#CC0000] font-bold">{errors.description.message}</span>
                )}
              </div>

              <div className="h-[1px] bg-gray-100 my-1" />

              <div className="flex gap-3 justify-end mt-2">
                <button
                  id="btn-cancel-create"
                  type="button"
                  onClick={() => {
                    reset();
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-proposal"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#CC0000] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-[0_2px_8px_rgba(204,0,0,0.2)] cursor-pointer"
                >
                  Enviar Propuesta 🪃
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
