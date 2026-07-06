import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocItem } from '../types';
import { askBoomerang } from '../lib/gemini';
import { Bot, Send } from 'lucide-react';

interface AsistenteScreenProps {
  documentos: DocItem[];
}

export const AsistenteScreen: React.FC<AsistenteScreenProps> = ({ documentos }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: '¡Hola! Soy Boomerang 🪃, el asistente del Centro de Estudiantes del IJA. Conozco los reglamentos del colegio, los proyectos y actividades del centro, el CEC y tus derechos como estudiante. ¿En qué te puedo ayudar?',
      timestamp: 'Ahora'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userInput.trim(),
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = userInput.trim();
    setUserInput('');
    setIsTyping(true);

    try {
      const replyText = await askBoomerang(originalInput, documentos);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: 'Lo siento, no pude procesar tu pregunta. Intentá de nuevo en unos segundos.',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      {/* Chat status bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-[#CC0000] p-1.5 rounded-xl text-white">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-800">Asistente Boomerang</span>
            <span className="text-[9px] text-emerald-600 font-extrabold font-mono leading-none">Conectado</span>
          </div>
        </div>
        <span className="text-[9px] text-gray-400 font-mono uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">BOT CHAT</span>
      </div>

      {/* Messages Scrollable Panel */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={`flex flex-col max-w-[80%] gap-1 ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#CC0000] text-white rounded-tr-none shadow-[0_2px_8px_rgba(204,0,0,0.2)]'
                    : 'bg-white text-neutral-800 rounded-tl-none border border-gray-100 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-gray-400 font-mono px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div id="bot-typing-indicator" className="flex flex-col max-w-[80%] gap-1 self-start items-start">
            <div className="bg-white text-gray-400 rounded-2xl rounded-tl-none border border-gray-100 p-3 px-4 flex items-center gap-2 shadow-sm">
              <span className="text-[11px] font-medium">Escribiendo...</span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shadow-inner shrink-0">
        <input
          id="chat-user-input"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Preguntame sobre el bono, propuestas..."
          className="flex-1 bg-gray-50 border border-gray-100 focus:border-[#CC0000] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none placeholder-gray-400 transition-all"
        />
        <button
          id="btn-chat-send"
          type="submit"
          className="bg-[#CC0000] hover:bg-red-700 p-2.5 rounded-xl text-white transition-all flex items-center justify-center cursor-pointer border border-[#CC0000] shadow-[0_2px_8px_rgba(204,0,0,0.15)] shrink-0"
          title="Enviar consulta"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};
