
import * as ai from './aiService';
import { sendResendEmail } from './resend';
import { calculateLeadPriority, sortMissionsByPriority, MAX_VISIBLE_RESULTS } from './decisionEngine';
import { Company, Lead, Mission, LeadScoring, DealStage, EquineEvent } from '../types';
import { saveMemory, getMemoryContext, getAllMemories } from './memoryService';
import { getIdentityContext } from './identityService';
import { leadService } from './leadService';
import { eventService } from './eventService';

/**
 * NOVA BIG BRAIN ORCHESTRATOR
 * Architecture: Background-First, UI-Second.
 * 
 * The Big Brain operates as an autonomous agent that populates the Sovereign Database.
 * The UI's primary role is to present and act upon this precomputed intelligence.
 */

export const novaOrchestrator = {
  _isRefreshing: false,

  isRefreshing(): boolean {
    return this._isRefreshing;
  },

  /**
   * BIG BRAIN AUTONOMOUS PIPELINE
   * This is the "Wake Up" process. It runs a full-spectrum intelligence gather.
   * It handles discovery, qualification, and mission synthesis in the background.
   */
  async recalibrateIntelligence(): Promise<void> {
    if (this._isRefreshing) return;
    this._isRefreshing = true;
    
    console.log("[Nova Big Brain] Waking up... Initializing autonomous market infiltration.");

    // Fire-and-forget background execution to ensure UI remains instant
    (async () => {
      try {
        const identity = getIdentityContext();
        
        await saveMemory({
          entityId: "BIG_BRAIN_SYSTEM",
          type: "status",
          content: "Recalibration sequence initiated: Scanning GCC Equine markets."
        });

        // 1. Target high-value Arab Equine Hubs for deep discovery
        const targets = [
          { keyword: "Elite Horse Breeding Farms", location: "Riyadh, KSA" },
          { keyword: "Equestrian Tack & Supply Importers", location: "Dubai, UAE" },
          { keyword: "Equine Veterinary Hospitals", location: "Doha, Qatar" },
          { keyword: "Professional Polo & Racing Clubs", location: "Abu Dhabi, UAE" },
          { keyword: "Arabian Horse Championship Organizers", location: "Sharjah, UAE" }
        ];

        for (const target of targets) {
          const companies = await ai.serverSearchCompanies(target.keyword, target.location, identity);
          
          for (const comp of companies.slice(0, 4)) {
            const qualification = await ai.serverQualifyCompany(comp);
            const enrichedComp = { ...comp, ...qualification, qualificationStatus: 'qualified' as const };
            
            const leads = await ai.serverFindDecisionMakers(enrichedComp);
            for (const lead of leads) {
              const priorityData = await ai.serverAnalyzePriority(lead, "Autonomous market scan context.");
              
              const finalLead: Lead = {
                ...lead,
                status: 'DISCOVERED',
                scoring: {
                  authority: priorityData.horseAuthorityScore,
                  intent: priorityData.horseIntentScore,
                  engagement: priorityData.horseEngagementScore,
                  overall: calculateLeadPriority({
                    authority: priorityData.horseAuthorityScore,
                    intent: priorityData.horseIntentScore,
                    engagement: priorityData.horseEngagementScore
                  })
                },
                source: `Sovereign Scan: ${target.location}`
              };
              
              await leadService.saveLead(finalLead);
            }
          }
        }

        // 2. Discover Upcoming 2026 Arab Equine Events (Targeting 'events_collection')
        const upcomingCountries = ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman"];
        const months = ["January", "February", "March", "April"];
        
        const targetMonth = months[Math.floor(Math.random() * months.length)];
        const targetCountry = upcomingCountries[Math.floor(Math.random() * upcomingCountries.length)];
        
        const events = await ai.serverDiscoverEvents(targetMonth, targetCountry);
        for (const ev of events) {
          await eventService.saveEvent(ev);
        }

        // 3. Synthesize 33 Daily Strategic Missions
        await this.precomputeDailyMissions();

        await saveMemory({
          entityId: "BIG_BRAIN_SYSTEM",
          type: "status",
          content: "Recalibration sequence successful."
        });

        console.log("[Nova Big Brain] Pipeline complete.");
      } catch (error) {
        console.error("[Nova Big Brain] Critical failure:", error);
      } finally {
        this._isRefreshing = false;
      }
    })();
  },

  async precomputeDailyMissions(): Promise<void> {
    const allLeads = await leadService.getAllLeads();
    const activeInbox = allLeads.filter(l => l.status === 'DISCOVERED' || l.status === 'Enriched');
    
    const context = activeInbox.slice(0, 25).map(l => 
      `${l.firstName} ${l.lastName} (${l.title}) at ${l.companyName}`
    ).join("; ");
    
    const missions = await ai.serverGenerateDailyMissions(
      `TARGETING: Arab Horse Market. CONTEXT: ${context}`, 
      33
    );
    
    const today = new Date().toISOString().split('T')[0];
    await saveMemory({
      entityId: "SYSTEM_MISSIONS",
      type: "command",
      content: JSON.stringify(missions),
      metadata: { date: today }
    });
  },

  async getDailyCommands(): Promise<Mission[]> {
    const memories = await getAllMemories();
    const today = new Date().toISOString().split('T')[0];
    const missionEntry = memories.find(m => m.entityId === "SYSTEM_MISSIONS" && m.metadata?.date === today);
    
    if (missionEntry) {
      try {
        return JSON.parse(missionEntry.content);
      } catch {
        return [];
      }
    }
    return [];
  },

  async generateOutreach(mission: Mission): Promise<string> {
    return await ai.serverGenerateOutreach(mission, getIdentityContext());
  },

  async askBrain(prompt: string): Promise<string> {
    return await ai.serverAskStrategicBrain(prompt, getIdentityContext());
  },

  async sendEmail(to: string, rawResponse: string, contactName: string): Promise<boolean> {
    const lines = rawResponse.split('\n');
    const subjectLine = lines.find(l => l.toLowerCase().includes('subject:')) || 'Subject: Horse Industry Strategic Outreach';
    const bodyText = rawResponse.replace(subjectLine, '').trim();
    const subject = subjectLine.replace(/subject:/i, '').trim();
    const htmlBody = bodyText.replace(/\n/g, '<br/>');
    
    const success = await sendResendEmail(to, subject, htmlBody);
    if (success) {
      await saveMemory({
        entityId: to,
        type: 'outreach',
        content: `Manual dispatch to ${contactName}: ${subject}`,
        metadata: { status: 'sent', recipient: contactName, subject }
      });
    }
    return success;
  }
};
