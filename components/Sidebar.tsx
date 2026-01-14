
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
  Ticket
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
    { id: ViewType.NOVA_BRIEF, label: 'Nova Brief', icon: Layout },
    { id: ViewType.DASHBOARD, label: 'Mission Control', icon: LayoutDashboard },
    { id: ViewType.SEARCH, label: 'Market Search', icon: Search },
    { id: ViewType.NOVA_LEADS, label: 'Nova Leads', icon: Inbox },
    { id: ViewType.AI_BRAIN, label: 'Nova Brain', icon: BrainCircuit },
    { id: ViewType.LISTS, label: 'Saved CRM', icon: List },
    { id: ViewType.EXPO_LANDING, label: 'Expo Hub', icon: Ticket },
  ];

  return (
    <aside 
      className={`bg-slate-950 text-white transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      } relative border-r border-slate-800 shadow-2xl z-20`}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/50">
          N
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">NOVA</span>
            <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase mt-0.5">Walid's Instance</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              activeView === item.id 
                ? 'bg-white/10 text-white shadow-xl' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
            {isOpen && <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
            {item.id === ViewType.NOVA_LEADS && !isOpen && (
              <div className="absolute right-3 top-3 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <a 
          href={WALID_IDENTITY.website}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-3 text-indigo-400 hover:text-indigo-300 rounded-xl transition-colors hover:bg-white/5 group ${!isOpen ? 'justify-center' : ''}`}
        >
          <Globe className="w-5 h-5 shrink-0" />
          {isOpen && <span className="text-[10px] font-black uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4">Visit Store</span>}
        </a>

        <div className={`flex items-center gap-3 px-3 py-3 text-slate-500 rounded-xl ${isOpen ? 'bg-white/5 border border-white/5' : 'justify-center'}`}>
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
          {isOpen && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Walid Encrypted</span>}
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-24 -right-3 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-90"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
