import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import {
  subscribeNoticias,
  subscribePropuestas,
  subscribeVotaciones,
  createNoticia,
  createPropuesta,
  updatePropuestaEstado,
  updatePropuestaVotos,
  createVotacion,
  yaVoto,
  registrarVoto,
  getUsuariosAutorizados,
  addUsuarioAutorizado,
  updateUsuarioAutorizado,
  getDocumentos,
  addDocumento,
  toggleDocumentoActivo,
  deleteDocumento,
  getBono,
  subscribeBono,
  updateVentasCurso,
  subscribeEventos,
  createEvento,
  deleteEvento,
  subscribeEquipo,
  createMiembro,
  deleteMiembro,
} from './lib/firestore';
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
import { AuthFlow } from './components/AuthFlow';

import { ShieldCheck, ArrowLeft } from 'lucide-react';

// Simple pulsing skeleton block used while a screen's data is loading
function ScreenSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  );
}

export default function App() {
  // Auth State (Firebase Auth + Firestore whitelist check)
  const { user, authorizedUser, loading: authLoading, isAdmin: isFirestoreAdmin } = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType | 'admin'>('inicio');

  // App Databases fetched from Firestore
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [myProposalVotes, setMyProposalVotes] = useState<Record<string, 'up' | 'down'>>({});

  const [votes, setVotes] = useState<Vote[]>([]);
  const [votesLoading, setVotesLoading] = useState(true);
  const [myVoteMap, setMyVoteMap] = useState<Record<string, string>>({});

  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [bonoInfo, setBonoInfo] = useState<BonoInfo | null>(null);
  const [bonoLoading, setBonoLoading] = useState(true);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

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

  const refetchDocuments = async () => {
    try {
      setDocuments(await getDocumentos());
    } catch {
      showToast('No se pudieron cargar los documentos', 'error');
    }
  };

  const refetchUsers = async () => {
    try {
      setUsers(await getUsuariosAutorizados());
    } catch {
      showToast('No se pudieron cargar los usuarios autorizados', 'error');
    }
  };

  // Live subscriptions to real-time collections, gated behind an authorized session
  useEffect(() => {
    if (!authorizedUser) return;
    let unsubBono: (() => void) | undefined;
    let cancelled = false;

    const unsubNoticias = subscribeNoticias((items) => {
      setNews(items);
      setNewsLoading(false);
    });
    const unsubPropuestas = subscribePropuestas((items) => {
      setProposals(items);
      setProposalsLoading(false);
    });
    const unsubVotaciones = subscribeVotaciones((items) => {
      setVotes(items);
      setVotesLoading(false);
    });
    const unsubEventos = subscribeEventos((items) => {
      setEvents(items);
      setEventsLoading(false);
    });
    const unsubEquipo = subscribeEquipo((items) => {
      setTeam(items);
      setTeamLoading(false);
    });

    setDocumentsLoading(true);
    setUsersLoading(true);
    setBonoLoading(true);
    refetchDocuments().finally(() => setDocumentsLoading(false));
    refetchUsers().finally(() => setUsersLoading(false));

    // getBono() seeds the config/ventas docs on first run, then we switch to realtime updates
    getBono()
      .then((info) => {
        if (cancelled) return;
        setBonoInfo(info);
        setBonoLoading(false);
        unsubBono = subscribeBono(setBonoInfo);
      })
      .catch(() => {
        showToast('No se pudo cargar el Bono Contribución', 'error');
        setBonoLoading(false);
      });

    return () => {
      cancelled = true;
      unsubNoticias();
      unsubPropuestas();
      unsubVotaciones();
      unsubEventos();
      unsubEquipo();
      unsubBono?.();
    };
  }, [authorizedUser]);

  // Fetch which options the current user already voted, whenever the vote list changes
  useEffect(() => {
    if (!user || votes.length === 0) return;
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        votes.map(async (v) => [v.id, await yaVoto(v.id, user.uid)] as const)
      );
      if (cancelled) return;
      const map: Record<string, string> = {};
      entries.forEach(([voteId, opcionId]) => {
        if (opcionId) map[voteId] = opcionId;
      });
      setMyVoteMap(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, votes]);

  // State Mutators / Action Handlers

  // 1. Submit Proposal (Student View)
  const handleCreateProposal = async (newProp: Omit<Proposal, 'id' | 'date' | 'upvotes' | 'downvotes' | 'userVote' | 'responses'>) => {
    try {
      await createPropuesta(newProp);
      showToast('¡Tu propuesta fue enviada correctamente!', 'success');
    } catch {
      showToast('No se pudo enviar la propuesta. Intentá de nuevo.', 'error');
    }
  };

  // 2. Upvote / Downvote Proposal
  const handleVoteProposal = async (id: string, type: 'up' | 'down') => {
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) return;

    const currentVote = myProposalVotes[id] ?? null;
    let upDiff = 0;
    let downDiff = 0;
    let nextVote: 'up' | 'down' | null = type;

    if (currentVote === type) {
      upDiff = type === 'up' ? -1 : 0;
      downDiff = type === 'down' ? -1 : 0;
      nextVote = null;
    } else {
      if (currentVote === 'up') upDiff = -1;
      if (currentVote === 'down') downDiff = -1;
      if (type === 'up') upDiff += 1;
      else downDiff += 1;
    }

    const nextUpvotes = proposal.upvotes + upDiff;
    const nextDownvotes = proposal.downvotes + downDiff;

    try {
      await updatePropuestaVotos(id, nextUpvotes, nextDownvotes);
      setMyProposalVotes((prev) => {
        const next = { ...prev };
        if (nextVote) next[id] = nextVote;
        else delete next[id];
        return next;
      });
      if (nextVote === null) {
        showToast('Voto removido', 'info');
      } else if (type === 'up') {
        showToast('¡Apoyaste esta propuesta! 👍', 'success');
      } else {
        showToast('Votaste en contra 👎', 'info');
      }
    } catch {
      showToast('No se pudo registrar tu voto. Intentá de nuevo.', 'error');
    }
  };

  // 3. Vote on a Plebiscito (Active Poll)
  const handleCastVote = async (voteId: string, optionId: string) => {
    if (!user) return;
    if (myVoteMap[voteId]) return; // already voted

    try {
      await registrarVoto(voteId, user.uid, optionId);
      setMyVoteMap((prev) => ({ ...prev, [voteId]: optionId }));
      showToast('¡Voto registrado correctamente!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'No se pudo registrar el voto. Intentá de nuevo.', 'error');
    }
  };

  // 4. Update Proposal Status (Admin view)
  const handleUpdateProposalStatus = async (id: string, status: ProposalStatus, responseText?: string) => {
    try {
      const respuesta = responseText && responseText.trim() !== ''
        ? {
            date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
            responder: 'Mesa Directiva CEC Boomerang',
            text: responseText.trim()
          }
        : undefined;
      await updatePropuestaEstado(id, status, respuesta);
      showToast('Propuesta actualizada correctamente', 'success');
    } catch {
      showToast('No se pudo actualizar la propuesta. Intentá de nuevo.', 'error');
    }
  };

  // 5. Publish News (Admin view)
  const handlePublishNews = async (newItem: Omit<NewsItem, 'id' | 'date' | 'featured'>) => {
    try {
      await createNoticia(newItem);
      showToast('Noticia publicada correctamente', 'success');
    } catch {
      showToast('No se pudo publicar la noticia. Intentá de nuevo.', 'error');
    }
  };

  // 6. Update Bono Course Sales (Admin view)
  const handleUpdateBonoSales = async (course: string, sales: number) => {
    try {
      await updateVentasCurso(course, sales);
    } catch {
      showToast('No se pudieron actualizar las ventas del curso. Intentá de nuevo.', 'error');
    }
  };

  // Eventos / Agenda (Admin view)
  const handleCreateEvento = async (data: { titulo: string; descripcion: string; fecha: string; tipo: string }) => {
    try {
      await createEvento(data);
      showToast('Evento agregado correctamente', 'success');
    } catch {
      showToast('No se pudo agregar el evento. Intentá de nuevo.', 'error');
    }
  };

  const handleDeleteEvento = async (id: string) => {
    try {
      await deleteEvento(id);
      showToast('Evento eliminado', 'info');
    } catch {
      showToast('No se pudo eliminar el evento. Intentá de nuevo.', 'error');
    }
  };

  // Equipo / Nosotros (Admin view)
  const handleCreateMiembro = async (data: { nombre: string; cargo: string; foto: string; orden: number }) => {
    try {
      await createMiembro(data);
      showToast('Integrante agregado correctamente', 'success');
    } catch {
      showToast('No se pudo agregar el integrante. Intentá de nuevo.', 'error');
    }
  };

  const handleDeleteMiembro = async (id: string) => {
    try {
      await deleteMiembro(id);
      showToast('Integrante eliminado', 'info');
    } catch {
      showToast('No se pudo eliminar el integrante. Intentá de nuevo.', 'error');
    }
  };

  // 7. Create custom Poll/Vote (Admin view)
  const handleCreateVote = async (question: string, optionsText: string[], expiresDays: number) => {
    try {
      await createVotacion(question, optionsText, expiresDays);
      showToast('Votación creada correctamente', 'success');
    } catch {
      showToast('No se pudo crear la votación. Intentá de nuevo.', 'error');
    }
  };

  // 8. Add Official Document (Admin view)
  const handleAddDocument = async (title: string, fileName: string, fileType: string, content: string, fileSizeBytes: number) => {
    try {
      const size = fileSizeBytes > 1024 * 1024
        ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB`;
      await addDocumento({ title, fileName, fileType: fileType.toUpperCase(), size, content });
      await refetchDocuments();
      showToast('Documento agregado correctamente', 'success');
    } catch {
      showToast('No se pudo agregar el documento. Intentá de nuevo.', 'error');
    }
  };

  // 9. Toggle Document Active State (Admin view)
  const handleToggleDocumentActive = async (id: string) => {
    const current = documents.find((d) => d.id === id);
    if (!current) return;
    try {
      await toggleDocumentoActivo(id, !current.active);
      await refetchDocuments();
    } catch {
      showToast('No se pudo actualizar el documento. Intentá de nuevo.', 'error');
    }
  };

  // 10. Delete Document (Admin view)
  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocumento(id);
      await refetchDocuments();
      showToast('Documento eliminado', 'info');
    } catch {
      showToast('No se pudo eliminar el documento. Intentá de nuevo.', 'error');
    }
  };

  // 11. Add Authorized User (Admin view)
  const handleAddUser = async (user: Omit<AuthorizedUser, 'id' | 'active'>) => {
    try {
      await addUsuarioAutorizado(user);
      await refetchUsers();
      showToast('Usuario agregado correctamente', 'success');
    } catch {
      showToast('No se pudo agregar el usuario. Intentá de nuevo.', 'error');
    }
  };

  // 12. Toggle Authorized User Active State (Admin view)
  const handleToggleUserActive = async (id: string) => {
    const current = users.find((u) => u.id === id);
    if (!current) return;
    try {
      await updateUsuarioAutorizado(id, { active: !current.active });
      await refetchUsers();
    } catch {
      showToast('No se pudo actualizar el usuario. Intentá de nuevo.', 'error');
    }
  };

  // 13. Bulk Import Authorized Users from Excel/CSV (Admin view)
  const handleImportUsers = async (imported: Omit<AuthorizedUser, 'id' | 'active'>[]) => {
    try {
      await Promise.all(imported.map((u) => addUsuarioAutorizado(u)));
      await refetchUsers();
      showToast(`${imported.length} usuarios importados correctamente`, 'success');
    } catch {
      showToast('No se pudieron importar los usuarios. Intentá de nuevo.', 'error');
    }
  };

  const proposalsWithMyVotes = proposals.map((p) => ({
    ...p,
    userVote: myProposalVotes[p.id] ?? null,
  }));

  const votesWithMyVotes = votes.map((v) => ({
    ...v,
    userVotedOptionId: myVoteMap[v.id] ?? null,
  }));

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

          {authLoading ? (
            <div className="flex items-center justify-center h-full bg-white">
              <span className="text-xs font-bold text-gray-400 animate-pulse">Cargando...</span>
            </div>
          ) : !authorizedUser ? (
            <AuthFlow />
          ) : (
          <>
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
              newsLoading ? <ScreenSkeleton /> : (
                <InicioScreen
                  news={news}
                  onOpenNews={(item) => setActiveNews(item)}
                />
              )
            )}

            {activeTab === 'propuestas' && (
              proposalsLoading ? <ScreenSkeleton /> : (
                <PropuestasScreen
                  proposals={proposalsWithMyVotes}
                  onCreateProposal={handleCreateProposal}
                  onVoteProposal={handleVoteProposal}
                />
              )
            )}

            {activeTab === 'votaciones' && (
              votesLoading ? <ScreenSkeleton /> : (
                <VotacionesScreen
                  votes={votesWithMyVotes}
                  onCastVote={handleCastVote}
                />
              )
            )}

            {activeTab === 'asistente' && (
              <AsistenteScreen />
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

                {documentsLoading || bonoLoading || eventsLoading || teamLoading || !bonoInfo ? (
                  <ScreenSkeleton />
                ) : (
                  <MasScreen
                    documents={documents.filter(d => d.active)}
                    events={events}
                    team={team}
                    bonoInfo={bonoInfo}
                    isAdminMode={isAdminMode}
                    onToggleAdmin={setIsAdminMode}
                    onShowToast={showToast}
                    onLogout={handleLogout}
                    canAccessAdmin={isFirestoreAdmin}
                  />
                )}
              </div>
            )}

            {activeTab === 'admin' && isFirestoreAdmin && (
              usersLoading || bonoLoading || !bonoInfo ? <ScreenSkeleton /> : (
                <AdminPanel
                  proposals={proposalsWithMyVotes}
                  votes={votesWithMyVotes}
                  news={news}
                  bonoInfo={bonoInfo}
                  documents={documents}
                  users={users}
                  events={events}
                  team={team}
                  onUpdateProposalStatus={handleUpdateProposalStatus}
                  onPublishNews={handlePublishNews}
                  onUpdateBonoSales={handleUpdateBonoSales}
                  onCreateVote={handleCreateVote}
                  onAddDocument={handleAddDocument}
                  onToggleDocumentActive={handleToggleDocumentActive}
                  onDeleteDocument={handleDeleteDocument}
                  onAddUser={handleAddUser}
                  onToggleUserActive={handleToggleUserActive}
                  onImportUsers={handleImportUsers}
                  onCreateEvento={handleCreateEvento}
                  onDeleteEvento={handleDeleteEvento}
                  onCreateMiembro={handleCreateMiembro}
                  onDeleteMiembro={handleDeleteMiembro}
                  onShowToast={showToast}
                />
              )
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
          </>
          )}

          {/* Phone Bottom notch indicator */}
          <div className="hidden sm:block h-3.5 bg-white select-none shrink-0 pb-1.5 border-t border-gray-100">
            <div className="w-28 h-1 bg-neutral-300 rounded-full mx-auto" />
          </div>
        </div>
    </div>
  );
}
