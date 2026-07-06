import { useState } from 'react';
import {
  initialNews,
  initialProposals,
  initialVotes,
  initialBono,
  initialDocs,
  initialEvents,
  initialTeam,
  initialUsers,
} from './data';
import {
  NewsItem,
  Proposal,
  Vote,
  BonoInfo,
  ToastMessage,
  ProposalStatus,
  DocItem,
  AuthorizedUser,
  EventItem,
  TeamMember,
  BannerConfig,
} from './types';

// Components
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { InicioScreen, NewsDetail } from './components/InicioScreen';
import { PropuestasScreen } from './components/PropuestasScreen';
import { VotacionesScreen } from './components/VotacionesScreen';
import { AsistenteScreen } from './components/AsistenteScreen';
import { MasScreen } from './components/MasScreen';
import { AdminPanel } from './components/AdminPanel';

import { ShieldCheck, ArrowLeft } from 'lucide-react';

// DEMO BRANCH: no Firebase/Firestore dependency — everything runs on local mock
// state so the app can be shown offline. Login is skipped entirely: we drop the
// visitor straight in as this fixed example student.
const DEMO_USER: AuthorizedUser = {
  id: 'demo-student',
  email: 'estudiante.demo@ija.edu.ar',
  name: 'Estudiante Demo',
  role: 'Estudiante',
  course: '5°A',
  active: true,
};

