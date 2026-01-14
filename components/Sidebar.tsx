
import React from 'react';
import { 
  Search, 
  LayoutDashboard, 
  List, 
  BrainCircuit, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Globe,
  Inbox,
  Layout,
  Ticket,
  Users,
  Database,
  Briefcase,
  Layers
} from 'lucide-react';
import { ViewType } from '../types';
import { WALID_IDENTITY } from '../services/identityService';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: ViewType.NOVA_BRIEF, label: 'Home', icon: Layout },
    { id: ViewType.SEARCH, label: 'Search', icon: Search },
    { id: ViewType.DASHBOARD, label: 'Missions', icon: Layers },
    { id: ViewType.NOVA_LEADS, label: 'Discovery', icon: Inbox },
    { id: ViewType.LISTS, label: 'Total CRM', icon: Database },
    { id: ViewType.AI_BRAIN, label: 'Big Brain', icon: BrainCircuit },
    { id: ViewType.EXPO_LANDING, label: 'Expo Hub', icon: Ticket },
  ];

  return (
    <aside 
      className={`bg-[#061121] text-white transition-all duration-300 flex flex-col ${
        isOpen ? 'w-56' : 'w-16'
      } relative border-r border-white/10 shadow-2xl z-20`}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0047FF] rounded-lg flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-blue-500/20">
          N
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight leading-none uppercase">NOVA</span>
            <span className="text-[8px] font-black text-blue-400 tracking-widest uppercase mt-0.5">Enterprise</span>
          </div>
        )}
      </div>

      <div className="mt-4 px-2">
        {isOpen && <span className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Workspace</span>}
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                activeView === item.id 
                  ? 'bg-[#0047FF] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              {isOpen && <span className="font-bold text-[11px] whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 space-y-4">
        {isOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
               <span>Credits</span>
               <span className="text-blue-400">Unlimited</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-[75%]" />
            </div>
          </div>
        )}
        
        <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
            {WALID_IDENTITY.fullName[0]}
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-200 truncate w-24 leading-none">{WALID_IDENTITY.fullName}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">{WALID_IDENTITY.companyName}</span>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl hover:scale-110"
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
