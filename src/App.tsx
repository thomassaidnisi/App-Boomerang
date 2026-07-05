import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import {
  initialNews,
  initialProposals,
  initialVotes,
  initialBono,
  initialDocs,
  initialEvents,
  initialTeam,
  initialUsers
} from './data';
import {
  NewsItem,
  Proposal,
  Vote,
  BonoInfo,
  ToastMessage,
  ProposalStatus,
  DocItem,
  AuthorizedUser
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

export default function App() {
  // Auth State (Firebase Auth + Firestore whitelist check)
  const { authorizedUser, loading: authLoading, isAdmin: isFirestoreAdmin } = useAuth();
  const [users, setUsers] = useState<AuthorizedUser[]>(initialUsers);

  const handleLogout = () => {
    signOut(auth);
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType | 'admin'>('inicio');

  // App Databases in React State
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [bonoInfo, setBonoInfo] = useState<BonoInfo>(initialBono);
  const [documents, setDocuments] = useState<DocItem[]>(initialDocs);
  const [events] = useState(initialEvents);
  const [team] = useState(initialTeam);

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

  // State Mutators / Action Handlers

  // 1. Submit Proposal (Student View)
  const handleCreateProposal = (newProp: Omit<Proposal, 'id' | 'date' | 'upvotes' | 'downvotes' | 'userVote' | 'responses'>) => {
    const fresh: Proposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
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
        // Undo vote
        upDiff = type === 'up' ? -1 : 0;
        downDiff = type === 'down' ? -1 : 0;
        nextVote = null;
        showToast('Voto removido', 'info');
      } else {
        // Registering or changing vote
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

      const updatedOptions = v.options.map(o => {
        if (o.id === optionId) {
          return { ...o, votes: o.votes + 1 };
        }
        return o;
      });

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
        // If there was an existing response, we edit it, otherwise we append
        if (updatedResponses.length > 0) {
          updatedResponses[0] = {
            date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
            responder: 'Mesa Directiva CEC Boomerang',
            text: responseText.trim()
          };
        } else {
          updatedResponses.push({
            date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
            responder: 'Mesa Directiva CEC Boomerang',
            text: responseText.trim()
          });
        }
      }

      return {
        ...p,
        status,
        responses: updatedResponses
      };
    }));
  };

  // 5. Publish News (Admin view)
  const handlePublishNews = (newItem: Omit<NewsItem, 'id' | 'date' | 'featured'>) => {
    const fresh: NewsItem = {
      ...newItem,
      id: `news-${Date.now()}`,
      date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      featured: false
    };
    setNews(prev => [fresh, ...prev]);
  };

  // 6. Update Bono Course Sales (Admin view)
  const handleUpdateBonoSales = (course: string, sales: number) => {
    setBonoInfo(prev => {
      const updatedSales = prev.courseSales.map(item => 
        item.course === course ? { ...item, sales } : item
      );

      // Recalculate totalRaised based on updated sales
      const totalRaised = updatedSales.reduce((acc, curr) => acc + curr.sales, 0);

      return {
        ...prev,
        courseSales: updatedSales.sort((a, b) => b.sales - a.sales), // Keep sorted by sales
        totalRaised
      };
    });
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
  };

  // 8. Add Official Document (Admin view — feeds public Documentos & the Asistente context)
  // TODO: al conectar Firebase, subir el archivo a Firebase Storage y guardar
  // la URL + texto extraído en Firestore
  const handleAddDocument = (title: string, fileName: string, fileType: string, content: string, fileSizeBytes: number) => {
    const fresh: DocItem = {
      id: `doc-${Date.now()}`,
      title,
      fileName,
      fileType: fileType.toUpperCase(),
      size: fileSizeBytes > 1024 * 1024
        ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB`,
      date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
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
    // TODO: al conectar Firebase, escribir cada usuario a Firestore colección 'usuarios_autorizados'
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
              <InicioScreen 
                news={news} 
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
              </div>
            )}

            {activeTab === 'admin' && isFirestoreAdmin && (
              <AdminPanel
                proposals={proposals}
                votes={votes}
                news={news}
                bonoInfo={bonoInfo}
                documents={documents}
                users={users}
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
