
import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Bot, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { novaOrchestrator } from '../services/novaOrchestrator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const AIBrain: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I am Nova's Strategic Big Brain, powered by Gemini 3 Pro. I provide deep market analysis strictly for the Arab & Middle East territories." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await novaOrchestrator.askBrain(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Engine Error: ${err.message || "Failed to reach Intelligence Core. Boundary restriction or network failure."}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
            <BrainCircuit className="w-7 h-7 relative z-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase italic leading-none">Strategic Big Brain</h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
              Gemini 3 Pro Global/Regional Node
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-900 rounded-xl flex items-center gap-3 border border-white/5 shadow-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Regional Lockdown Active</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.isError ? 'bg-rose-100' : 'bg-slate-900'}`}>
                  {msg.isError ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <Bot className="w-6 h-6 text-indigo-400" />}
                </div>
              )}
              <div className={`max-w-[85%] rounded-[1.5rem] p-6 text-[13px] font-medium shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : msg.isError 
                    ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="bg-slate-50 p-6 flex items-center gap-3 rounded-[1.5rem] border border-slate-100">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synthesizing Regional Intelligence...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-end gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Query regional market intelligence..."
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 text-sm font-medium resize-none transition-all"
              rows={1}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading} 
              className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-indigo-600 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBrain;
