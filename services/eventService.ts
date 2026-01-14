
import { supabase } from '../lib/supabase';
import { EquineEvent, Reminder } from '../types';

let localEvents: EquineEvent[] = [];

async function safeDbCall<T>(call: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await call();
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export const eventService = {
  async saveEvent(event: EquineEvent): Promise<void> {
    const exists = localEvents.find(e => e.id === event.id || e.website === event.website);
    if (exists) return;

    localEvents.push(event);

    await safeDbCall(
      () => supabase.from('events_collection').upsert([event]),
      null
    );
  },

  async bulkSaveEvents(events: EquineEvent[]): Promise<void> {
    localEvents = [...events];
    await safeDbCall(
      () => supabase.from('events_collection').delete().neq('id', 'null'),
      null
    );
    await safeDbCall(
      () => supabase.from('events_collection').insert(events),
      null
    );
  },

  async getAllEvents(): Promise<EquineEvent[]> {
    const dbEvents = await safeDbCall(
      () => supabase.from('events_collection').select('*').order('year', { ascending: true }).order('month', { ascending: true }),
      [...localEvents]
    );

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return dbEvents.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  },

  async updateEventReminders(id: string, reminders: Reminder[]): Promise<void> {
    const event = localEvents.find(e => e.id === id);
    if (event) event.reminders = reminders;

    await safeDbCall(
      () => supabase.from('events_collection').update({ reminders }).eq('id', id),
      null
    );
  }
};
