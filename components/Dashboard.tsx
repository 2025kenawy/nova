
import React, { useState, useEffect } from 'react';
import { 
  Target, Sparkles, Radar, BrainCircuit, 
  Loader2, X, ChevronRight, CheckCircle2,
  Cpu, Activity, BadgeDollarSign, ShieldCheck, Calendar,
  Mail, Send, Check, ExternalLink
} from 'lucide-react';
import { novaClient } from '../services/novaClient';
import { WALID_IDENTITY } from '../services/identityService';

const ThinkingOverlay = ({ stage }: { stage: string }) => (
  <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
    <Cpu className="w-16 h-16 text-indigo-600 animate-pulse mb-6" />
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{stage}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Consulting Equine Intelligence</p>
  </div>
);

interface MissionCardProps {
  mission: any;
  onExecute: (m: any) => void | Promise<void>;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onExecute }) => {
  return (
    <div className="group border border-slate-200 bg-white rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-1">
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
        <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">{mission.priority}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stable Intelligence</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{mission.explanation}"</p>
        </div>

        <div className="flex items-center justify-between">
           <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Purchase Signal</span>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${mission.confidence}%` }} />
                 </div>
                 <span className="text-[9px] font-black text-emerald-600">{mission.confidence}%</span>
              </div>
           </div>
           <button 
             onClick={() => onExecute(mission)}
             className="px-8 py-3.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
           >
             Action <ChevronRight className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ mission: any; response: string } | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    loadMissions();
    const connected = localStorage.getItem('nova_gmail_connected') === 'true';
    setIsGmailConnected(connected);
  }, []);

  const loadMissions = async () => {
    setLoadingStage('Auditing Stable Networks');
    const results = await novaClient.getDailyCommands();
    setMissions(results || []);
    setLoadingStage(null);
  };

  const handleExecuteMission = async (mission: any) => {
    setIsExecuting(true);
    const response = await novaClient.generateOutreach(mission);
    setExecutionResult({ mission, response });
    setIsExecuting(false);
  };

  const handleSendEmail = async () => {
    if (!executionResult) return;
    if (!isGmailConnected) {
      setShowConnectModal(true);
      return;
    }

    setIsSending(true);
    const lines = executionResult.response.split('\n');
    const subjectLine = lines.find(l => l.toLowerCase().includes('subject:')) || 'Regarding your horse operations';
    const bodyText = executionResult.response.replace(subjectLine, '').trim();

    const success = await novaClient.sendEmail(
      `${executionResult.mission.contactName.toLowerCase().replace(' ', '.')}@example.com`,
      subjectLine.replace(/subject:/i, '').trim(),
      bodyText,
      executionResult.mission.contactName
    );

    if (success) {
      setMissions(prev => prev.filter(m => m.contactName !== executionResult.mission.contactName));
      setExecutionResult(null);
    }
    setIsSending(false);
  };

  const connectGmail = async () => {
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsGmailConnected(true);
    localStorage.setItem('nova_gmail_connected', 'true');
    setIsSending(false);
    setShowConnectModal(false);
  };

  return (
    <div className="space-y-12 h-full max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000">
      <div className="flex items-end justify-between border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="p-2 bg-slate-950 rounded-xl shadow-lg">
                <Target className="w-6 h-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Command Center</h1>
          </div>
          <div className="flex items-center gap-2 ml-14">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{WALID_IDENTITY.fullName}'s Secure Instance</p>
            <span className="text-slate-200 mx-2">|</span>
            <a 
              href={WALID_IDENTITY.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-indigo-700 hover:underline flex items-center gap-1 transition-all"
            >
              {WALID_IDENTITY.website.replace('https://', '')}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isGmailConnected && (
            <button 
              onClick={() => setShowConnectModal(true)}
              className="px-6 py-4 bg-red-50 text-red-600 rounded-full border border-red-100 shadow-sm hover:bg-red-100 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
            >
              <Mail className="w-4 h-4" /> Connect Gmail
            </button>
          )}
          <button onClick={loadMissions} className="px-6 py-4 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-lg transition-all flex items-center gap-4">
             <Radar className="w-5 h-5 text-indigo-600 animate-spin-slow" />
             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Re-Scan Stables</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3">
             <Calendar className="w-4 h-4 text-indigo-600" /> Daily Missions (Max 7)
           </h3>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {missions.length} of 7 Strategic Slots Filled
           </span>
        </div>

        {loadingStage ? (
          <ThinkingOverlay stage={loadingStage} />
        ) : missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {missions.map((m, i) => <MissionCard key={i} mission={m} onExecute={handleExecuteMission} />)}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-24 text-center flex flex-col items-center gap-6 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Deck Clear.</h3>
                <p className="text-slate-400 font-medium max-w-sm mt-3 leading-relaxed text-sm">No high-intent equestrian signals require immediate intervention. Enjoy the calm, Walid.</p>
             </div>
             <button onClick={loadMissions} className="mt-4 px-10 py-4 bg-indigo-600 text-white font-black text-[10px] rounded-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">Deep Market Audit</button>
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
                    <h3 className="text-2xl font-black uppercase tracking-tight">Approve Outreach</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">To: {executionResult.mission.contactName}</p>
                 </div>
              </div>
              <button onClick={() => setExecutionResult(null)} className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400"><X className="w-8 h-8" /></button>
            </div>
            <div className="p-12 overflow-y-auto max-h-[50vh] bg-slate-50">
              <div className="p-10 bg-white border border-slate-200 rounded-[2rem] text-lg text-slate-800 font-medium leading-relaxed whitespace-pre-line shadow-sm italic relative">
                {executionResult.response}
                <div className="mt-8 pt-8 border-t border-slate-100 not-italic text-sm">
                  <p className="font-bold text-slate-900">{WALID_IDENTITY.fullName}</p>
                  <p className="text-slate-500">{WALID_IDENTITY.role} | {WALID_IDENTITY.companyName}</p>
                  <a 
                    href={WALID_IDENTITY.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    {WALID_IDENTITY.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            <div className="p-10 bg-white border-t border-slate-100 flex justify-end gap-4">
               <button 
                 onClick={() => setExecutionResult(null)} 
                 className="px-8 py-4 bg-slate-100 text-slate-600 font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 Dismiss
               </button>
               <button 
                 onClick={handleSendEmail}
                 disabled={isSending}
                 className="px-10 py-4 bg-indigo-600 text-white font-black text-[10px] rounded-xl uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
               >
                 {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 {isGmailConnected ? 'Send via Gmail' : 'Connect & Send'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail OAuth Simulation Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-8">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl border border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                <Mail className="w-10 h-10 text-indigo-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Connect {WALID_IDENTITY.fullName}'s Gmail</h3>
             <p className="text-sm text-slate-500 leading-relaxed mb-10">
               Nova requires OAuth access to your professional Gmail account at {WALID_IDENTITY.email} to send high-intent equestrian outreach.
             </p>
             <div className="space-y-3">
                <button 
                  onClick={connectGmail}
                  className="w-full py-5 bg-slate-900 text-white font-black text-xs rounded-xl uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />}
                  Connect via Google
                </button>
                <button 
                  onClick={() => setShowConnectModal(false)}
                  className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
             </div>
          </div>
        </div>
      )}

      {isExecuting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Nova drafting outreach...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