const fechaHoy = () =>
  new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function App() {
  // authorizedUser is fixed to DEMO_USER for the whole session — login is skipped
  const isAdmin = true; // demo: let visitors toggle into the admin panel to showcase it too

  const handleLogout = () => {
    showToast('Modo demo: no hay una sesión real para cerrar', 'info');
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType | 'admin'>('inicio');

  // App Databases — seeded from local mock data (src/data.ts), no Firestore involved
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [bonoInfo, setBonoInfo] = useState<BonoInfo>(initialBono);
  const [documents, setDocuments] = useState<DocItem[]>(initialDocs);
  const [users, setUsers] = useState<AuthorizedUser[]>(initialUsers);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [banner, setBanner] = useState<BannerConfig>({
    bannerActivo: true,
    bannerTexto: '¡Bono Contribución disponible! Sorteá un Smart TV 43" y más premios. Solicitá tu talonario a tu delegado de curso. Todo recaudado va para el sonido.',
  });

  // Global UI States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State Mutators / Action Handlers (all local — no network calls)

  // 1. Submit Proposal (Student View)
  const handleCreateProposal = (newProp: Omit<Proposal, 'id' | 'date' | 'upvotes' | 'downvotes' | 'userVote' | 'responses'>) => {
    const fresh: Proposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      date: fechaHoy(),
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      responses: []
    };
    setProposals(prev => [fresh, ...prev]);
    showToast('¡Tu propuesta fue enviada correctamente!', 'success');
  };

  // 2. Upvote / Downvote Proposal
  const handleVoteProposal = (id: string, type: 'up' | 'down') => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;

      let upDiff = 0;
      let downDiff = 0;
      let nextVote: 'up' | 'down' | null = type;

      if (p.userVote === type) {
        upDiff = type === 'up' ? -1 : 0;
        downDiff = type === 'down' ? -1 : 0;
        nextVote = null;
        showToast('Voto removido', 'info');
      } else {
        if (p.userVote === 'up') upDiff = -1;
        if (p.userVote === 'down') downDiff = -1;

        if (type === 'up') {
          upDiff += 1;
          showToast('¡Apoyaste esta propuesta! 👍', 'success');
        } else {
          downDiff += 1;
          showToast('Votaste en contra 👎', 'info');
        }
      }

      return {
        ...p,
        upvotes: p.upvotes + upDiff,
        downvotes: p.downvotes + downDiff,
        userVote: nextVote
      };
    }));
  };

  // 3. Vote on a Plebiscito (Active Poll)
  const handleCastVote = (voteId: string, optionId: string) => {
    setVotes(prev => prev.map(v => {
      if (v.id !== voteId) return v;
      if (v.userVotedOptionId !== null) return v; // already voted

      const updatedOptions = v.options.map(o =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      );

      return {
        ...v,
        options: updatedOptions,
        totalVotes: v.totalVotes + 1,
        userVotedOptionId: optionId
      };
    }));
    showToast('¡Voto registrado correctamente!', 'success');
  };

  // 4. Update Proposal Status (Admin view)
  const handleUpdateProposalStatus = (id: string, status: ProposalStatus, responseText?: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;

      const updatedResponses = [...p.responses];
      if (responseText !== undefined && responseText.trim() !== '') {
        const respuesta = {
          date: fechaHoy(),
          responder: 'Mesa Directiva CEC Boomerang',
          text: responseText.trim()
        };
        if (updatedResponses.length > 0) updatedResponses[0] = respuesta;
        else updatedResponses.push(respuesta);
      }

      return { ...p, status, responses: updatedResponses };
    }));
    showToast('Propuesta actualizada correctamente', 'success');
  };

  // 5. Publish News (Admin view)
  const handlePublishNews = (newItem: Omit<NewsItem, 'id' | 'date' | 'featured'>) => {
    const fresh: NewsItem = {
      ...newItem,
      id: `news-${Date.now()}`,
      date: fechaHoy(),
      featured: false
    };
    setNews(prev => [fresh, ...prev]);
    showToast('Noticia publicada correctamente', 'success');
  };

  const handleUpdateNews = (id: string, data: Partial<NewsItem>) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    showToast('Noticia actualizada correctamente', 'success');
  };

  const handleDeleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    showToast('Noticia eliminada correctamente', 'success');
  };

  // 6. Update Bono Course Sales (Admin view)
  const handleUpdateBonoSales = (course: string, sales: number) => {
    setBonoInfo(prev => {
      const exists = prev.courseSales.some(item => item.course === course);
      const updatedSales = exists
        ? prev.courseSales.map(item => item.course === course ? { ...item, sales } : item)
        : [...prev.courseSales, { course, sales }];
      const totalRaised = updatedSales.reduce((acc, curr) => acc + curr.sales, 0);
      return {
        ...prev,
        courseSales: updatedSales.sort((a, b) => b.sales - a.sales),
        totalRaised
      };
    });
    showToast('Ventas actualizadas correctamente', 'success');
  };

  const handleUpdateFechaSorteo = (fecha: string) => {
    setBonoInfo(prev => ({ ...prev, drawDate: fecha }));
    showToast('Fecha de sorteo actualizada correctamente', 'success');
  };

  const handleAddPremio = (premio: { title: string; description: string; image: string }) => {
    setBonoInfo(prev => ({
      ...prev,
      prizes: [...prev.prizes, { ...premio, id: `prize-${Date.now()}` }]
    }));
    showToast('Premio agregado correctamente', 'success');
  };

  const handleDeletePremio = (id: string) => {
    setBonoInfo(prev => ({ ...prev, prizes: prev.prizes.filter(p => p.id !== id) }));
    showToast('Premio eliminado', 'info');
  };

  // Banner Destacado (Admin view)
  const handleUpdateBanner = (data: BannerConfig) => {
    setBanner(data);
    showToast('Banner actualizado correctamente', 'success');
  };

  // Eventos / Agenda (Admin view)
  const buildEventItem = (id: string, data: { titulo: string; descripcion: string; fecha: string; tipo: string }): EventItem => {
    const fechaObj = new Date(data.fecha);
    return {
      id,
      title: data.titulo,
      description: data.descripcion,
      date: fechaObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      location: data.tipo,
      fechaISO: data.fecha,
      tipo: data.tipo,
    };
  };

  const handleCreateEvento = (data: { titulo: string; descripcion: string; fecha: string; tipo: string }) => {
    const fresh = buildEventItem(`event-${Date.now()}`, data);
    setEvents(prev => [...prev, fresh].sort((a, b) =>
      new Date(a.fechaISO || a.date).getTime() - new Date(b.fechaISO || b.date).getTime()
    ));
    showToast('Evento agregado correctamente', 'success');
  };

  const handleUpdateEvento = (id: string, data: Partial<{ titulo: string; descripcion: string; fecha: string; tipo: string }>) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const merged = buildEventItem(id, {
        titulo: data.titulo ?? e.title,
        descripcion: data.descripcion ?? e.description,
        fecha: data.fecha ?? e.fechaISO ?? '',
        tipo: data.tipo ?? e.tipo ?? '',
      });
      return merged;
    }));
    showToast('Evento actualizado correctamente', 'success');
  };

  const handleDeleteEvento = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Evento eliminado', 'info');
  };

  // Equipo / Nosotros (Admin view)
  const handleCreateMiembro = (data: { nombre: string; cargo: string; foto: string; orden: number }) => {
    const fresh: TeamMember = { id: `team-${Date.now()}`, name: data.nombre, role: data.cargo, photo: data.foto, orden: data.orden };
    setTeam(prev => [...prev, fresh].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
    showToast('Integrante agregado correctamente', 'success');
  };

  const handleUpdateMiembro = (id: string, data: Partial<{ nombre: string; cargo: string; foto: string; orden: number }>) => {
    setTeam(prev => prev.map(m => m.id === id ? {
      ...m,
      name: data.nombre ?? m.name,
      role: data.cargo ?? m.role,
      photo: data.foto ?? m.photo,
      orden: data.orden ?? m.orden,
    } : m).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
    showToast('Integrante actualizado correctamente', 'success');
  };

  const handleDeleteMiembro = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    showToast('Integrante eliminado', 'info');
  };

  // 7. Create custom Poll/Vote (Admin view)
  const handleCreateVote = (question: string, optionsText: string[], expiresDays: number) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiresDays);

    const fresh: Vote = {
      id: `vote-${Date.now()}`,
      question,
      options: optionsText.map((t, idx) => ({ id: `opt-${Date.now()}-${idx}`, text: t, votes: 0 })),
      totalVotes: 0,
      expiresAt: expiry.toISOString(),
      userVotedOptionId: null,
      active: true
    };
    setVotes(prev => [fresh, ...prev]);
    showToast('Votación creada correctamente', 'success');
  };

  // 8. Add Official Document (Admin view)
  const handleAddDocument = (title: string, fileName: string, fileType: string, content: string, fileSizeBytes: number) => {
    const fresh: DocItem = {
      id: `doc-${Date.now()}`,
      title,
      fileName,
      fileType: fileType.toUpperCase(),
      size: fileSizeBytes > 1024 * 1024
        ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB`,
      date: fechaHoy(),
      active: true,
      content
    };
    setDocuments(prev => [fresh, ...prev]);
    showToast('Documento agregado correctamente', 'success');
  };

  // 9. Toggle Document Active State (Admin view)
  const handleToggleDocumentActive = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  // 10. Delete Document (Admin view)
  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Documento eliminado', 'info');
  };

  // 11. Add Authorized User (Admin view)
  const handleAddUser = (user: Omit<AuthorizedUser, 'id' | 'active'>) => {
    const fresh: AuthorizedUser = { ...user, id: `user-${Date.now()}`, active: true };
    setUsers(prev => [fresh, ...prev]);
    showToast('Usuario agregado correctamente', 'success');
  };

  // 12. Toggle Authorized User Active State (Admin view)
  const handleToggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  // 13. Bulk Import Authorized Users from Excel/CSV (Admin view)
  const handleImportUsers = (imported: Omit<AuthorizedUser, 'id' | 'active'>[]) => {
    const fresh: AuthorizedUser[] = imported.map((u, idx) => ({
      ...u,
      id: `user-${Date.now()}-${idx}`,
      active: true
    }));
    setUsers(prev => [...fresh, ...prev]);
    showToast(`${fresh.length} usuarios importados correctamente`, 'success');
  };

  return (
    <div
      id="app-root-backdrop"
      className="min-h-screen bg-gray-100 text-[#1A1A1A] flex items-center justify-center p-0 sm:p-4 font-sans overflow-x-hidden selection:bg-[#CC0000] selection:text-white"
    >
        {/* Center Container: Single mobile screen viewport */}
        <div
          id="app-container-shell"
          className="w-full max-w-[390px] mx-auto bg-white sm:rounded-[40px] sm:border-[8px] sm:border-[#1A1A1A] shadow-[0_24px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-screen sm:h-[840px] relative font-sans shrink-0 border-neutral-100 transition-all duration-300"
        >
          {/* Mock phone status bar - dark text to match Sleek Interface */}
          <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-1 bg-white text-[#1A1A1A] border-b border-gray-100 select-none shrink-0">
            <span className="text-[10px] font-black font-mono tracking-wider text-[#CC0000]">IJA 5G</span>
            {/* Speaker ear slit */}
            <div className="w-16 h-3 bg-[#1A1A1A] rounded-full border border-neutral-200" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-neutral-800">16:54</span>
            </div>
          </div>

          {/* DEMO: login is skipped entirely — always signed in as DEMO_USER */}
          {/* Dynamic header per screen */}
          {activeTab === 'inicio' ? (
            <Header isHome={true} />
          ) : activeTab === 'admin' ? (
            <div id="admin-custom-bar" className="sticky top-0 z-40 bg-[#CC0000] text-white px-4 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <button
                  id="btn-admin-exit-back"
                  onClick={() => setActiveTab('mas')}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold tracking-wider text-red-200">BOOMERANG CONTROL</span>
                  <h2 className="text-base font-extrabold tracking-tight">Panel Administrativo</h2>
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            </div>
          ) : (
            <Header
              isHome={false}
              title={{
                propuestas: 'Propuestas de los Alumnos',
                votaciones: 'Votaciones y Plebiscitos',
                asistente: 'Asistente Virtual',
                mas: 'Más Secciones'
              }[activeTab]}
            />
          )}

          {/* Inside App Screens layout */}
          <main className="flex-1 overflow-hidden relative bg-gray-50 flex flex-col">
            {activeTab === 'inicio' && (
              <InicioScreen
                news={news}
                banner={banner}
                onOpenNews={(item) => setActiveNews(item)}
              />
            )}

            {activeTab === 'propuestas' && (
              <PropuestasScreen
                proposals={proposals}
                onCreateProposal={handleCreateProposal}
                onVoteProposal={handleVoteProposal}
              />
            )}

            {activeTab === 'votaciones' && (
              <VotacionesScreen
                votes={votes}
                onCastVote={handleCastVote}
              />
            )}

            {activeTab === 'asistente' && (
              <AsistenteScreen documentos={documents.filter(d => d.active)} />
            )}

            {activeTab === 'mas' && (
              <div className="flex flex-col h-full bg-gray-50">
                {/* Extra banner in menu if admin mode is toggled on to invite them to Panel */}
                {isAdminMode && (
                  <div
                    id="admin-alert-banner"
                    onClick={() => setActiveTab('admin')}
                    className="bg-emerald-50 border-y border-emerald-200 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-all text-emerald-950 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Panel de Control disponible</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 hover:underline flex items-center gap-0.5">
                      Ir ahora →
                    </span>
                  </div>
                )}

                <MasScreen
                  documents={documents.filter(d => d.active)}
                  events={events}
                  team={team}
                  bonoInfo={bonoInfo}
                  isAdminMode={isAdminMode}
                  onToggleAdmin={setIsAdminMode}
                  onShowToast={showToast}
                  onLogout={handleLogout}
                  canAccessAdmin={isAdmin}
                />
              </div>
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminPanel
                proposals={proposals}
                votes={votes}
                news={news}
                bonoInfo={bonoInfo}
                documents={documents}
                users={users}
                events={events}
                team={team}
                banner={banner}
                onUpdateProposalStatus={handleUpdateProposalStatus}
                onPublishNews={handlePublishNews}
                onUpdateNews={handleUpdateNews}
                onDeleteNews={handleDeleteNews}
                onUpdateBonoSales={handleUpdateBonoSales}
                onUpdateFechaSorteo={handleUpdateFechaSorteo}
                onAddPremio={handleAddPremio}
                onDeletePremio={handleDeletePremio}
                onUpdateBanner={handleUpdateBanner}
                onCreateVote={handleCreateVote}
                onAddDocument={handleAddDocument}
                onToggleDocumentActive={handleToggleDocumentActive}
                onDeleteDocument={handleDeleteDocument}
                onAddUser={handleAddUser}
                onToggleUserActive={handleToggleUserActive}
                onImportUsers={handleImportUsers}
                onCreateEvento={handleCreateEvento}
                onUpdateEvento={handleUpdateEvento}
                onDeleteEvento={handleDeleteEvento}
                onCreateMiembro={handleCreateMiembro}
                onUpdateMiembro={handleUpdateMiembro}
                onDeleteMiembro={handleDeleteMiembro}
                onShowToast={showToast}
              />
            )}
          </main>

          {/* Global News detail overlay */}
          {activeNews && (
            <NewsDetail
              item={activeNews}
              onClose={() => setActiveNews(null)}
            />
          )}

          {/* Floating notifications */}
          <ToastContainer
            toasts={toasts}
            onClose={dismissToast}
          />

          {/* Nav bar */}
          {activeTab !== 'admin' && (
            <BottomNav
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              isAdminMode={isAdminMode}
            />
          )}

          {/* Phone Bottom notch indicator */}
          <div className="hidden sm:block h-3.5 bg-white select-none shrink-0 pb-1.5 border-t border-gray-100">
            <div className="w-28 h-1 bg-neutral-300 rounded-full mx-auto" />
          </div>
        </div>
    </div>
  );
}
