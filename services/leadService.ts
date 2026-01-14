
import { supabase } from '../lib/supabase';
import { Lead, LeadStatus, RelationshipTemperature, Reminder } from '../types';

let localDiscoveryLeads: Lead[] = [];
let localCrmContacts: Lead[] = [];

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
  // --- Discovery Leads (Nova Leads) ---
  async saveLead(lead: Lead): Promise<void> {
    const exists = localDiscoveryLeads.find(l => l.id === lead.id || (l.email === lead.email && l.email !== 'verified@nova.secure'));
    if (exists) return;

    const entry = { ...lead, discoveredAt: new Date().toISOString(), status: 'DISCOVERED' as LeadStatus };
    localDiscoveryLeads.push(entry);

    await safeDbCall(
      () => supabase.from('leads').upsert([entry]),
      null
    );
  },

  async getAllLeads(): Promise<Lead[]> {
    return safeDbCall(
      () => supabase.from('leads').select('*').order('discoveredAt', { ascending: false }),
      [...localDiscoveryLeads].sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''))
    );
  },

  // --- CRM Contacts (Saved CRM) ---
  async promoteToCrm(lead: Lead): Promise<void> {
    const entry = { 
      ...lead, 
      status: 'SAVED' as LeadStatus, 
      temperature: lead.temperature || 'Cold',
      isSaved: true 
    };
    
    // Add to local CRM
    if (!localCrmContacts.find(c => c.id === entry.id)) {
      localCrmContacts.push(entry);
    }

    // Persist to CRM table
    await safeDbCall(
      () => supabase.from('crm_contacts').upsert([entry]),
      null
    );

    // Update original lead status in discovery table
    await this.updateLeadStatus(lead.id, 'SAVED');
  },

  async getCrmContacts(): Promise<Lead[]> {
    return safeDbCall(
      () => supabase.from('crm_contacts').select('*').order('discoveredAt', { ascending: false }),
      [...localCrmContacts].sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''))
    );
  },

  async getLeadById(id: string): Promise<Lead | null> {
    // Check both stores
    const local = localDiscoveryLeads.find(l => l.id === id) || localCrmContacts.find(l => l.id === id);
    if (local) return local;

    const crmData = await safeDbCall(() => supabase.from('crm_contacts').select('*').eq('id', id).single(), null);
    if (crmData) return crmData;

    return safeDbCall(() => supabase.from('leads').select('*').eq('id', id).single(), null);
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    const lead = localDiscoveryLeads.find(l => l.id === id);
    if (lead) lead.status = status;

    await safeDbCall(
      () => supabase.from('leads').update({ status }).eq('id', id),
      null
    );
  },

  async updateLeadTemperature(id: string, temperature: RelationshipTemperature): Promise<void> {
    // Update in CRM only
    const lead = localCrmContacts.find(l => l.id === id);
    if (lead) lead.temperature = temperature;

    await safeDbCall(
      () => supabase.from('crm_contacts').update({ temperature }).eq('id', id),
      null
    );
  },

  async updateLeadNotes(id: string, notes: string): Promise<void> {
    const lead = localCrmContacts.find(l => l.id === id);
    if (lead) lead.notes = notes;

    await safeDbCall(
      () => supabase.from('crm_contacts').update({ notes }).eq('id', id),
      null
    );
  },

  async updateLeadReminders(id: string, reminders: Reminder[]): Promise<void> {
    const lead = localCrmContacts.find(l => l.id === id);
    if (lead) lead.reminders = reminders;

    await safeDbCall(
      () => supabase.from('crm_contacts').update({ reminders }).eq('id', id),
      null
    );
  },

  async bulkUpdateLeadStatus(ids: string[], status: LeadStatus): Promise<void> {
    if (status === 'SAVED') {
      const allLeads = await this.getAllLeads();
      const selected = allLeads.filter(l => ids.includes(l.id));
      for (const lead of selected) {
        await this.promoteToCrm(lead);
      }
    } else {
      localDiscoveryLeads = localDiscoveryLeads.map(l => ids.includes(l.id) ? { ...l, status } : l);
      await safeDbCall(() => supabase.from('leads').update({ status }).in('id', ids), null);
    }
  },

  async getDiscoveryInbox(): Promise<Lead[]> {
    const leads = await this.getAllLeads();
    return leads.filter(l => l.status === 'DISCOVERED' || l.status === 'Enriched');
  }
};
