
import React, { useState, useEffect } from 'react';
import { 
  Rocket,
  Search,
  BrainCircuit,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ViewType, Lead } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadSearch from './components/LeadSearch';
import AIBrain from './components/AIBrain';
import NovaLeads from './components/NovaLeads';
import NovaBrief from './components/NovaBrief';
import CrmDetail from './components/CrmDetail';
import ExpoLanding from './components/ExpoLanding';
import CrmList from './components/CrmList';

// Add global type declarations for AI Studio environment
// Use AIStudio interface name to match global expectations and resolve modifier conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.NOVA_BRIEF);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActivated, setIsActivated] = useState<boolean | null>(null);

  useEffect(() => {
    checkActivation();
  }, []);

  const checkActivation = async () => {
    if (window.aistudio) {
      const active = await window.aistudio.hasSelectedApiKey();
      setIsActivated(active);
    } else {
      // Development fallback
      setIsActivated(true);
    }
  };

  const handleActivate = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setIsActivated(true);
    }
  };

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setActiveView(ViewType.CRM_DETAIL);
  };

  if (isActivated === null) return null;

  if (isActivated === false) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-8 text-white selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
        
        <div className="max-w-md w-full space-y-10 text-center relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-1 ring-white/20 animate-pulse">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Nova <span className="text-indigo-500">Intelligence</span></h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Activation Required</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-400 leading-relaxed">
              To operate at full capacity and avoid quota limits, Nova requires a <span className="text-white font-bold underline decoration-indigo-500 underline-offset-4">Paid API Key</span> from a valid Google Cloud project.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleActivate}
                className="w-full py-5 bg-white text-slate-950 font-black text-xs rounded-2xl uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                Select Paid API Key <ChevronRight className="w-4 h-4" />
              </button>
              
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                Learn about billing & project selection
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 opacity-40">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-widest">Sovereign Encryption Node Active</span>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case ViewType.NOVA_BRIEF:
        return <NovaBrief onNavigate={setActiveView} />;
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.SEARCH:
        return <LeadSearch />;
      case ViewType.NOVA_LEADS:
        return <NovaLeads onSelectLead={navigateToLead} />;
      case ViewType.LISTS:
        return <CrmList onSelectLead={navigateToLead} />;
      case ViewType.CRM_DETAIL:
        return selectedLeadId ? (
          <CrmDetail leadId={selectedLeadId} onBack={() => setActiveView(ViewType.NOVA_LEADS)} />
        ) : (
          <NovaLeads onSelectLead={navigateToLead} />
        );
      case ViewType.AI_BRAIN:
        return <AIBrain />;
      case ViewType.EXPO_LANDING:
        return <ExpoLanding />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Rocket className="w-12 h-12 mb-4 animate-bounce" />
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p>This module is currently being optimized by the Big Brain.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
