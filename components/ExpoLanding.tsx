
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
  UserPlus
} from 'lucide-react';
import { WALID_IDENTITY } from '../services/identityService';
import { EquineEvent, Reminder, Lead, DealStage } from '../types';
import { eventService } from '../services/eventService';
import { leadService } from '../services/leadService';
import { novaOrchestrator } from '../services/novaOrchestrator';
import { saveMemory } from '../services/memoryService';

const ExpoLanding: React.FC = () => {
  const [events, setEvents] = useState<EquineEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeReminderEventId, setActiveReminderEventId] = useState<string | null>(null);
  const [savingOrganizerId, setSavingOrganizerId] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'Event Check-in',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const categories = [
    { name: 'Core Operations', desc: 'Stables, Farms & Breeding Facilities', icon: Target },
    { name: 'Health & Performance', desc: 'Vets, Nutrition & Performance Analysis', icon: ShieldCheck },
    { name: 'Supply & Trade', desc: 'Equipment, Tack & Premium Supplies', icon: Zap },
    { name: 'Services', desc: 'Logistics, Construction & Care Systems', icon: Building2 },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await eventService.getAllEvents();
    setEvents(data);
  };

  const handleDiscovery = () => {
    setIsRefreshing(true);
    novaOrchestrator.recalibrateIntelligence().then(() => {
      loadEvents();
      setIsRefreshing(false);
    });
  };

  const handleSaveOrganizer = async (event: EquineEvent) => {
    setSavingOrganizerId(event.id);
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
      horseCategory: 'Competition',
      horseSubCategory: 'Racing Event',
      discoveredAt: new Date().toISOString(),
      temperature: 'Cold',
      source: `Expo Hub: ${event.name} (${event.year})`,
      reminders: []
    };

    try {
      await leadService.saveLead(newLead);
      await saveMemory({
        entityId: newLead.id,
        type: 'action',
        content: `Saved organizer from Expo Hub. Event: ${event.name}.`
      });
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error("Failed to save organizer", e);
    }
    setSavingOrganizerId(null);
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
      content: `Set a ${reminder.type} reminder for event: ${event.name} on ${reminder.date}.`
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
    <div className="min-h-full bg-white flex flex-col animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-slate-950 text-white overflow-hidden rounded-[3rem] mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Award className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Nova Intelligence</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6 leading-[0.9]">
            Arab Market <br/>
            <span className="text-indigo-500">Equine Dominance</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mb-10">
            Strategic network building and intelligence-led growth for the GCC equestrian sector. We bridge high-value suppliers with elite Arab market stakeholders.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl w-fit">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Dubai International Horse Fair 2024</span>
            </div>
            <button 
              onClick={handleDiscovery}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-2xl w-fit shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                {isRefreshing ? 'Background Syncing...' : 'Refresh 2026 Events'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Discovered Events Hub */}
      {events.length > 0 && (
        <section className="px-4 py-12 mb-12">
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Pre-Saved Event Registry</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{events.length} Events Synced</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{ev.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ev.month} 2026 • {ev.dates}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 rounded border border-slate-200">
                      {ev.country}
                    </span>
                    <button 
                      onClick={() => handleSaveOrganizer(ev)}
                      disabled={savingOrganizerId === ev.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-100 hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {savingOrganizerId === ev.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <UserPlus className="w-2.5 h-2.5" />}
                      Sync CRM
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600 truncate">{ev.organizer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">{ev.city}</span>
                    </div>
                  </div>

                  <div className="border-l border-slate-100 pl-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Reminders</span>
                      </div>
                      <button 
                        onClick={() => setActiveReminderEventId(ev.id)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-32 overflow-y-auto pr-1">
                      {ev.reminders && ev.reminders.length > 0 ? (
                        ev.reminders.map(rem => (
                          <div key={rem.id} className="flex items-start gap-2 text-[9px]">
                            <button onClick={() => toggleReminderComplete(ev.id, rem.id)} className={`mt-0.5 w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${rem.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                              {rem.isCompleted && <CheckCircle2 className="w-2 h-2" />}
                            </button>
                            <div className="min-w-0">
                              <p className={`font-bold truncate ${rem.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{rem.note}</p>
                              <p className="text-[7px] text-slate-400 font-bold uppercase">{rem.date}</p>
                            </div>
                            <button onClick={() => deleteReminder(ev.id, rem.id)} className="ml-auto p-0.5 text-slate-300 hover:text-red-500">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[8px] font-medium text-slate-400 italic">No reminders.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-slate-50 mt-auto">
                  <a href={formatUrl(ev.website)} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Official Site
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile Section */}
      <section className="bg-slate-50 rounded-[3rem] p-10 md:p-16 mb-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shrink-0">
            {WALID_IDENTITY.fullName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{WALID_IDENTITY.fullName}</h2>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">{WALID_IDENTITY.role} • {WALID_IDENTITY.companyName}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExpoLanding;
