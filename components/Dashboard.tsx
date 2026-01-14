import React, { useState, useEffect } from 'react';
import { 
  Radar, BrainCircuit, Loader2, ChevronRight, CheckCircle2,
  Activity, Target, Rocket, Save, Zap, Terminal, ShieldCheck,
  ShieldAlert, Info, CheckSquare, Square, X, Download, UserPlus
} from 'lucide-react';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { WALID_IDENTITY } from '../services/identityService';
import { Mission } from '../types';
import { leadService } from '../services/leadService';
import { exportLeadsToCsv } from '../utils/exportUtils';

interface MissionCardProps {
  mission: Mission;
  isSelected: boolean;
  onSelect: () => void;
  onExecute: (m: Mission) => void;
  onSave: (m: Mission) => Promise<void>;
  isSaving?: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, isSelected, onSelect, onExecute, onSave, isSaving }) => {
  return (
    <div 
      onClick={onSelect}
      className={`group border rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-1 relative bg-white cursor-pointer ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-200 shadow-sm'}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className={`shrink-0 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
            {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-indigo-400 border border-white/10 shadow-xl text-xl">
            {mission.contactName[0]}
          </div>
          <div>
            <h4 className="text-lg font-black tracking-tight text-slate-900 leading-none mb-1.5">{mission.contactName}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mission.role} • <span className="text-indigo-600">{mission.company}</span></p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border ${mission.priority === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
          <span className="text-[8px] font-black uppercase tracking-widest">{mission.priority}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Regional Intent</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{mission.explanation}"</p>
        </div>

        <div className="flex items-center justify-between gap-4">
           <div className="flex-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Nova Confidence</span>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${mission.confidence}%` }} />
                 </div>
                 <span className="text-[9px] font-black text-indigo-600">{mission.confidence}%</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
             {!mission.isSaved && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onSave(mission); }}
                 disabled={isSaving}
                 className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                 title="Save Target to CRM"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
               </button>
             )}
             <button 
               onClick={(e) => { e.stopPropagation(); onExecute(mission); }}
               className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
             >
               Execute <ChevronRight className="w-3.5 h-3.5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    const results = await novaOrchestrator.getDailyCommands();
    setMissions(results);
  };

  const handleWakeUp = async () => {
    setIsRefreshing(true);
    setThoughtStream([
      "Waking Regional Intelligence Hub...",
      "Locking onto GCC & Arab Market Nodes...",
      "Executing Deep Reasoning (Gemini 3 Pro)...",
      "Filtering Geographic Whitelist (9 Countries)..."
    ]);
    
    await new Promise(r => setTimeout(r, 1200));
    setThoughtStream(prev => [...prev, "Synthesizing High-Impact Local Missions...", "Finalizing Priorities..."]);
    
    await novaOrchestrator.recalibrateIntelligence();
    await loadMissions();
    
    setThoughtStream([]);
    setIsRefreshing(false);
    setFeedback({ message: "Regional Intelligence Core Synchronized.", type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleSelect = (name: string) => {
    const next = new Set(selectedMissions);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedMissions(next);
  };

  const toggleSelectAll = () => {
    if (selectedMissions.size === missions.length && missions.length > 0) {
      setSelectedMissions(new Set());
    } else {
      setSelectedMissions(new Set(missions.map(m => m.contactName)));
    }
  };

  const handleBulkSave = async () => {
    if (selectedMissions.size === 0) return;
    setIsBulkOperating(true);
    setFeedback({ message: `Promoting ${selectedMissions.size} targets to CRM vault...`, type: 'info' });
    
    const missionsToSave = missions.filter(m => selectedMissions.has(m.contactName));
    try {
      const count = await leadService.bulkPromoteMissionToCrm(missionsToSave);
      setFeedback({ message: `Successfully saved ${count} regional targets to CRM.`, type: 'success' });
      setSelectedMissions(new Set());
      await loadMissions();
    } catch (error) {
      setFeedback({ message: "Strategic sync failure. Recalibrating...", type: 'error' });
    }
    
    setIsBulkOperating(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-12 h-full max-w-5xl mx-auto pb-20 animate-in fade-in relative">
      {/* Big Brain Logic Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="max-w-md w-full text-center space-y-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 scale-150" />
                <div className="w-40 h-40 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                   <BrainCircuit className="w-20 h-20 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Regional Discovery</h3>
                 <div className="bg-black/50 rounded-3xl p-8 border border-white/10 font-mono text-left space-y-3 overflow-hidden shadow-2xl">
                    {thoughtStream.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-emerald-400 animate-in slide-in-from-left-4">
                         <Terminal className="w-3.5 h-3.5" />
                         <span className="tracking-tight">{t}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-[11px] text-indigo-400">
                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       <span className="animate-pulse font-black">Velocity Engine Active...</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Apollo Bulk Bar */}
      {selectedMissions.size > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-8 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {selectedMissions.size} Regional Targets
              </span>
              <span className="text-[8px] font-bold text-slate-400">Intelligence Ready</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkSave}
                disabled={isBulkOperating}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20"
              >
                {isBulkOperating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Selected to CRM
              </button>
            </div>
            <button 
              onClick={() => setSelectedMissions(new Set())}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            feedback.type === 'success' ? 'bg-slate-900 border-emerald-500/30' : 
            feedback.type === 'error' ? 'bg-rose-900 border-rose-500/30' : 
            'bg-slate-900 border-indigo-500/30'
          } text-white`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
             feedback.type === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : 
             <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="p-2.5 bg-slate-950 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
                <BrainCircuit className="w-6 h-6 text-indigo-400 relative z-10" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Mission Control</h1>
          </div>
          <div className="flex items-center gap-4 ml-16">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              <ShieldCheck className="w-3 h-3 inline-block mr-1 text-emerald-500" /> Arab Market Lockdown
            </p>
            {missions.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
              >
                {selectedMissions.size === missions.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedMissions.size === missions.length ? 'Deselect All' : 'Select All Missions'}
              </button>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleWakeUp} 
          disabled={isRefreshing}
          className="px-8 py-4 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border border-indigo-400/20"
        >
           <Zap className={`w-5 h-5 text-white ${isRefreshing ? 'animate-bounce' : 'animate-pulse'}`} />
           <span className="text-xs font-black text-white uppercase tracking-widest">WAKE UP REGIONAL BRAIN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {missions.map((m, i) => (
          <MissionCard 
            key={i} 
            mission={m} 
            isSelected={selectedMissions.has(m.contactName)}
            onSelect={() => toggleSelect(m.contactName)}
            onExecute={() => {}} 
            onSave={(mission) => leadService.promoteMissionToCrm(mission)}
          />
        ))}
      </div>

      {missions.length === 0 && !isRefreshing && (
        <div className="flex flex-col items-center justify-center p-32 bg-white border border-slate-200 rounded-[4rem] text-center shadow-sm">
          <BrainCircuit className="w-16 h-16 text-slate-200 mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Regional Pulse Standby</h2>
          <p className="text-slate-400 text-sm max-w-xs mt-3">The Gemini Intelligence core is locked to Arab & Middle East territories. Activate discovery to populate your command deck.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;