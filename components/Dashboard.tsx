
import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, BrainCircuit, 
  Loader2, X, ChevronRight, CheckCircle2,
  Activity, BadgeDollarSign, ShieldCheck, Calendar,
  Send, Check, ShieldAlert, Target, Rocket, Save, BellPlus,
  Sparkles
} from 'lucide-react';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { WALID_IDENTITY } from '../services/identityService';
import { Mission } from '../types';
import { leadService } from '../services/leadService';

interface MissionCardProps {
  mission: Mission;
  onExecute: (m: Mission) => void | Promise<void>;
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
          <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">{mission.priority}</span>
          </div>
          {mission.isSaved && (
             <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">In CRM</span>
             </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Strategic Intent</span>
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
               <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onSave(mission, false)}
                    disabled={isSaving}
                    title="Save to CRM"
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => onSave(mission, true)}
                    disabled={isSaving}
                    title="Save + Set Reminder"
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellPlus className="w-4 h-4" />}
                  </button>
               </div>
             )}
             <button 
               onClick={() => onExecute(mission)}
               className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
             >
               Analyze <ChevronRight className="w-3.5 h-3.5" />
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
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savingMissionName, setSavingMissionName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [executionResult, setExecutionResult] = useState<{ mission: Mission; response: string } | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const pollInterval = useRef<number | null>(null);

  useEffect(() => {
    loadSavedMissions();
    
    // Establish deep polling for background intelligence updates
    pollInterval.current = window.setInterval(() => {
      const activeRefresh = novaOrchestrator.isRefreshing();
      setIsRefreshing(activeRefresh);
      
      // Load missions if we have none or if the brain just finished a cycle
      if (missions.length === 0 || !activeRefresh) {
        loadSavedMissions();
      }
    }, 4000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [missions.length]);

  const loadSavedMissions = async () => {
    const results = await novaOrchestrator.getDailyCommands();
    const crmContacts = await leadService.getCrmContacts();
    
    if (results && results.length > 0) {
      // Cross-reference with CRM to check saved status
      const augmentedMissions = results.map(m => {
        const nameParts = m.contactName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        const isSaved = crmContacts.some(c => 
          c.firstName === firstName && c.lastName === (lastName || '(Mission)') && c.companyName === m.company
        );
        return { ...m, isSaved };
      });
      setMissions(augmentedMissions);
    }
  };

  const handleWakeUp = () => {
    setIsRefreshing(true);
    novaOrchestrator.recalibrateIntelligence();
    // Immediate optimistic refresh
    setTimeout(loadSavedMissions, 1500);
  };

  const handleExecuteMission = async (mission: Mission) => {
    setIsExecuting(true);
    const response = await novaOrchestrator.generateOutreach(mission);
    setExecutionResult({ mission, response });
    setIsExecuting(false);
  };

  const handleSaveToCrm = async (mission: Mission, withReminder: boolean) => {
    setSavingMissionName(mission.contactName);
    const success = await leadService.promoteMissionToCrm(mission, withReminder);
    
    if (success) {
      setFeedback({ 
        message: withReminder ? "Mission saved with follow-up reminder." : "Mission saved to CRM vault.", 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 3000);
      loadSavedMissions(); // Refresh status
    }
    setSavingMissionName(null);
  };

  const handleSendEmail = async () => {
    if (!executionResult) return;
    setIsSending(true);
    setEmailStatus('idle');

    const success = await novaOrchestrator.sendEmail(
      WALID_IDENTITY.email,
      executionResult.response,
      executionResult.mission.contactName
    );

    if (success) {
      setEmailStatus('success');
      setTimeout(() => {
        setMissions(prev => prev.filter(m => m.contactName !== executionResult.mission.contactName));
        setExecutionResult(null);
        setEmailStatus('idle');
      }, 2000);
    } else {
      setEmailStatus('error');
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-12 h-full max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000 relative">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-24 right-10 z-[110] animate-in slide-in-from-right-4 fade-in">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
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
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{WALID_IDENTITY.fullName}'s Secure Node</p>
            {isRefreshing && (
               <>
                 <span className="text-slate-200 mx-2">|</span>
                 <span className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
                   Big Brain Processing...
                 </span>
               </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleWakeUp} 
            disabled={isRefreshing}
            className={`px-6 py-4 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 disabled:opacity-50`}
          >
             <Radar className={`w-5 h-5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
               {isRefreshing ? 'Thinking...' : 'Wake Up Big Brain'}
             </span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3">
             <Calendar className="w-4 h-4 text-indigo-600" /> Autonomous Daily Missions
           </h3>
        </div>

        {missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {missions.map((m, i) => (
              <MissionCard 
                key={i} 
                mission={m} 
                onExecute={handleExecuteMission} 
                onSave={handleSaveToCrm}
                isSaving={savingMissionName === m.contactName}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-24 text-center flex flex-col items-center gap-6 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                {isRefreshing ? (
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                ) : (
                  <Target className="w-10 h-10 text-indigo-500 animate-pulse" />
                )}
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {isRefreshing ? 'Intelligence Synthesis' : 'Big Brain Standby'}
                </h3>
                <p className="text-slate-400 font-medium max-w-sm mt-3 leading-relaxed text-sm">
                  {isRefreshing 
                    ? 'Nova is currently infiltrating Arab markets and precomputing 33 daily strategic missions in the background.' 
                    : 'No intelligence precomputed for today. Activate the Big Brain to initiate the autonomous discovery pipeline.'}
                </p>
             </div>
             {!isRefreshing && (
               <button 
                 onClick={handleWakeUp} 
                 className="mt-4 px-10 py-4 bg-indigo-600 text-white font-black text-[10px] rounded-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3"
               >
                 <Rocket className="w-4 h-4" />
                 Initialize Big Brain
               </button>
             )}
          </div>
        )}
      </div>

      {executionResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-8">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95">
            <div className="bg-slate-950 p-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                 <BadgeDollarSign className="w-8 h-8 text-emerald-400" />
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Strategy Approval</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Recipient: {executionResult.mission.contactName}</p>
                 </div>
              </div>
              <button onClick={() => setExecutionResult(null)} className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400"><X className="w-8 h-8" /></button>
            </div>
            <div className="p-12 overflow-y-auto max-h-[50vh] bg-slate-50">
              <div className="p-10 bg-white border border-slate-200 rounded-[2rem] text-lg text-slate-800 font-medium leading-relaxed whitespace-pre-line shadow-sm italic relative">
                {executionResult.response}
              </div>
              
              {emailStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold">Resend Fault: Connection error or domain limit reached.</p>
                </div>
              )}
            </div>
            <div className="p-10 bg-white border-t border-slate-100 flex justify-end gap-4">
               <button 
                 onClick={() => setExecutionResult(null)} 
                 className="px-8 py-4 bg-slate-100 text-slate-600 font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 Discard
               </button>
               <button 
                 onClick={handleSendEmail}
                 disabled={isSending || emailStatus === 'success'}
                 className={`px-10 py-4 font-black text-[10px] rounded-xl uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
                   emailStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                 }`}
               >
                 {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : emailStatus === 'success' ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                 {emailStatus === 'success' ? 'Dispatched' : 'Send Strategic Mail'}
               </button>
            </div>
          </div>
        </div>
      )}

      {isExecuting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Big Brain Drafting Outreach...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
