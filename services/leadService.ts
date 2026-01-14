
import { supabase } from '../lib/supabase';
import { Lead, LeadStatus, RelationshipTemperature, Reminder } from '../types';

let localLeads: Lead[] = [];

async function safeDbCall<T>(call: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await call();
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export const leadService = {
  async saveLead(lead: Lead): Promise<void> {
    const exists = localLeads.find(l => l.id === lead.id || (l.email === lead.email && l.email !== 'verified@nova.secure'));
    if (exists) return;

    const entry = { ...lead, discoveredAt: new Date().toISOString(), temperature: lead.temperature || 'Cold', reminders: lead.reminders || [] };
    localLeads.push(entry);

    await safeDbCall(
      () => supabase.from('leads').upsert([entry]),
      null
    );
  },

  async getAllLeads(): Promise<Lead[]> {
    return safeDbCall(
      () => supabase.from('leads').select('*').order('discoveredAt', { ascending: false }),
      [...localLeads].sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''))
    );
  },

  async getLeadById(id: string): Promise<Lead | null> {
    const local = localLeads.find(l => l.id === id);
    if (local) return local;

    return safeDbCall(
      () => supabase.from('leads').select('*').eq('id', id).single(),
      null
    );
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    const lead = localLeads.find(l => l.id === id);
    if (lead) lead.status = status;

    await safeDbCall(
      () => supabase.from('leads').update({ status }).eq('id', id),
      null
    );
  },

  async updateLeadTemperature(id: string, temperature: RelationshipTemperature): Promise<void> {
    const lead = localLeads.find(l => l.id === id);
    if (lead) lead.temperature = temperature;

    await safeDbCall(
      () => supabase.from('leads').update({ temperature }).eq('id', id),
      null
    );
  },

  async updateLeadNotes(id: string, notes: string): Promise<void> {
    const lead = localLeads.find(l => l.id === id);
    if (lead) lead.notes = notes;

    await safeDbCall(
      () => supabase.from('leads').update({ notes }).eq('id', id),
      null
    );
  },

  async updateLeadReminders(id: string, reminders: Reminder[]): Promise<void> {
    const lead = localLeads.find(l => l.id === id);
    if (lead) lead.reminders = reminders;

    await safeDbCall(
      () => supabase.from('leads').update({ reminders }).eq('id', id),
      null
    );
  },

  async bulkUpdateLeadStatus(ids: string[], status: LeadStatus): Promise<void> {
    localLeads = localLeads.map(l => ids.includes(l.id) ? { ...l, status } : l);

    await safeDbCall(
      () => supabase.from('leads').update({ status }).in('id', ids),
      null
    );
  },

  async getDiscoveryInbox(): Promise<Lead[]> {
    const leads = await this.getAllLeads();
    return leads.filter(l => l.status === 'DISCOVERED');
  }
};
