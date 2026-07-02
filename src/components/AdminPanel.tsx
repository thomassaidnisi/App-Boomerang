import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Proposal, Vote, NewsItem, BonoInfo, ProposalStatus } from '../types';
import { LayoutDashboard, FileText, Newspaper, BarChart2, CheckSquare, Save, Plus, Trash, Check, X, Megaphone, Edit3 } from 'lucide-react';

interface AdminPanelProps {
  proposals: Proposal[];
  votes: Vote[];
  news: NewsItem[];
  bonoInfo: BonoInfo;
  onUpdateProposalStatus: (id: string, status: ProposalStatus, responseText?: string) => void;
  onPublishNews: (newsItem: Omit<NewsItem, 'id' | 'date' | 'featured'>) => void;
  onUpdateBonoSales: (course: string, sales: number) => void;
  onCreateVote: (question: string, options: string[], expiresDays: number) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

type AdminSubTab = 'stats' | 'proposals' | 'news' | 'bono' | 'vote';

// Zod schemas for forms
const newsSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres').max(45, 'Máximo 45 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(150, 'Máximo 150 caracteres'),
  content: z.string().min(20, 'Mínimo 20 caracteres'),
  image: z.string().url('Ingresá una URL de imagen válida (ej: Unsplash)'),
});

const voteSchema = z.object({
  question: z.string().min(8, 'La pregunta debe tener al menos 8 caracteres'),
  options: z.array(z.object({
    text: z.string().min(2, 'Opción requerida')
  })).min(2, 'Mínimo 2 opciones').max(4, 'Máximo 4 opciones'),
  expiresDays: z.number().min(1, 'Mínimo 1 día').max(30, 'Máximo 30 días'),
});

