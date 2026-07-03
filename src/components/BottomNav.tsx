import React from 'react';
import { Home, Lightbulb, CheckSquare, Bot, Menu } from 'lucide-react';

export type TabType = 'inicio' | 'propuestas' | 'votaciones' | 'asistente' | 'mas';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  isAdminMode: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  isAdminMode
}) => {
  const tabs = [
    { id: 'inicio' as TabType, label: 'Inicio', icon: Home },
    { id: 'propuestas' as TabType, label: 'Propuestas', icon: Lightbulb },
    { id: 'asistente' as TabType, label: 'Asistente Boomerang', icon: Bot },
    { id: 'votaciones' as TabType, label: 'Votaciones', icon: CheckSquare },
    { id: 'mas' as TabType, label: 'Más', icon: Menu },
  ];

  return (
    <div
      id="bottom-navigation-bar"
      className="sticky bottom-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] px-2 pb-safe pt-1 select-none shrink-0"
    >
      <div className="flex justify-around items-end max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.id === 'asistente') {
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className="relative flex flex-col items-center justify-center w-16 -mt-6 transition-all duration-300 focus:outline-none"
              >
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#CC0000] shadow-[0_8px_20px_rgba(204,0,0,0.45)] ring-4 ring-white transition-transform duration-300 ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <span className="text-[9px] font-extrabold mt-1 text-[#CC0000] leading-tight text-center">
                  Asistente
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-3 w-16 transition-all duration-300 focus:outline-none"
            >
              {/* Highlight background on hover/tap */}
              <div
                className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-[#CC0000]/5 scale-100' : 'scale-75 opacity-0'
                }`}
              />

              <IconComponent
                className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-[#CC0000]' : 'text-gray-400 hover:text-gray-600'
                }`}
              />

              <span
                className={`text-[10px] font-bold mt-1 relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-[#1A1A1A] font-extrabold' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Red underline indicator */}
              {isActive && (
                <div
                  id={`nav-underline-${tab.id}`}
                  className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#CC0000] rounded-full shadow-sm"
                />
              )}
            </button>
          );
        })}
      </div>

      {isAdminMode && (
        <div className="bg-[#CC0000] text-[9px] font-extrabold tracking-wider text-center py-0.5 text-white animate-pulse">
          MODO ADMINISTRADOR ACTIVO
        </div>
      )}
    </div>
  );
};
