
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Linkedin, Mail, Phone, Globe, Calendar, Clock, Sparkles, 
  CheckCircle2, Ban, History, StickyNote, Target, Zap, ChevronRight,
  ShieldCheck, MoreHorizontal, User, Thermometer, Bell, Plus, X, Trash2,
  Ticket, MessageCircle, Shield
} from 'lucide-react';
import { Lead, MemoryEntry, RelationshipTemperature, Reminder } from '../types';
import { leadService } from '../services/leadService';
import { getMemoriesForEntity, saveMemory } from '../services/memoryService';

interface CrmDetailProps {
  leadId: string;
  onBack: () => void;
}

const CrmDetail: React.FC<CrmDetailProps> = ({ leadId, onBack }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<MemoryEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappPermission, setWhatsappPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'Follow-up',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const loadDossier = async () => {
      setIsLoading(true);
      const data = await leadService.getLeadById(leadId);
      const history = await getMemoriesForEntity(leadId);
      if (data) {
        setLead(data);
        setNotes(data.notes || '');
        setWhatsappNumber(data.whatsapp || '');
        setWhatsappPermission(data.whatsappPermission || false);
        setTimeline(history);
      }
      setIsLoading(false);
    };
    loadDossier();
  }, [leadId]);

  const handleSaveNotes = async () => {
    if (!lead) return;
    await leadService.updateLeadNotes(leadId, notes);
  };

  const handleSaveWhatsApp = async () => {
    if (!lead) return;
    await leadService.updateLeadWhatsApp(leadId, whatsappNumber, whatsappPermission);
    
    // Added category: 'ENGAGEMENT' to fix missing property error
    await saveMemory({
      entityId: leadId,
      type: 'action',
      category: 'ENGAGEMENT',
      content: `Updated WhatsApp details: ${whatsappNumber}. Permission: ${whatsappPermission ? 'GRANTED' : 'REVOKED'}.`
    });
    
    const history = await getMemoriesForEntity(leadId);
    setTimeline(history);
  };

  const startWhatsApp = () => {
    if (!whatsappNumber) return;
    const sanitized = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${sanitized}`, '_blank');
  };

  const handleAction = async (action: 'done' | 'snooze' | 'ignore') => {
    if (!lead) return;
    const content = `Action: [${action.toUpperCase()}] for recommended step.`;
    // Added category: 'ACTION' to fix missing property error
    const newMemory = await saveMemory({
      entityId: leadId,
      type: 'action',
      category: 'ACTION',
      content
    });
    setTimeline(prev => [...prev, newMemory]);
  };

  const handleTemperatureChange = async (temp: RelationshipTemperature) => {
    if (!lead) return;
    await leadService.updateLeadTemperature(leadId, temp);
    setLead(prev => prev ? { ...prev, temperature: temp } : null);
    
    // Added category: 'SYSTEM' to fix missing property error
    await saveMemory({
      entityId: leadId,
      type: 'decision',
      category: 'SYSTEM',
      content: `Relationship temperature manually set to ${temp}.`
    });
    // Refresh timeline
    const history = await getMemoriesForEntity(leadId);
    setTimeline(history);
  };

  const handleAddReminder = async () => {
    if (!lead || !newReminder.date || !newReminder.note) return;
    
    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      date: newReminder.date,
      type: newReminder.type as Reminder['type'],
      note: newReminder.note,
      isCompleted: false
    };

    const updatedReminders = [...(lead.reminders || []), reminder];
    await leadService.updateLeadReminders(leadId, updatedReminders);
    setLead(prev => prev ? { ...prev, reminders: updatedReminders } : null);
    
    // Added category: 'ACTION' to fix missing property error
    await saveMemory({
      entityId: leadId,
      type: 'action',
      category: 'ACTION',
      content: `Set a ${reminder.type} reminder for ${reminder.date}.`
    });

    setShowAddReminder(false);
    setNewReminder({ type: 'Follow-up', date: new Date().toISOString().split('T')[0], note: '' });
    
    const history = await getMemoriesForEntity(leadId);
    setTimeline(history);
  };

  const toggleReminderComplete = async (reminderId: string) => {
    if (!lead) return;
    const updated = (lead.reminders || []).map(r => 
      r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
    );
    await leadService.updateLeadReminders(leadId, updated);
    setLead(prev => prev ? { ...prev, reminders: updated } : null);
  };

  const deleteReminder = async (reminderId: string) => {
    if (!lead) return;
    const updated = (lead.reminders || []).filter(r => r.id !== reminderId);
    await leadService.updateLeadReminders(leadId, updated);
    setLead(prev => prev ? { ...prev, reminders: updated } : null);
  };

  const formatUrl = (url?: string): string => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  const getTemperatureColor = (temp?: RelationshipTemperature) => {
    switch (temp) {
      case 'Hot': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Warm': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Sparkles className="w-10 h-10 animate-pulse text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest">Compiling Dossier...</p>
    </div>
  );

  if (!lead) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group mb-4"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Intelligence Inbox</span>
      </button>

      {/* SECTION 1 — HEADER (IDENTITY) */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl">
              {lead.firstName[0]}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                {lead.firstName} {lead.lastName}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{lead.title}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{lead.companyName}</span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {lead.horseCategory} • {lead.horseSubCategory || 'Equine Sector'}
                </p>
                {lead.source && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 text-[9px] font-black uppercase tracking-widest text-indigo-600 rounded border border-indigo-100 w-fit">
                    <Ticket className="w-3 h-3" /> {lead.source}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {whatsappNumber && (
              <button 
                onClick={startWhatsApp}
                className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 hover:bg-[#25D366] hover:text-white transition-all shadow-sm flex items-center gap-2 px-4"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Chat</span>
              </button>
            )}
            {lead.linkedin && (
              <a href={formatUrl(lead.linkedin)} target="_blank" className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            <a href={`mailto:${lead.email}`} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
              <Mail className="w-5 h-5" />
            </a>
            <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 2 — RELATIONSHIP STATUS */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm grid grid-cols-4 gap-6">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Relationship Stage</span>
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Target className="w-4 h-4 text-indigo-500" />
                {lead.dealStage || 'Discovery'}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Temperature</span>
              <div className="group relative">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${getTemperatureColor(lead.temperature)}`}>
                  <Thermometer className="w-3.5 h-3.5" />
                  {lead.temperature || 'Cold'}
                </div>
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 hidden group-hover:block z-20">
                  <div className="flex flex-col gap-1 w-24">
                    {(['Cold', 'Warm', 'Hot'] as RelationshipTemperature[]).map(t => (
                      <button 
                        key={t}
                        onClick={() => handleTemperatureChange(t)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-all ${lead.temperature === t ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Intelligence Saved</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
                <Calendar className="w-4 h-4 text-slate-300" />
                {lead.discoveredAt ? new Date(lead.discoveredAt).toLocaleDateString() : 'Initial Contact'}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Last Interaction</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
                <Clock className="w-4 h-4 text-slate-300" />
                {timeline.length > 0 ? new Date(timeline[timeline.length - 1].timestamp).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* SECTION WHATSAPP MANAGEMENT */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Communication Channels</h3>
              </div>
              <button 
                onClick={handleSaveWhatsApp}
                className="text-[9px] font-black uppercase text-indigo-600 hover:underline"
              >
                Save Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+971 00 000 0000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Compliance Status</label>
                <button 
                  onClick={() => setWhatsappPermission(!whatsappPermission)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${whatsappPermission ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-4 h-4 ${whatsappPermission ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Chat Permission</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${whatsappPermission ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${whatsappPermission ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3 — NOVA INTELLIGENCE (READ-ONLY) */}
          <div className="bg-indigo-600/5 border border-indigo-100 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900">Nova Intelligence Dossier</h3>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest block mb-3">Market Insight</span>
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-2 border-indigo-200 pl-6">
                  {lead.source?.includes('Expo') 
                    ? "Verified stakeholder from Arab Market Expo discovery. Key relationship potential identified within official equine events."
                    : "High-authority decision maker in the Middle Eastern equestrian sector. Strong alignment with elite breeding standards and specialized supply logistics."}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest block mb-3">Strategic Alignment</span>
                <div className="p-6 bg-white/50 rounded-2xl border border-indigo-100 text-xs font-bold text-indigo-900 leading-relaxed">
                  Focus on heritage value and technical efficiency. {lead.source?.includes('Expo') ? 'Maintain presence at discovered event nodes to strengthen relationship.' : 'Recommended value proposition: Premium logistics for high-value breeding operations.'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — TIMELINE */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Relationship Timeline</h3>
            </div>
            
            <div className="space-y-8 relative">
              <div className="absolute left-[1.375rem] top-2 bottom-2 w-px bg-slate-100" />
              
              {timeline.length === 0 ? (
                <div className="flex items-center gap-6 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 relative z-10 ring-4 ring-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">New Dossier Created</p>
                </div>
              ) : (
                timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-6 relative z-10">
                    <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                      {entry.content.includes('Expo Hub') ? <Ticket className="w-4 h-4 text-indigo-500" /> : entry.type === 'action' ? <Zap className="w-4 h-4" /> : entry.type === 'decision' ? <Target className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                        {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <p className="text-xs font-bold text-slate-700">{entry.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* SECTION 4 — NEXT ACTION (FOCUS) */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Next Focus</h3>
            </div>
            
            <div className="mb-8">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nova Recommended Step</span>
              <p className="text-sm font-bold leading-relaxed">
                {lead.source?.includes('Expo') 
                  ? "Refer to discovered Expo source to establish immediate trust and context."
                  : "Send professional strategic overview emphasizing logistical efficiency."}
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleAction('done')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Done
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAction('snooze')}
                  className="py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all border border-white/10"
                >
                  Snooze
                </button>
                <button 
                  onClick={() => handleAction('ignore')}
                  className="py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all border border-white/10"
                >
                  Ignore
                </button>
              </div>
            </div>
          </div>

          {/* REMINDERS SECTION */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Reminders</h3>
              </div>
              <button 
                onClick={() => setShowAddReminder(true)}
                className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {showAddReminder && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">New Reminder</span>
                    <button onClick={() => setShowAddReminder(false)}><X className="w-3 h-3 text-slate-400" /></button>
                  </div>
                  <div className="space-y-3">
                    <select 
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value as Reminder['type']})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none"
                    >
                      <option>Follow-up</option>
                      <option>Event Check-in</option>
                      <option>Meeting</option>
                      <option>Contract Review</option>
                    </select>
                    <input 
                      type="date" 
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none"
                    />
                    <textarea 
                      placeholder="Note..."
                      value={newReminder.note}
                      onChange={(e) => setNewReminder({...newReminder, note: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none h-16 resize-none"
                    />
                    <button 
                      onClick={handleAddReminder}
                      className="w-full py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Create Reminder
                    </button>
                  </div>
                </div>
              )}

              {(!lead.reminders || lead.reminders.length === 0) && !showAddReminder ? (
                <p className="text-[9px] font-medium text-slate-400 italic text-center py-4">No active reminders.</p>
              ) : (
                (lead.reminders || []).map(r => (
                  <div key={r.id} className={`group flex items-start gap-4 p-4 rounded-xl border transition-all ${r.isCompleted ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                    <button 
                      onClick={() => toggleReminderComplete(r.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${r.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}
                    >
                      {r.isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${r.isCompleted ? 'text-slate-400' : 'text-indigo-600'}`}>{r.type}</span>
                        <span className="text-[8px] font-bold text-slate-400">{r.date}</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed font-medium ${r.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{r.note}</p>
                    </div>
                    <button 
                      onClick={() => deleteReminder(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 6 — NOTES */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <StickyNote className="w-4 h-4 text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Personal Notes</h3>
              </div>
              <button onClick={handleSaveNotes} className="text-[9px] font-black uppercase text-indigo-600 hover:underline">Auto-Save</button>
            </div>
            <textarea
              className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none"
              placeholder="Record strategic nuances here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
            />
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
              <User className="w-2.5 h-2.5" /> Private to Walid's Instance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmDetail;
