import React, { useState, useEffect } from 'react';
import { BonoInfo } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Ticket, Gift, Trophy, Calendar, Sparkles, TrendingUp } from 'lucide-react';

interface BonoScreenProps {
  bonoInfo: BonoInfo;
}

export const BonoScreen: React.FC<BonoScreenProps> = ({ bonoInfo }) => {
  const [daysLeft, setDaysLeft] = useState('');

  // Sorteo countdown (14 de Agosto, 2026)
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(bonoInfo.drawDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setDaysLeft('¡Sorteado!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(`Faltan ${days} días y ${hours} horas`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [bonoInfo.drawDate]);

  const percentRaised = Math.min(
    Math.round((bonoInfo.totalRaised / bonoInfo.goal) * 100),
    100
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format Recharts data (shorten labels for mobile responsiveness)
  const chartData = bonoInfo.courseSales.map(item => ({
    ...item,
    shortCourse: item.course.replace(' Año ', '°').replace(' Naturales', ' Nat').replace(' Economía', ' Eco').replace(' Sociales', ' Soc').replace(' Comunicación', ' Com'),
  }));

  // Recharts custom Tooltip style
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white font-sans text-xs shadow-xl">
          <p className="font-bold mb-1">{payload[0].payload.course}</p>
          <p className="font-mono text-[#CC0000] font-extrabold">
            Recaudado: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="bono-screen-container" className="flex flex-col gap-5 p-4 animate-fade-in overflow-y-auto max-h-[calc(100vh-140px)] pb-16 bg-gray-50 scrollbar-none">
      
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
          Bono Contribución 2026
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Comprando tu bono apoyás el equipamiento tecnológico e infraestructura del colegio. ¡Todos los fondos van directo al CEC!
        </p>
      </div>

      {/* HERO / TOTAL RAISED GRADIENT BLOCK */}
      <div 
        id="bono-progress-hero"
        className="relative overflow-hidden bg-gradient-to-r from-[#CC0000] to-[#1A1A1A] rounded-2xl p-5 border border-red-100 shadow-[0_4px_16px_rgba(204,0,0,0.12)] text-white flex flex-col gap-4"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none" />

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-1.5 rounded-xl backdrop-blur-md">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-extrabold tracking-wider text-red-200 uppercase">RECAUDACIÓN EN VIVO</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#CC0000] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Objetivo: Equipo de Sonido
          </span>
        </div>

        {/* Counters */}
        <div className="flex flex-col relative z-10 mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight">
              {formatCurrency(bonoInfo.totalRaised)}
            </span>
            <span className="text-xs text-red-200">
              de {formatCurrency(bonoInfo.goal)}
            </span>
          </div>
          <p className="text-[11px] text-red-100 font-medium">
            ¡Ya alcanzamos el {percentRaised}% de nuestra meta de compra!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-black/35 rounded-full overflow-hidden border border-white/10 p-[2px] z-10 shrink-0">
          <div 
            id="bono-hero-progress-fill"
            className="h-full bg-gradient-to-r from-[#CC0000] to-red-400 rounded-full transition-all duration-1000"
            style={{ width: `${percentRaised}%` }}
          />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 mt-1 border-t border-white/10 pt-3 text-center relative z-10">
          <div className="flex flex-col border-r border-white/15">
            <span className="text-[9px] text-red-200 font-bold uppercase tracking-wider">VALOR DEL NÚMERO</span>
            <span className="text-sm font-bold font-mono text-white">$1.000 ARS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-red-200 font-bold uppercase tracking-wider">FECHA DE SORTEO</span>
            <span className="text-sm font-bold font-mono text-white">14 de Agosto</span>
          </div>
        </div>
      </div>

      {/* DRAW COUNTDOWN BANNER */}
      <div 
        id="draw-countdown-box"
        className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-red-50 p-2.5 rounded-xl text-[#CC0000]">
            <Calendar className="w-5 h-5 text-[#CC0000]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">SORTEO EN VIVO IJA</span>
            <span className="text-xs font-extrabold text-neutral-800">Viernes 14 de Agosto • 20:00 hs</span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 text-[#CC0000] text-[10px] font-extrabold px-2.5 py-1 rounded-full font-mono uppercase tracking-wide">
            {daysLeft}
          </span>
        </div>
      </div>

      {/* PRIZE GRID */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Gift className="w-4 h-4 text-[#CC0000]" />
          <h4 className="text-[10px] font-extrabold text-[#CC0000] uppercase tracking-widest">
            Premios en Sorteo
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bonoInfo.prizes.map((prize) => (
            <div
              key={prize.id}
              id={`prize-card-${prize.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col gap-2.5 hover:shadow-md transition-all shadow-sm group cursor-pointer"
            >
              <div className="relative h-28 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                <img 
                  src={prize.image} 
                  alt={prize.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 left-2 bg-[#CC0000] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Sorteo
                </span>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <h5 className="text-[11px] font-extrabold text-neutral-800 group-hover:text-[#CC0000] transition-colors line-clamp-1 leading-snug">
                  {prize.title}
                </h5>
                <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">
                  {prize.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COURSE SALES LEADERBOARD (BAR CHART) */}
      <div className="flex flex-col gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-1">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#CC0000]" />
            <h4 className="text-[10px] font-extrabold text-[#CC0000] uppercase tracking-widest">
              Competencia Intercurso
            </h4>
          </div>
          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest font-extrabold">
            Ventas por División
          </span>
        </div>
        
        <p className="text-[10px] text-gray-400 leading-relaxed pl-1 mb-2">
          ¡El curso que recaude el mayor monto en bonos gana un asado/merienda escolar completa patrocinada por el Centro! 🍖
        </p>

        {/* Responsive Recharts container */}
        <div id="bono-leaderboard-chart" className="w-full h-48 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fill: '#9ca3af', fontSize: 9, fontFamily: 'JetBrains Mono' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val/1000}k`}
              />
              <YAxis 
                type="category" 
                dataKey="shortCourse" 
                tick={{ fill: '#1F2937', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(204,0,0,0.03)' }} />
              <Bar 
                dataKey="sales" 
                radius={[0, 4, 4, 0]}
                barSize={12}
              >
                {chartData.map((entry, index) => {
                  const isWinner = index === 0;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isWinner ? '#CC0000' : index < 3 ? '#990000' : '#d1d5db'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Winner status badge */}
        {chartData.length > 0 && (
          <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-[#CC0000] p-1.5 rounded-xl text-white">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-[9px] text-[#CC0000] font-extrabold uppercase tracking-widest">Puntero actual de la copa</span>
              <span className="text-xs font-bold text-neutral-800">{chartData[0].course}</span>
            </div>
            <span className="text-xs font-mono font-black text-[#CC0000]">{formatCurrency(chartData[0].sales)}</span>
          </div>
        )}
      </div>

    </div>
  );
};