export const AdminPanel: React.FC<AdminPanelProps> = ({
  proposals,
  votes,
  news,
  bonoInfo,
  onUpdateProposalStatus,
  onPublishNews,
  onUpdateBonoSales,
  onCreateVote,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('stats');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [responseInput, setResponseInput] = useState('');

  // 1. Publish News Form Setup
  const {
    register: regNews,
    handleSubmit: handleSubNews,
    reset: resetNews,
    formState: { errors: errorsNews }
  } = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600'
    }
  });

  const onSubmitNews = (data: any) => {
    onPublishNews({
      title: data.title,
      description: data.description,
      content: data.content,
      image: data.image
    });
    onShowToast('¡Noticia publicada con éxito!', 'success');
    resetNews();
  };

  // 2. Create Vote Form Setup
  const {
    register: regVote,
    control: controlVote,
    handleSubmit: handleSubVote,
    reset: resetVote,
    formState: { errors: errorsVote }
  } = useForm({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      question: '',
      options: [{ text: '' }, { text: '' }],
      expiresDays: 7
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: controlVote,
    name: 'options'
  });

  const onSubmitVote = (data: any) => {
    const optionTexts = data.options.map((o: any) => o.text);
    onCreateVote(data.question, optionTexts, data.expiresDays);
    onShowToast('¡Votación creada con éxito!', 'success');
    resetVote();
  };

  // 3. Update Bono Sales local handler
  const [bonoSalesInputs, setBonoSalesInputs] = useState<{ [key: string]: number }>(
    bonoInfo.courseSales.reduce((acc, curr) => ({ ...acc, [curr.course]: curr.sales }), {})
  );

  const handleSaleChange = (course: string, val: string) => {
    const num = parseInt(val) || 0;
    setBonoSalesInputs(prev => ({ ...prev, [course]: num }));
  };

  const handleSaveBonoSales = (course: string) => {
    const sales = bonoSalesInputs[course] || 0;
    onUpdateBonoSales(course, sales);
    onShowToast(`Bono actualizado para ${course}`, 'success');
  };

  const percentRaised = Math.min(Math.round((bonoInfo.totalRaised / bonoInfo.goal) * 100), 100);

  return (
    <div id="admin-panel-container" className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-gray-50 text-neutral-800">
      
      {/* Sub-Tabs Selector */}
      <div className="flex gap-1.5 overflow-x-auto bg-white px-3 py-2 border-b border-gray-100 scrollbar-none shrink-0 shadow-sm">
        {[
          { id: 'stats', label: 'Estadísticas', icon: LayoutDashboard },
          { id: 'proposals', label: 'Propuestas', icon: FileText },
          { id: 'news', label: 'Noticias', icon: Newspaper },
          { id: 'bono', label: 'Bono', icon: BarChart2 },
          { id: 'vote', label: 'Crear Voto', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-subtab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as AdminSubTab)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                isActive ? 'bg-[#CC0000] text-white shadow-sm' : 'text-gray-400 hover:text-neutral-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sub-Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-16 scrollbar-none">
        
        {/* TAB 1: STATISTICS / DASHBOARD */}
        {activeTab === 'stats' && (
          <div id="admin-stats-view" className="flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest mb-1">
              Métricas de Participación Estudiantil
            </h4>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">Propuestas Recibidas</span>
                <span className="text-2xl font-black font-mono text-neutral-800">{proposals.length}</span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {proposals.filter(p => p.status === 'Resuelta').length} resueltas
                </span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">Votaciones Activas</span>
                <span className="text-2xl font-black font-mono text-neutral-800">
                  {votes.filter(v => v.active).length}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  Total {votes.reduce((acc, curr) => acc + curr.totalVotes, 0)} votos
                </span>
              </div>
            </div>

            {/* Bono contribution dashboard info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CC0000]">Bono Contribución</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-bold font-mono text-neutral-800">${bonoInfo.totalRaised.toLocaleString('es-AR')}</span>
                <span className="text-xs text-gray-400">Objetivo: ${bonoInfo.goal.toLocaleString('es-AR')} ({percentRaised}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 p-[2px] overflow-hidden border border-gray-50">
                <div className="bg-[#CC0000] h-full rounded-full" style={{ width: `${percentRaised}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 italic mt-0.5">
                Campaña destinada a adquirir la consola y bafles activos de 15" para el CEC.
              </p>
            </div>

            {/* Quick school guidelines */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
              <h5 className="text-xs font-extrabold text-[#CC0000] uppercase tracking-wide">Guía de Moderación IJA</h5>
              <p className="text-xs text-[#CC0000]/80 leading-relaxed font-semibold">
                Recordá que las propuestas deben revisarse con seriedad antes de elevarlas a dirección escolar. Los cambios de estado notifican automáticamente en la cartelera general.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PROPOSALS */}
        {activeTab === 'proposals' && (
          <div id="admin-proposals-view" className="flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest border-b border-gray-100 pb-2 mb-1">
              Cambiar Estados y Responder Propuestas
            </h4>

            {proposals.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No hay propuestas cargadas en la aplicación.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {proposals.map((prop) => {
                  const isExpanded = selectedProposalId === prop.id;
                  
                  return (
                    <div 
                      key={prop.id}
                      id={`admin-prop-manage-${prop.id}`}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <h5 className="text-xs font-extrabold text-neutral-800 pr-2">{prop.title}</h5>
                          <span className="text-[9px] font-mono text-gray-400">{prop.course} • {prop.author}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          prop.status === 'Resuelta' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                          {prop.status}
                        </span>
                      </div>

                      <button
                        id={`btn-manage-prop-toggle-${prop.id}`}
                        onClick={() => {
                          if (isExpanded) {
                            setSelectedProposalId(null);
                          } else {
                            setSelectedProposalId(prop.id);
                            setResponseInput(prop.responses[0]?.text || '');
                          }
                        }}
                        className="text-left text-[11px] font-bold text-[#CC0000] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Ocultar herramientas' : 'Administrar propuesta'}
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {/* Expanded Admin Controls for specific proposal */}
                      {isExpanded && (
                        <div className="bg-gray-50 p-3.5 rounded-xl flex flex-col gap-3.5 mt-1 border border-gray-100">
                          
                          {/* Status buttons */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Cambiar Estado</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(['Recibida', 'En análisis', 'En el CEC', 'Resuelta', 'Archivada'] as ProposalStatus[]).map((st) => (
                                <button
                                  key={st}
                                  id={`btn-set-status-${st.replace(/\s+/g, '-')}`}
                                  onClick={() => {
                                    onUpdateProposalStatus(prop.id, st, responseInput);
                                    onShowToast(`Propuesta cambiada a "${st}"`, 'success');
                                  }}
                                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center border ${
                                    prop.status === st 
                                      ? 'bg-[#CC0000] text-white border-red-200' 
                                      : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-neutral-800 border-gray-100 shadow-sm'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Response Textarea */}
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Respuesta oficial del CEC</span>
                            <textarea
                              id="admin-response-input"
                              rows={3}
                              value={responseInput}
                              onChange={(e) => setResponseInput(e.target.value)}
                              placeholder="Escribí una respuesta oficial detallada que verán todos los alumnos..."
                              className="bg-white border border-gray-100 rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-red-100 resize-none shadow-sm placeholder-gray-400"
                            />
                            <button
                              id="btn-save-response"
                              onClick={() => {
                                onUpdateProposalStatus(prop.id, prop.status, responseInput);
                                onShowToast('Respuesta oficial guardada', 'success');
                              }}
                              className="bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 self-end transition-colors cursor-pointer shadow-sm"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Guardar Respuesta
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUBLISH NEWS */}
        {activeTab === 'news' && (
          <div id="admin-news-view" className="flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest border-b border-gray-100 pb-2 mb-1">
              Redactar y Publicar Noticia
            </h4>

            <form onSubmit={handleSubNews(onSubmitNews)} className="flex flex-col gap-4">
              
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Título de la noticia</label>
                <input
                  id="news-title-input"
                  type="text"
                  placeholder="Ej: Gran Éxito del Buffet Saludable..."
                  {...regNews('title')}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors shadow-sm placeholder-gray-400"
                />
                {errorsNews.title && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsNews.title.message}</span>
                )}
              </div>

              {/* Short description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Resumen / Bajada de título</label>
                <input
                  id="news-desc-input"
                  type="text"
                  placeholder="Un breve resumen de una sola línea que verán los alumnos..."
                  {...regNews('description')}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors shadow-sm placeholder-gray-400"
                />
                {errorsNews.description && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsNews.description.message}</span>
                )}
              </div>

              {/* Full Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Contenido de la noticia</label>
                <textarea
                  id="news-content-textarea"
                  rows={5}
                  placeholder="Escribí los párrafos completos de la noticia..."
                  {...regNews('content')}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors resize-none shadow-sm placeholder-gray-400"
                />
                {errorsNews.content && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsNews.content.message}</span>
                )}
              </div>

              {/* Image URL with preset suggest */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">URL de imagen de portada</label>
                <input
                  id="news-image-input"
                  type="text"
                  {...regNews('image')}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors shadow-sm"
                />
                {errorsNews.image && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsNews.image.message}</span>
                )}
                
                {/* Presets buttons */}
                <div className="flex gap-2 mt-1 flex-wrap">
                  {[
                    { label: '⚽ Deportes', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600' },
                    { label: '📚 Biblioteca', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600' },
                    { label: '🎭 Arte / Música', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600' },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      id={`preset-img-btn-${i}`}
                      type="button"
                      onClick={() => resetNews({ ...newsSchema.parse({ title: '', description: '', content: '', image: preset.url }), image: preset.url })}
                      className="text-[9px] px-2.5 py-1 rounded-xl bg-white hover:bg-gray-50 text-gray-400 hover:text-neutral-800 transition-colors cursor-pointer border border-gray-100 shadow-sm"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-news-publish-submit"
                type="submit"
                className="bg-[#CC0000] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2 shadow-sm"
              >
                <Megaphone className="w-4 h-4" />
                Publicar en Cartelera Oficial
              </button>

            </form>
          </div>
        )}

        {/* TAB 4: UPDATE BONO SALES */}
        {activeTab === 'bono' && (
          <div id="admin-bono-view" className="flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest border-b border-gray-100 pb-2 mb-1">
              Rendición de Ventas por División
            </h4>
            <p className="text-[11px] text-gray-400 pl-1 leading-relaxed">
              Ingresá el monto total recaudado en pesos ($) de forma acumulada para cada curso de la escuela. Esto actualiza la barra del Home y el Leaderboard de premios.
            </p>

            <div className="flex flex-col gap-2.5 mt-1">
              {bonoInfo.courseSales.map((salesItem) => {
                const currentVal = bonoSalesInputs[salesItem.course] !== undefined 
                  ? bonoSalesInputs[salesItem.course] 
                  : salesItem.sales;

                return (
                  <div
                    key={salesItem.course}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex-1 flex flex-col gap-0.5 pl-1">
                      <span className="text-xs font-bold text-neutral-800 leading-tight">{salesItem.course}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Actual: ${salesItem.sales.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative max-w-[120px]">
                        <span className="absolute left-2.5 top-2.5 text-xs text-gray-400 font-extrabold">$</span>
                        <input
                          id={`input-sales-${salesItem.course.replace(/\s+/g, '-')}`}
                          type="number"
                          value={currentVal || ''}
                          onChange={(e) => handleSaleChange(salesItem.course, e.target.value)}
                          className="bg-gray-50 border border-gray-100 rounded-xl pl-6 pr-2 py-2 text-xs font-bold text-neutral-800 focus:bg-white focus:outline-none w-full shadow-inner"
                        />
                      </div>
                      
                      <button
                        id={`btn-save-sales-${salesItem.course.replace(/\s+/g, '-')}`}
                        onClick={() => handleSaveBonoSales(salesItem.course)}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-[#CC0000] text-[#CC0000] hover:text-white transition-colors cursor-pointer border border-red-100/50 shrink-0 shadow-sm"
                        title="Guardar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CREATE STUDENT VOTE */}
        {activeTab === 'vote' && (
          <div id="admin-vote-view" className="flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[10px] font-extrabold uppercase text-[#CC0000] tracking-widest border-b border-gray-100 pb-2 mb-1">
              Lanzar Nuevo Plebiscito o Votación
            </h4>

            <form onSubmit={handleSubVote(onSubmitVote)} className="flex flex-col gap-4">
              
              {/* Question */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Pregunta del plebiscito</label>
                <input
                  id="vote-question-input"
                  type="text"
                  placeholder="Ej: ¿Qué nombre le ponemos a la radio del colegio?"
                  {...regVote('question')}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors shadow-sm placeholder-gray-400"
                />
                {errorsVote.question && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsVote.question.message}</span>
                )}
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Opciones de respuesta</label>
                  {fields.length < 4 && (
                    <button
                      id="btn-add-option-field"
                      type="button"
                      onClick={() => append({ text: '' })}
                      className="text-[10px] font-bold text-[#CC0000] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Sumar Opción
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-[10px] font-bold text-gray-400 font-mono">
                          OP {index + 1}
                        </span>
                        <input
                          id={`vote-option-input-${index}`}
                          type="text"
                          placeholder={`Opción ${index + 1}...`}
                          {...regVote(`options.${index}.text` as const)}
                          className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] transition-colors shadow-sm"
                        />
                      </div>
                      
                      {fields.length > 2 && (
                        <button
                          id={`btn-remove-option-${index}`}
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-[#CC0000] transition-colors cursor-pointer shadow-sm"
                          title="Eliminar opción"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errorsVote.options && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsVote.options.message}</span>
                )}
              </div>

              {/* Expiry hours / days */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Duración de la votación (días)</label>
                <select
                  id="select-vote-days"
                  {...regVote('expiresDays', { valueAsNumber: true })}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] shadow-sm cursor-pointer"
                >
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                  <option value={7}>7 días (Recomendado)</option>
                  <option value={14}>14 días</option>
                </select>
                {errorsVote.expiresDays && (
                  <span className="text-[10px] text-[#CC0000] font-bold">{errorsVote.expiresDays.message}</span>
                )}
              </div>

              <button
                id="btn-vote-submit"
                type="submit"
                className="bg-[#CC0000] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2 shadow-sm"
              >
                <CheckSquare className="w-4 h-4" />
                Lanzar Plebiscito General 🪃
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
