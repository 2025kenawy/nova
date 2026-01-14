import React, { useState, useEffect } from 'react';
import { 
  Rocket,
  Search,
  BrainCircuit,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  RotateCcw
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

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.NOVA_BRIEF);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActivated, setIsActivated] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
        const message = (event instanceof ErrorEvent) ? event.message : (event.reason?.message || "");
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes("rate limit") || lowerMessage.includes("quota") || lowerMessage.includes("429")) {
            setApiError("Gemini Intelligence Core Quota reached. Please wait for recalibration.");
        } else if (lowerMessage.includes("gemini") || lowerMessage.includes("api")) {
            setApiError("Intelligence Core (Gemini) disconnected. Verify API Key authorization.");
        }
    };
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);
    return () => {
        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, []);

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setActiveView(ViewType.CRM_DETAIL);
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewType.NOVA_BRIEF: return <NovaBrief onNavigate={setActiveView} />;
      case ViewType.DASHBOARD: return <Dashboard />;
      case ViewType.SEARCH: return <LeadSearch />;
      case ViewType.NOVA_LEADS: return <NovaLeads onSelectLead={navigateToLead} />;
      case ViewType.LISTS: return <CrmList onSelectLead={navigateToLead} />;
      case ViewType.AI_BRAIN: return <AIBrain />;
      case ViewType.EXPO_LANDING: return <ExpoLanding />;
      case ViewType.CRM_DETAIL: return selectedLeadId ? <CrmDetail leadId={selectedLeadId} onBack={() => setActiveView(ViewType.LISTS)} /> : <CrmList onSelectLead={navigateToLead} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden selection:bg-blue-500/30">
      <Sidebar activeView={activeView} onViewChange={setActiveView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onResetKey={() => window.location.reload()} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {apiError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{apiError}</span>
              <button onClick={() => setApiError(null)} className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="max-w-7xl mx-auto h-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;