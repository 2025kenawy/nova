
import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, BrainCircuit, Loader2, X, ChevronRight, CheckCircle2,
  Activity, BadgeDollarSign, ShieldCheck, Calendar,
  Send, Check, ShieldAlert, Target, Rocket, Save, BellPlus,
  Sparkles, Info
} from 'lucide-react';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { WALID_IDENTITY } from '../services/identityService';
import { Mission } from '../types';
import { leadService } from '../services/leadService';

interface MissionCardProps {
  mission: Mission;
  onExecute: (m: Mission) => void;
  onSave: (m: Mission, withReminder: boolean) => Promise<void>;
  isSaving?: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onExecute, onSave, isSaving }) => {
  return (
    <div className="group border border-slate-200 bg-white rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-1 relative">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-indigo-400 border border-white/10 shadow-xl overflow-hidden text-xl">
            {mission.contactName[0]}
          </div>
          <div>
            <h4 className="text-lg font-black tracking-tight text-slate-900 leading-none mb-1.5">{mission.contactName}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mission.role} • <span className="text-indigo-600">{mission.company}</span></p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded-full border ${mission.priority === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
            <span className="text-[8px] font-black uppercase tracking-widest">{mission.priority}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Strategic Intent</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed italic mb-4">"{mission.explanation}"</p>
          
          {mission.reasoningSource && (
            <div className="pt-3 border-t border-slate-200 flex items-start gap-2">
              <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                Reasoning: {mission.reasoningSource}
              </p>
            </div>
          )}
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
                 onClick={() => onSave(mission, false)}
                 disabled={isSaving}
                 className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               </button>
             )}
             <button 
               onClick={() => onExecute(mission)}
               className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
             >
               {mission.recommendedAction === 'Discovery' ? 'Start Discovery' : 'Execute Mission'} <ChevronRight className="w-3.5 h-3.5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadMissions();
    const interval = setInterval(loadMissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMissions = async () => {
    const results = await novaOrchestrator.getDailyCommands();
    setMissions(results);
  };

  const handleWakeUp = async () => {
    setIsRefreshing(true);
    await novaOrchestrator.recalibrateIntelligence();
    loadMissions();
    setIsRefreshing(false);
  };

  const handleSaveToCrm = async (mission: Mission, withReminder: boolean) => {
    await leadService.promoteMissionToCrm(mission, withReminder);
    setFeedback({ message: "Strategic intelligence saved to CRM vault.", type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
    loadMissions();
  };

  return (
    <div className="space-y-12 h-full max-w-5xl mx-auto pb-20 animate-in fade-in relative">
      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4">
          <div className="px-6 py-3 rounded-2xl shadow-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="p-2 bg-slate-950 rounded-xl shadow-lg">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Mission Control</h1>
          </div>
          <div className="flex items-center gap-2 ml-14">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{WALID_IDENTITY.fullName}'s Secure Instance</p>
          </div>
        </div>
        
        <button 
          onClick={handleWakeUp} 
          disabled={isRefreshing}
          className="px-6 py-4 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 disabled:opacity-50"
        >
           <Radar className={`w-5 h-5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
           <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
             {isRefreshing ? 'Recalibrating Context...' : 'Wake Up Big Brain'}
           </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {missions.map((m, i) => (
          <MissionCard 
            key={i} 
            mission={m} 
            onExecute={() => {}} 
            onSave={handleSaveToCrm}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
