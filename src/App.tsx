import { useState } from 'react';
import { 
  initialNews, 
  initialProposals, 
  initialVotes, 
  initialBono, 
  initialDocs, 
  initialEvents, 
  initialTeam 
} from './data';
import { 
  NewsItem, 
  Proposal, 
  Vote, 
  BonoInfo, 
  ToastMessage, 
  ProposalStatus 
} from './types';

// Components
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { InicioScreen, NewsDetail } from './components/InicioScreen';
import { PropuestasScreen } from './components/PropuestasScreen';
import { VotacionesScreen } from './components/VotacionesScreen';
import { BonoScreen } from './components/BonoScreen';
import { MasScreen } from './components/MasScreen';
import { AdminPanel } from './components/AdminPanel';

import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType | 'admin'>('inicio');
  
  // App Databases in React State
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [bonoInfo, setBonoInfo] = useState<BonoInfo>(initialBono);
  const [documents] = useState(initialDocs);
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
                propuestas: 'Propuestas del Alumnado',
                votaciones: 'Votaciones y Plebiscitos',
                bono: 'Bono Contribución',
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

            {activeTab === 'bono' && (
              <BonoScreen 
                bonoInfo={bonoInfo} 
              />
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
                  documents={documents}
                  events={events}
                  team={team}
                  isAdminMode={isAdminMode}
                  onToggleAdmin={setIsAdminMode}
                  onShowToast={showToast}
                />
              </div>
            )}

            {activeTab === 'admin' && (
              <AdminPanel 
                proposals={proposals}
                votes={votes}
                news={news}
                bonoInfo={bonoInfo}
                onUpdateProposalStatus={handleUpdateProposalStatus}
                onPublishNews={handlePublishNews}
                onUpdateBonoSales={handleUpdateBonoSales}
                onCreateVote={handleCreateVote}
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
