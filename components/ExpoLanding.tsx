
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Target, 
  Zap, 
  Users,
  ExternalLink,
  ChevronRight,
  Radar,
  Loader2,
  Calendar,
  Linkedin,
  Bell,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  UserPlus,
  Square,
  CheckSquare,
  Save,
  Terminal,
  BrainCircuit,
  ShieldAlert
} from 'lucide-react';
import { WALID_IDENTITY } from '../services/identityService';
import { EquineEvent, Reminder, Lead, DealStage, ARAB_MIDDLE_EAST_COUNTRIES } from '../types';
import { eventService } from '../services/eventService';
import { leadService } from '../services/leadService';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { saveMemory } from '../services/memoryService';

const ExpoLanding: React.FC = () => {
  const [events, setEvents] = useState<EquineEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [activeReminderEventId, setActiveReminderEventId] = useState<string | null>(null);
  const [savingOrganizerId, setSavingOrganizerId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'Event Check-in',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await eventService.getAllEvents();
    setEvents(data);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEventIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEventIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedEventIds.size === events.length && events.length > 0) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(events.map(e => e.id)));
    }
  };

  const handleDiscovery = async () => {
    setIsRefreshing(true);
    setThoughtStream([
      "Waking Strategic Big Brain...",
      "Mapping 2026 Arab Regional Calendar...",
      "Scanning GCC Tournament Registries...",
      "Applying Strict Geographic Filters..."
    ]);

    try {
      const discovered = await novaOrchestrator.discoverArabMarketEvents(2026);
      setEvents(discovered);
      setFeedback({ message: `Big Brain identified ${discovered.length} regional events.`, type: 'success' });
    } catch (error) {
      setFeedback({ message: "Discovery engine recalibration required.", type: 'error' });
    } finally {
      setIsRefreshing(false);
      setThoughtStream([]);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleBulkSyncOrganizers = async () => {
    if (selectedEventIds.size === 0) return;
    setIsBulkSyncing(true);
    setFeedback({ message: `Syncing ${selectedEventIds.size} regional organizers...`, type: 'info' });
    
    const selectedEvents = events.filter(e => selectedEventIds.has(e.id));
    let count = 0;
    
    for (const event of selectedEvents) {
      const success = await handleSaveOrganizer(event, true);
      if (success) count++;
    }
    
    setFeedback({ message: `Successfully synced ${count} organizers to CRM.`, type: 'success' });
    setSelectedEventIds(new Set());
    setIsBulkSyncing(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveOrganizer = async (event: EquineEvent, isSilent: boolean = false): Promise<boolean> => {
    if (!isSilent) setSavingOrganizerId(event.id);
    const newLead: Lead = {
      id: `lead-expo-${event.id}`,
      firstName: event.organizer,
      lastName: '(Organizer)',
      title: 'Event Organizer',
      roleType: 'Decision Maker',
      companyId: event.id,
      companyName: event.organizer,
      companyDomain: event.website,
      email: event.email || 'verified@nova.secure',
      linkedin: event.linkedin || '',
      status: 'SAVED',
      dealStage: 'Discovery' as DealStage,
      // Fixed: changed 'Competition' to 'Racing & Competition' to match HorseCategory union type.
      horseCategory: 'Racing & Competition',
      horseSubCategory: 'Racing Event',
      discoveredAt: new Date().toISOString(),
      temperature: 'Cold',
      source: `Arab Expo Hub: ${event.name} (${event.year})`,
      reminders: []
    };

    try {
      const success = await leadService.promoteToCrm(newLead);
      if (success) {
        await saveMemory({
          entityId: newLead.id,
          type: 'action',
          category: 'ACTION',
          content: `Saved regional organizer from Arab Expo Hub. Event: ${event.name}.`
        });
        if (!isSilent) {
          setFeedback({ message: `${event.organizer} added to CRM.`, type: 'success' });
          setTimeout(() => setFeedback(null), 3000);
        }
        return true;
      } else {
        if (!isSilent) {
          setFeedback({ message: `${event.organizer} already in CRM.`, type: 'info' });
          setTimeout(() => setFeedback(null), 3000);
        }
        return false;
      }
    } catch (e) {
      console.error("Failed to save organizer", e);
      return false;
    } finally {
      if (!isSilent) setSavingOrganizerId(null);
    }
  };

  const handleAddReminder = async (eventId: string) => {
    if (!newReminder.date || !newReminder.note) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const reminder: Reminder = {
      id: `rem-event-${Date.now()}`,
      date: newReminder.date,
      type: newReminder.type as Reminder['type'],
      note: newReminder.note,
      isCompleted: false
    };

    const updatedReminders = [...(event.reminders || []), reminder];
    await eventService.updateEventReminders(eventId, updatedReminders);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reminders: updatedReminders } : e));
    
    await saveMemory({
      entityId: eventId,
      type: 'action',
      category: 'ACTION',
      content: `Set a ${reminder.type} reminder for regional event: ${event.name}.`
    });

    setActiveReminderEventId(null);
    setNewReminder({ type: 'Event Check-in', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const toggleReminderComplete = async (eventId: string, reminderId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const updated = (event.reminders || []).map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r);
    await eventService.updateEventReminders(eventId, updated);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reminders: updated } : e));
  };

  const deleteReminder = async (eventId: string, reminderId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const updated = (event.reminders || []).filter(r => r.id !== reminderId);
    await eventService.updateEventReminders(eventId, updated);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reminders: updated } : e));
  };

  const formatUrl = (url?: string): string => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <div className="min-h-full bg-white flex flex-col animate-in fade-in duration-700 relative">
      {/* SCOPE OVERLAY */}
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
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Activating Big Brain</h3>
                 <div className="bg-black/50 rounded-3xl p-8 border border-white/10 font-mono text-left space-y-3 overflow-hidden shadow-2xl">
                    {thoughtStream.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-emerald-400 animate-in slide-in-from-left-4">
                         <Terminal className="w-3.5 h-3.5" />
                         <span className="tracking-tight">{t}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-[11px] text-indigo-400">
                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       <span className="animate-pulse font-black">Scanning Arab Market Registry...</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedEventIds.size > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-8 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {selectedEventIds.size} Events Selected
              </span>
              <span className="text-[8px] font-bold text-slate-400">Regional CRM Sync</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <button 
              onClick={handleBulkSyncOrganizers}
              disabled={isBulkSyncing}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg"
            >
              {isBulkSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Selected Organizers
            </button>
            <button 
              onClick={() => setSelectedEventIds(new Set())}
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

      <section className="relative px-6 py-20 bg-slate-950 text-white overflow-hidden rounded-[3rem] mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Award className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Regional Intelligence Scope</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6 leading-[0.9]">
            Arab Expo Hub <br/>
            <span className="text-indigo-500 italic">2026 Discovery</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mb-10">
            Discovery is strictly locked to approved Arab & Middle East market nodes. Identifying elite equestrian decision makers across GCC and regional hubs.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl w-fit">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-200 italic">Targeting {ARAB_MIDDLE_EAST_COUNTRIES.length} Regional Jurisdictions</span>
            </div>
            <button 
              onClick={handleDiscovery}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-2xl w-fit shadow-2xl shadow-indigo-500/40 active:scale-95 disabled:opacity-50 border border-indigo-400/20"
            >
              <Radar className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="text-xs font-black uppercase tracking-widest text-white">
                {isRefreshing ? 'Scanning Regional Market...' : 'Refresh 2026 Arab Events'}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 mb-12">
        <div className="flex items-center justify-between mb-10 px-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Regional Event Registry</h2>
            {events.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline"
              >
                {selectedEventIds.size === events.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedEventIds.size === events.length ? 'Deselect All' : 'Select All Events'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-full shadow-lg">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{events.length} Regional Nodes</span>
          </div>
        </div>
        
        {events.length === 0 && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center p-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] text-center">
            <Radar className="w-16 h-16 text-slate-200 mb-6 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Regional Standby</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-3">Trigger the Arab & Middle East discovery scan to identify 2026 exhibitions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className={`bg-white border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col relative ${selectedEventIds.has(ev.id) ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSelect(ev.id)}
                      className={`shrink-0 transition-colors ${selectedEventIds.has(ev.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
                    >
                      {selectedEventIds.has(ev.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                    </button>
                    <div className="p-2.5 bg-slate-950 rounded-2xl group-hover:bg-indigo-600 transition-colors shadow-lg">
                      <Calendar className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-[9px] font-black uppercase tracking-widest text-emerald-600 rounded-full border border-emerald-100">
                      {ev.country}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-indigo-600 transition-colors truncate">{ev.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{ev.month} 2026</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Organizer</span>
                      <span className="text-xs font-black text-slate-700 truncate">{ev.organizer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-bold text-slate-500 italic">{ev.city}</span>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                   <button 
                    onClick={() => handleSaveOrganizer(ev)}
                    disabled={savingOrganizerId === ev.id}
                    className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {savingOrganizerId === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Save Organizer
                  </button>
                  <button 
                    onClick={() => setActiveReminderEventId(ev.id)}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" /> Manage Reminders
                  </button>
                </div>

                {activeReminderEventId === ev.id && (
                  <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 flex flex-col animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Event Reminders</span>
                       <button onClick={() => setActiveReminderEventId(null)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-1">
                       {ev.reminders && ev.reminders.map(rem => (
                         <div key={rem.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <button onClick={() => toggleReminderComplete(ev.id, rem.id)} className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${rem.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                              {rem.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <div className="min-w-0 flex-1">
                               <p className={`text-[10px] font-bold leading-tight ${rem.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{rem.note}</p>
                               <span className="text-[8px] font-black text-slate-400 uppercase">{rem.date}</span>
                            </div>
                            <button onClick={() => deleteReminder(ev.id, rem.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                         </div>
                       ))}
                    </div>
                    <div className="space-y-2">
                       <input 
                         type="text" 
                         placeholder="New note..." 
                         value={newReminder.note} 
                         onChange={(e) => setNewReminder({...newReminder, note: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none"
                       />
                       <div className="flex gap-2">
                         <input 
                           type="date" 
                           value={newReminder.date} 
                           onChange={(e) => setNewReminder({...newReminder, date: e.target.value})} 
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none"
                         />
                         <button onClick={() => handleAddReminder(ev.id)} className="p-2 bg-indigo-600 text-white rounded-xl"><Plus className="w-5 h-5" /></button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50 rounded-[3rem] p-10 md:p-16 mb-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shrink-0">
            {WALID_IDENTITY.fullName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{WALID_IDENTITY.fullName}</h2>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">{WALID_IDENTITY.role} • {WALID_IDENTITY.companyName}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Secure Sovereign Identity</span>
               </div>
               <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Enterprise CRM Linked</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExpoLanding;
