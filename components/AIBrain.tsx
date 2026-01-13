
import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Sparkles, User, Bot, Loader2, Rocket, Search, History } from 'lucide-react';
import { novaClient } from '../services/novaClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIBrain: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I am Nova's Strategic Brain. I have full access to your Interaction Memory via the backend. Ask me anything." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await novaClient.askBrain(userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Strategic AI Brain</h1>
          <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            Private Backend Instance
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-[1.5rem] p-6 text-[13px] font-medium leading-relaxed ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-slate-50 p-6 flex items-center gap-3 rounded-[1.5rem]">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Thinking...</span>
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
              placeholder="Ask for strategic advice..."
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium resize-none"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-500/30 active:scale-95"
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
