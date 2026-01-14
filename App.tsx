
import React, { useState } from 'react';
import { 
  Rocket,
  Search
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

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.NOVA_BRIEF);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setActiveView(ViewType.CRM_DETAIL);
  };

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
