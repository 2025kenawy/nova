
import React, { useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  List, 
  Mail, 
  BrainCircuit, 
  Settings, 
  Bell, 
  Users, 
  Building2,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Rocket
} from 'lucide-react';
import { ViewType, Lead, Company } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadSearch from './components/LeadSearch';
import AIBrain from './components/AIBrain';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.SEARCH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.SEARCH:
        return <LeadSearch />;
      case ViewType.AI_BRAIN:
        return <AIBrain />;
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
