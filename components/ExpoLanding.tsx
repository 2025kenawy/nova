
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
  ShieldAlert,
  Sparkles,
  Plane,
  PlaneTakeoff,
  Timer,
  CreditCard,
  Search
} from 'lucide-react';
import { WALID_IDENTITY } from '../services/identityService';
import { EquineEvent, Reminder, Lead, DealStage, ARAB_MIDDLE_EAST_COUNTRIES, FlightOption } from '../types';
import { eventService } from '../services/eventService';
import { leadService } from '../services/leadService';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { saveMemory } from '../services/memoryService';
import { serverGetFlightIntelligence } from '../services/aiService';

const ExpoLanding: React.FC = () => {
  const [events, setEvents] = useState<EquineEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [activeReminderEventId, setActiveReminderEventId] = useState<string | null>(null);
  const [savingOrganizerId, setSavingOrganizerId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  
  // Flight Deck State
  const [showFlightDeck, setShowFlightDeck] = useState(false);
  const [isFindingFlights, setIsFindingFlights] = useState(false);
  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([]);
  const [activeFlightEvent, setActiveFlightEvent] = useState<EquineEvent | null>(null);
  const [travelDate, setTravelDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

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

  const handleFindFlights = async (event: EquineEvent) => {
    setActiveFlightEvent(event);
    setShowFlightDeck(true);
    setIsFindingFlights(true);
    const origin = WALID_IDENTITY.location;
    const destination = `${event.city}, ${event.country}`;
    try {
      const flights = await serverGetFlightIntelligence(origin, destination, travelDate);
      setFlightOptions(flights);
    } catch (error) {
      console.error("Failed to find flights:", error);
    } finally {
      setIsFindingFlights(false);
    }
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
      "Activating Strategic Intelligence Core (Gemini 3 Pro)...",
      "Requesting exactly 33 high-value Arab Market Events...",
      "Geographic Whitelist: 9 Middle Eastern Nations...",
      "Vertical Lockdown: Vetting Horse-Industry focus...",
      "Analyzing Event Authority and Organizing Commitees...",
      "Synthesizing 2026 Equestrian Calendar..."
    ]);

    try {
      const discovered = await novaOrchestrator.discoverArabMarketEvents(2026);
      setEvents(discovered);
      setFeedback({ message: `Big Brain identified ${discovered.length} regional events.`, type: 'success' });
    } catch (error) {
      setFeedback({ message: "Intelligence core recalibration required.", type: 'error' });
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
      lastName: `(${event.country})`,
      title: 'Event Organizer',
      roleType: 'Decision Maker',
      companyId: event.id,
      companyName: event.organizer,
      companyDomain: event.website,
      email: event.email || 'verified@nova.secure',
      linkedin: event.linkedin || '',
      status: 'SAVED',
      dealStage: 'Discovery' as DealStage,
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

  return (
    <div className="min-h-full bg-white flex flex-col animate-in fade-in duration-700 relative selection:bg-indigo-500/30">
      
      {/* FLIGHT DECK MODAL */}
      {showFlightDeck && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl max-w-5xl w-full relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <Plane className="w-80 h-80 text-white" />
             </div>
             
             <div className="flex items-center justify-between mb-10 relative z-10">
               <div className="flex items-center gap-5">
                 <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                    <PlaneTakeoff className="w-7 h-7 text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none mb-1.5">Event Flight Deck</h3>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Travel Corridors for {activeFlightEvent?.name}</span>
                 </div>
               </div>
               <button onClick={() => setShowFlightDeck(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-white" />
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-10">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Origin Node</span>
                   <p className="text-sm font-black text-white">{WALID_IDENTITY.location}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Destination Hub</span>
                   <p className="text-sm font-black text-white">{activeFlightEvent?.city}, {activeFlightEvent?.country}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Planned Date</span>
                   <input 
                     type="date" 
                     value={travelDate} 
                     onChange={(e) => setTravelDate(e.target.value)} 
                     className="bg-transparent text-white text-sm font-black outline-none w-full cursor-pointer"
                   />
                </div>
             </div>

             {isFindingFlights ? (
               <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-50">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Negotiating Regional Air Corridors...</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {flightOptions.map((option, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col hover:-translate-y-2 transition-all group">
                       <div className="flex justify-between items-start mb-8">
                         <div className="px-4 py-1.5 bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-full border border-indigo-100 shadow-sm">
                           {option.type}
                         </div>
                         <Radar className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                       </div>
                       
                       <div className="mb-8">
                         <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">{option.route}</h4>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{option.carrier}</p>
                       </div>

                       <div className="space-y-5 mb-10">
                         <div className="flex items-center justify-between text-[13px] font-black">
                            <div className="flex items-center gap-3 text-slate-500">
                               <Timer className="w-5 h-5" />
                               <span>{option.duration}</span>
                            </div>
                            <div className="flex items-center gap-3 text-emerald-600">
                               <CreditCard className="w-5 h-5" />
                               <span>{option.estimatedPrice}</span>
                            </div>
                         </div>
                       </div>

                       <a 
                         href={option.searchUrl} 
                         target="_blank" 
                         className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all text-center flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/10 active:scale-95"
                       >
                         Secure Booking <ExternalLink className="w-4 h-4" />
                       </a>
                    </div>
                  ))}
                  {flightOptions.length === 0 && !isFindingFlights && (
                    <button 
                      onClick={() => handleFindFlights(activeFlightEvent!)}
                      className="col-span-3 py-16 border-2 border-dashed border-white/10 rounded-[4rem] text-slate-500 hover:text-white hover:border-white/30 transition-all flex flex-col items-center gap-6"
                    >
                      <Search className="w-10 h-10" />
                      <span className="text-sm font-black uppercase tracking-[0.4em]">Initialize 2026 Flight Protocol</span>
                    </button>
                  )}
               </div>
             )}
           </div>
        </div>
      )}

      {/* BIG BRAIN SCOPE OVERLAY */}
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
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Big Brain Scan</h3>
                 <div className="bg-black/50 rounded-3xl p-8 border border-white/10 font-mono text-left space-y-3 overflow-hidden shadow-2xl">
                    {thoughtStream.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-emerald-400 animate-in slide-in-from-left-4">
                         <Terminal className="w-3.5 h-3.5" />
                         <span className="tracking-tight">{t}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-[11px] text-indigo-400">
                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       <span className="animate-pulse font-black">Synthesizing 33 Regional Events...</span>
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

      <section className="relative px-6 py-24 bg-slate-950 text-white overflow-hidden rounded-[4rem] mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.2)]">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Award className="w-80 h-80 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl px-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 leading-none mb-1">Big Brain Intelligence</span>
               <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Arab Market Sovereign Node</span>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-8 leading-[0.85]">
            Arab Expo Hub <br/>
            <span className="text-indigo-500 italic">2026 Registry</span>
          </h1>
          <p className="text-slate-400 text-base font-medium leading-relaxed max-w-md mb-12">
            Intelligence core is locked to Horse Industry segments in the 9 whitelisted Arab territories. Discovering 33 high-impact exhibitions using Gemini 3 Pro reasoning.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] w-fit backdrop-blur-md">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col">
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-200 italic">Target: {ARAB_MIDDLE_EAST_COUNTRIES.length} Jurisdictions</span>
                 <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Geographic Lockdown Active</span>
              </div>
            </div>
            <button 
              onClick={handleDiscovery}
              disabled={isRefreshing}
              className="flex items-center gap-4 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-[1.5rem] w-fit shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50 border border-indigo-400/20 group"
            >
              <Radar className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {isRefreshing ? 'Scanning Hub...' : 'Discover 33 Events'}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 mb-12">
        <div className="flex items-center justify-between mb-12 px-8">
          <div className="flex items-center gap-8">
            <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Regional Hub Registry</h2>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified 2026 Equestrian Exhibitions</p>
            </div>
            {events.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100"
              >
                {selectedEventIds.size === events.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedEventIds.size === events.length ? 'Deselect All' : 'Select All Events'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-white/10 rounded-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{events.length} Market Nodes Found</span>
          </div>
        </div>
        
        {events.length === 0 && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center p-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[5rem] text-center shadow-inner">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-lg">
               <Radar className="w-12 h-12 text-slate-200 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Big Brain Standby</h3>
            <p className="text-slate-400 text-sm max-w-sm mt-4 font-medium leading-relaxed">
              Trigger the Strategic Hub Discovery to populate the 2026 registry with 33 high-fidelity equestrian exhibitions across the Arab region.
            </p>
            <button 
              onClick={handleDiscovery}
              className="mt-10 px-10 py-4 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95"
            >
               Initiate Big Brain Discovery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className={`bg-white border rounded-[3rem] p-10 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all group flex flex-col relative ${selectedEventIds.has(ev.id) ? 'border-indigo-500 ring-[6px] ring-indigo-500/5' : 'border-slate-100'}`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleSelect(ev.id)}
                      className={`shrink-0 transition-all transform active:scale-125 ${selectedEventIds.has(ev.id) ? 'text-indigo-600 scale-110' : 'text-slate-200 hover:text-indigo-400'}`}
                    >
                      {selectedEventIds.has(ev.id) ? <CheckSquare className="w-7 h-7" /> : <Square className="w-7 h-7" />}
                    </button>
                    <div className="p-3 bg-slate-950 rounded-2xl group-hover:bg-indigo-600 transition-colors shadow-2xl">
                      <Calendar className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-4 py-1.5 bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                      {ev.country}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-3 group-hover:text-indigo-600 transition-colors truncate">{ev.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">{ev.month} 2026</span>
                  </div>
                </div>
                
                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                    <Building2 className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Master Organizer</span>
                      <span className="text-xs font-black text-slate-700 truncate max-w-[180px]">{ev.organizer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-2">
                    <MapPin className="w-5 h-5 text-slate-200" />
                    <span className="text-xs font-bold text-slate-400 italic">{ev.city} Hub</span>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                   <button 
                    onClick={() => handleSaveOrganizer(ev)}
                    disabled={savingOrganizerId === ev.id}
                    className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {savingOrganizerId === ev.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Promote Organizer
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleFindFlights(ev)}
                      className="py-4 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Plane className="w-4 h-4" /> Flights
                    </button>
                    <button 
                      onClick={() => setActiveReminderEventId(ev.id)}
                      className="py-4 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" /> Intents
                    </button>
                  </div>
                </div>

                {activeReminderEventId === ev.id && (
                  <div className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md rounded-[3rem] p-10 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <BrainCircuit className="w-5 h-5 text-indigo-600" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900">Event Intelligence</span>
                       </div>
                       <button onClick={() => setActiveReminderEventId(null)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-5 mb-8 pr-2">
                       {ev.reminders && ev.reminders.map(rem => (
                         <div key={rem.id} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-indigo-100">
                            <button onClick={() => toggleReminderComplete(ev.id, rem.id)} className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${rem.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                              {rem.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div className="min-w-0 flex-1">
                               <p className={`text-[11px] font-bold leading-relaxed ${rem.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{rem.note}</p>
                               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2 block">{rem.date} • {rem.type}</span>
                            </div>
                            <button onClick={() => deleteReminder(ev.id, rem.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       ))}
                       {(!ev.reminders || ev.reminders.length === 0) && (
                         <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                            <Zap className="w-10 h-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Intents</p>
                         </div>
                       )}
                    </div>
                    <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                       <div className="flex items-center gap-2 mb-2 px-1">
                          <Plus className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Record Strategic Note</span>
                       </div>
                       <input 
                         type="text" 
                         placeholder="Target node objective..." 
                         value={newReminder.note} 
                         onChange={(e) => setNewReminder({...newReminder, note: e.target.value})} 
                         className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-[11px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                       />
                       <div className="flex gap-3">
                         <input 
                           type="date" 
                           value={newReminder.date} 
                           onChange={(e) => setNewReminder({...newReminder, date: e.target.value})} 
                           className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3 text-[11px] font-bold outline-none"
                         />
                         <button onClick={() => handleAddReminder(ev.id)} className="px-6 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"><Plus className="w-6 h-6" /></button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50 rounded-[4rem] p-12 md:p-20 mb-20 mx-4 border border-slate-100 shadow-inner">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-56 h-56 bg-slate-900 rounded-[3.5rem] flex items-center justify-center text-white text-7xl font-black shadow-2xl shrink-0 relative z-10 border border-white/5">
              {WALID_IDENTITY.fullName[0]}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 leading-none">{WALID_IDENTITY.fullName}</h2>
            <p className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.3em] mb-10">{WALID_IDENTITY.role} • {WALID_IDENTITY.companyName}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-5">
               <div className="px-8 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Secure Identity</span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Sovereign Encryption</span>
                  </div>
               </div>
               <div className="px-8 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">CRM Link Active</span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Real-time Data Sync</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExpoLanding;
