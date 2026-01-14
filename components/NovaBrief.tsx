
import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Zap, 
  MessageSquare, 
  ArrowRight, 
  Layout, 
  ShieldCheck,
  BrainCircuit,
  Bell,
  Ticket
} from 'lucide-react';
import { ViewType } from '../types';
import { leadService } from '../services/leadService';
import { eventService } from '../services/eventService';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { WALID_IDENTITY } from '../services/identityService';

interface NovaBriefProps {
  onNavigate: (view: ViewType) => void;
}

const NovaBrief: React.FC<NovaBriefProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    newLeads: 0,
    recommendedActions: 0,
    remindersToday: 0,
    eventLinkedReminders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBrief = async () => {
      setIsLoading(true);
      const leads = await leadService.getDiscoveryInbox();
      const missions = await novaOrchestrator.getDailyCommands();
      const allLeads = await leadService.getAllLeads();
      const allEvents = await eventService.getAllEvents();
      
      const today = new Date().toISOString().split('T')[0];
      
      let eventLinkedCount = 0;

      const leadReminders = allLeads.reduce((acc, lead) => {
        const todayRems = (lead.reminders || []).filter(r => r.date === today && !r.isCompleted);
        if (lead.source?.includes('Expo') && todayRems.length > 0) {
          eventLinkedCount += todayRems.length;
        }
        return acc + todayRems.length;
      }, 0);

      const eventReminders = allEvents.reduce((acc, ev) => {
        const todayRems = (ev.reminders || []).filter(r => r.date === today && !r.isCompleted);
        eventLinkedCount += todayRems.length;
        return acc + todayRems.length;
      }, 0);

      setStats({
        newLeads: leads.length,
        recommendedActions: missions.length,
        remindersToday: leadReminders + eventReminders,
        eventLinkedReminders: eventLinkedCount
      });
      setIsLoading(false);
    };
    loadBrief();
  }, []);

  const briefItems = [
    {
      label: 'Nova Leads',
      value: stats.newLeads,
      icon: Inbox,
      color: 'bg-indigo-600',
      description: 'New intelligence waiting in your inbox.',
      view: ViewType.NOVA_LEADS
    },
    {
      label: 'Actions',
      value: stats.recommendedActions,
      icon: Zap,
      color: 'bg-emerald-600',
      description: 'Strategic missions for immediate execution.',
      view: ViewType.DASHBOARD
    },
    {
      label: 'Reminders',
      value: stats.remindersToday,
      icon: Bell,
      color: 'bg-amber-500',
      description: `${stats.eventLinkedReminders > 0 ? `${stats.eventLinkedReminders} linked to Expo events.` : 'Critical follow-ups for today.'}`,
      view: ViewType.NOVA_LEADS
    }
  ];

  return (
    <div className="flex flex-col h-full gap-12 animate-in fade-in duration-700 max-w-4xl mx-auto pt-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
            <Layout className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Nova Brief</h1>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">
            Status Report for {WALID_IDENTITY.fullName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {briefItems.map((item, idx) => (
          <div 
            key={idx}
            className="group bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900 tracking-tighter block mb-1">
                {isLoading ? '...' : item.value}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {item.label}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-8 h-8">
              {item.description}
            </p>
            <button 
              onClick={() => onNavigate(item.view)}
              className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all"
            >
              Review Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 rounded-[2.5rem] p-10 flex items-center gap-8 shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center border border-indigo-500/30">
            <BrainCircuit className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white tracking-tight mb-2">Market Engine</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-md">
              Nova is monitoring the equestrian market for high-intent signals.
            </p>
            <button 
              onClick={() => onNavigate(ViewType.SEARCH)}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white font-black text-[9px] rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95 whitespace-nowrap"
            >
              Market Search
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex items-center gap-8 shadow-sm">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg">
            <Ticket className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Expo Hub</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-md">
              {stats.eventLinkedReminders > 0 
                ? `${stats.eventLinkedReminders} active follow-ups linked to exhibitions.`
                : "Review event context and exhibition materials."}
            </p>
            <button 
              onClick={() => onNavigate(ViewType.EXPO_LANDING)}
              className="mt-6 px-6 py-3 bg-slate-900 text-white font-black text-[9px] rounded-xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 whitespace-nowrap"
            >
              Open Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaBrief;
