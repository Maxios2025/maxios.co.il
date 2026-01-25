
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Loader2, UserRound, ShieldAlert } from 'lucide-react';
import { Language, ViewState } from '../App';

interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

interface SupportChatProps {
  lang: Language;
  setActiveView: (v: ViewState) => void;
  isAdmin?: boolean;
}

export const SupportChat: React.FC<SupportChatProps> = ({ lang, setActiveView, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Welcome to MAXIOS Technical Support. Neural link ready." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    
    // Save history for admin
    if (messages.length > 1) {
      const logs = JSON.parse(localStorage.getItem('maxios_support_logs') || '[]');
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role !== 'system') {
        logs.push({ ...lastMsg, timestamp: new Date().toISOString() });
        localStorage.setItem('maxios_support_logs', JSON.stringify(logs.slice(-100))); // keep last 100
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    if (isAgentMode) {
      // Logic for real agent would go here, currently mocked
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: "Analyzing your request... Agent K-742 is responding." }]);
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Elite tech support engineer for MAXIOS. Brand: Professional High-end. Precise, industrial. Lang: ${lang}.`,
        },
      });
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Busy." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Interrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="support-chat" className={`fixed bottom-8 ${lang === 'en' ? 'right-8' : 'left-8'} z-[110]`}>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-orange-600 text-black rounded-none flex items-center justify-center shadow-2xl hover:bg-white transition-colors border-2 border-orange-600 animate-pulse">
          <MessageCircle size={28} strokeWidth={3} />
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[450px] h-[600px] bg-zinc-950 border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isAgentMode ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`} />
              <h3 className="font-black italic text-white uppercase tracking-tighter">{isAgentMode ? "Agent K-742" : "MAXIOS AI NODE"}</h3>
            </div>
            {isAdmin && <ShieldAlert size={16} className="text-orange-500" />}
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white"><X size={24} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-black/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 text-xs ${m.role === 'user' ? 'bg-orange-600 text-black font-bold' : m.role === 'system' ? 'bg-zinc-800 text-white/20 italic w-full text-center py-2' : 'bg-white/5 text-white/90 border border-white/10'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="p-4 bg-white/5 w-12"><Loader2 size={16} className="animate-spin text-orange-500" /></div>}
          </div>
          {!isAgentMode && (
            <div className="px-6 py-2 border-t border-white/5 bg-zinc-900/50">
              <button onClick={() => setIsAgentMode(true)} className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-orange-500 uppercase tracking-widest"><UserRound size={12} /> ESCALATE TO AGENT</button>
            </div>
          )}
          <div className="p-6 border-t border-white/5 bg-black">
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="w-full bg-white/5 border border-white/10 py-4 px-6 text-white text-[11px] font-bold focus:border-orange-500/50 outline-none uppercase" />
              <button onClick={handleSend} disabled={loading} className={`absolute ${lang === 'en' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-orange-500 hover:text-white`}><Send size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
