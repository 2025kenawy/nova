
import { supabase } from '../lib/supabase';
import { Lead, LeadStatus, RelationshipTemperature, Reminder, Mission, DealStage } from '../types';

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
    const dbLeads = await safeDbCall(
      () => supabase.from('leads').select('*').order('discoveredAt', { ascending: false }),
      [...localDiscoveryLeads]
    );

    // Merge with CRM contacts to know which discovery leads are already saved
    const crmContacts = await this.getCrmContacts();
    return dbLeads.map(lead => {
      const isSaved = crmContacts.some(c => 
        (c.linkedin && c.linkedin === lead.linkedin && c.linkedin !== '') || 
        (c.firstName === lead.firstName && c.lastName === lead.lastName && c.companyName === lead.companyName)
      );
      return { ...lead, isSaved };
    }).sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''));
  },

  // --- CRM Contacts (Saved CRM) ---
  async promoteToCrm(lead: Lead): Promise<boolean> {
    const crmContacts = await this.getCrmContacts();
    
    // Duplicate Protection: match by LinkedIn or company + name
    const isDuplicate = crmContacts.some(c => 
      (c.linkedin && c.linkedin === lead.linkedin && c.linkedin !== '') || 
      (c.firstName === lead.firstName && c.lastName === lead.lastName && c.companyName === lead.companyName)
    );

    if (isDuplicate) {
      console.log(`Lead ${lead.firstName} ${lead.lastName} already exists in CRM. Skipping.`);
      return false;
    }

    const entry: Lead = { 
      ...lead, 
      status: 'SAVED' as LeadStatus, 
      temperature: lead.temperature || 'Cold',
      isSaved: true,
      source: lead.source || 'Nova Discovery',
      relationship_stage: lead.relationship_stage || 'Saved',
      saved_at: new Date().toISOString()
    };
    
    localCrmContacts.push(entry);
    await safeDbCall(() => supabase.from('crm_contacts').upsert([entry]), null);
    await this.updateLeadStatus(lead.id, 'SAVED');
    return true;
  },

  /**
   * Promote a Mission opportunity to CRM with specific metadata.
   */
  async promoteMissionToCrm(mission: Mission, withReminder: boolean = false): Promise<boolean> {
    const crmContacts = await this.getCrmContacts();
    const nameParts = mission.contactName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '(Mission)';

    // Duplicate Check
    const existingIndex = crmContacts.findIndex(c => 
      c.firstName === firstName && c.lastName === lastName && c.companyName === mission.company
    );

    const missionNote = `[MISSION CONTROL] ${new Date().toLocaleDateString()} - Strategic Intent: ${mission.explanation} (Confidence: ${mission.confidence}%)`;
    
    if (existingIndex !== -1) {
      const existing = crmContacts[existingIndex];
      // Append activity/note, don't downgrade data
      const updatedNotes = `${existing.notes || ''}\n\n${missionNote}`.trim();
      const updatedTemperature: RelationshipTemperature = (existing.temperature === 'Hot') ? 'Hot' : 'Warm';
      
      const updated: Lead = {
        ...existing,
        notes: updatedNotes,
        temperature: updatedTemperature,
        dealStage: 'Strategic' as DealStage,
        strategic_intent: mission.explanation,
        nova_confidence: mission.confidence
      };

      if (withReminder) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const reminder: Reminder = {
          id: `rem-mission-${Date.now()}`,
          date: nextWeek.toISOString().split('T')[0],
          type: 'Follow-up',
          note: `Auto-reminder from Mission Control: ${mission.recommendedAction}`,
          isCompleted: false
        };
        updated.reminders = [...(updated.reminders || []), reminder];
      }

      localCrmContacts[existingIndex] = updated;
      await safeDbCall(() => supabase.from('crm_contacts').update(updated).eq('id', existing.id), null);
      return true;
    }

    // New Entry
    const entry: Lead = {
      id: `lead-mission-${Date.now()}`,
      firstName,
      lastName,
      title: mission.role,
      companyId: `comp-mission-${Date.now()}`,
      companyName: mission.company,
      email: 'verified@nova.secure',
      linkedin: '',
      status: 'SAVED',
      dealStage: 'Strategic',
      temperature: 'Warm',
      isSaved: true,
      source: 'Mission Control',
      relationship_stage: 'Strategic',
      saved_at: new Date().toISOString(),
      notes: missionNote,
      strategic_intent: mission.explanation,
      nova_confidence: mission.confidence,
      roleType: 'Decision Maker'
    };

    if (withReminder) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      entry.reminders = [{
        id: `rem-mission-${Date.now()}`,
        date: nextWeek.toISOString().split('T')[0],
        type: 'Follow-up',
        note: `Auto-reminder from Mission Control: ${mission.recommendedAction}`,
        isCompleted: false
      }];
    }

    localCrmContacts.push(entry);
    await safeDbCall(() => supabase.from('crm_contacts').upsert([entry]), null);
    return true;
  },

  async getCrmContacts(): Promise<Lead[]> {
    return safeDbCall(
      () => supabase.from('crm_contacts').select('*').order('discoveredAt', { ascending: false }),
      [...localCrmContacts].sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''))
    );
  },

  async getLeadById(id: string): Promise<Lead | null> {
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

  async updateLeadWhatsApp(id: string, whatsapp: string, permission: boolean): Promise<void> {
    const lead = localCrmContacts.find(l => l.id === id);
    if (lead) {
      lead.whatsapp = whatsapp;
      lead.whatsappPermission = permission;
    }

    await safeDbCall(
      () => supabase.from('crm_contacts').update({ whatsapp, whatsappPermission: permission }).eq('id', id),
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

  async bulkUpdateLeadStatus(ids: string[], status: LeadStatus): Promise<number> {
    let savedCount = 0;
    if (status === 'SAVED') {
      const allLeads = await this.getAllLeads();
      const selected = allLeads.filter(l => ids.includes(l.id));
      for (const lead of selected) {
        const success = await this.promoteToCrm(lead);
        if (success) savedCount++;
      }
    } else {
      localDiscoveryLeads = localDiscoveryLeads.map(l => ids.includes(l.id) ? { ...l, status } : l);
      await safeDbCall(() => supabase.from('leads').update({ status }).in('id', ids), null);
    }
    return savedCount;
  },

  async getDiscoveryInbox(): Promise<Lead[]> {
    const leads = await this.getAllLeads();
    return leads.filter(l => l.status === 'DISCOVERED' || l.status === 'Enriched');
  }
};
