import React, { useState, useEffect } from 'react';
import { Vote, VoteOption } from '../types';
import { Clock, Check, ChevronDown, ChevronUp, Lock, Award, Users } from 'lucide-react';

interface VotacionesScreenProps {
  votes: Vote[];
  onCastVote: (voteId: string, optionId: string) => void;
}

// Timer sub-component to tick down individually
const VoteCountdown: React.FC<{ expiresAt: string; onExpire: () => void }> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Votación Finalizada');
        onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`Faltan ${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`Termina en ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`Termina en ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#CC0000] text-[10px] font-extrabold font-mono border border-red-100 uppercase shrink-0">
      <Clock className="w-3.5 h-3.5 animate-pulse" />
      <span>{timeLeft}</span>
    </div>
  );
};

export const VotacionesScreen: React.FC<VotacionesScreenProps> = ({ votes, onCastVote }) => {
  const [showClosed, setShowClosed] = useState(false);
  const [localVotes, setLocalVotes] = useState<Vote[]>(votes);

  // Sync props to local state
  useEffect(() => {
    setLocalVotes(votes);
  }, [votes]);

  const activeVotes = localVotes.filter(v => v.active);
  const closedVotes = localVotes.filter(v => !v.active);

  const handleLocalExpire = (voteId: string) => {
    setLocalVotes(prev => prev.map(v => v.id === voteId ? { ...v, active: false } : v));
  };

  const calculatePercent = (votesCount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votesCount / total) * 100);
  };

  const getWinnerOption = (options: VoteOption[]) => {
    return options.reduce((max, opt) => opt.votes > max.votes ? opt : max, options[0]);
  };

  return (
    <div id="votaciones-screen-container" className="flex flex-col gap-5 p-4 animate-fade-in overflow-y-auto max-h-[calc(100vh-140px)] pb-16 bg-gray-50 scrollbar-none">
      
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
          Votaciones y Plebiscitos
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Tu voz define el rumbo de las actividades escolares. Participá activamente en las decisiones institucionales.
        </p>
      </div>

      {/* Active Votes List */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h4 className="text-[10px] font-extrabold text-[#CC0000] tracking-widest uppercase">
            Votaciones Activas
          </h4>
          <span className="text-[10px] font-mono text-gray-400">
            {activeVotes.length} vigentes
          </span>
        </div>

        {activeVotes.length === 0 ? (
          <div id="active-votes-empty" className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center gap-3 shadow-sm">
            <Lock className="w-8 h-8 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1A1A1A]">No hay consultas activas</span>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto">
                Los temas se debaten en asambleas mensuales de delegados antes de abrirse a plebiscito general.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeVotes.map((vote) => {
              const hasVoted = vote.userVotedOptionId !== null;
              
              return (
                <div
                  key={vote.id}
                  id={`vote-card-active-${vote.id}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Top Bar info */}
                  <div className="flex justify-between items-center gap-3">
                    <VoteCountdown 
                      expiresAt={vote.expiresAt} 
                      onExpire={() => handleLocalExpire(vote.id)} 
                    />
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-mono">
                      <Users className="w-3.5 h-3.5 text-[#CC0000]/60" />
                      <span>{vote.totalVotes} votos</span>
                    </div>
                  </div>

                  {/* Question */}
                  <h5 className="text-[14px] font-extrabold text-[#1A1A1A] tracking-tight leading-snug">
                    {vote.question}
                  </h5>

                  {/* Options List */}
                  <div className="flex flex-col gap-2">
                    {vote.options.map((opt) => {
                      const isUserSelected = vote.userVotedOptionId === opt.id;
                      const percentage = calculatePercent(opt.votes, vote.totalVotes);
                      
                      if (hasVoted) {
                        return (
                          <div
                            key={opt.id}
                            id={`opt-voted-${opt.id}`}
                            className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 p-3 flex justify-between items-center transition-all duration-300"
                          >
                            {/* Crimson red progress bar backdrop */}
                            <div 
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${
                                isUserSelected ? 'bg-[#CC0000]/15' : 'bg-gray-200/50'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            />
                            
                            <div className="relative z-10 flex items-center gap-2 pr-4 pl-1">
                              {isUserSelected && (
                                <span className="bg-[#CC0000] p-0.5 rounded-full text-white shrink-0">
                                  <Check className="w-3 h-3 stroke-[3px]" />
                                </span>
                              )}
                              <span className={`text-xs font-bold text-left leading-tight ${
                                isUserSelected ? 'text-neutral-900 font-extrabold' : 'text-neutral-600'
                              }`}>
                                {opt.text}
                              </span>
                            </div>

                            <span className="relative z-10 font-mono text-xs font-extrabold text-[#CC0000]">
                              {percentage}%
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={opt.id}
                          id={`btn-vote-option-${opt.id}`}
                          onClick={() => onCastVote(vote.id, opt.id)}
                          className="w-full text-left bg-white hover:bg-gray-50 border border-gray-100 hover:border-red-100 p-3 rounded-xl text-xs text-neutral-800 hover:text-[#CC0000] transition-all cursor-pointer font-bold shadow-sm active:scale-98"
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {hasVoted && (
                    <div className="bg-red-50/50 border border-red-100 text-center py-2 rounded-xl text-[10px] text-[#CC0000] font-extrabold tracking-wide uppercase">
                      ✓ Tu voto ha sido registrado. ¡Gracias por participar!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Closed Votes Collapsible */}
      <div className="flex flex-col gap-3">
        <button
          id="btn-toggle-closed-votes"
          onClick={() => setShowClosed(!showClosed)}
          className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer text-[#1A1A1A] shadow-sm font-bold"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
              Consultas Cerradas ({closedVotes.length})
            </span>
          </div>
          {showClosed ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showClosed && (
          <div className="flex flex-col gap-3 pl-1 animate-fade-in">
            {closedVotes.map((vote) => {
              const winner = getWinnerOption(vote.options);
              
              return (
                <div
                  key={vote.id}
                  id={`vote-card-closed-${vote.id}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                      Sondeo Finalizado
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-mono">
                      Total: {vote.totalVotes} votos
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-neutral-800 leading-snug">
                    {vote.question}
                  </h5>

                  <div className="flex flex-col gap-2">
                    {vote.options.map((opt) => {
                      const percentage = calculatePercent(opt.votes, vote.totalVotes);
                      const isWinner = opt.id === winner.id;
                      
                      return (
                        <div
                          key={opt.id}
                          className="relative overflow-hidden rounded-xl bg-gray-50 p-2.5 flex justify-between items-center border border-gray-100/50"
                        >
                          <div 
                            className={`absolute left-0 top-0 bottom-0 ${
                              isWinner ? 'bg-[#CC0000]/10' : 'bg-gray-100/40'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          />
                          
                          <div className="relative z-10 flex items-center gap-1.5 pl-1">
                            {isWinner && (
                              <Award className="w-3.5 h-3.5 text-[#CC0000]" />
                            )}
                            <span className={`text-[11px] font-semibold ${
                              isWinner ? 'text-neutral-900 font-bold' : 'text-gray-400'
                            }`}>
                              {opt.text}
                            </span>
                          </div>

                          <span className={`relative z-10 font-mono text-[11px] ${
                            isWinner ? 'text-[#CC0000] font-extrabold' : 'text-gray-400'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
