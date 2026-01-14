
import * as ai from './aiService';
import { sendResendEmail } from './resend';
import { calculateLeadPriority, sortMissionsByPriority, MAX_VISIBLE_RESULTS } from './decisionEngine';
import { Company, Lead, Mission, LeadScoring, DealStage } from '../types';
import { saveMemory, getMemoryContext, getAllMemories } from './memoryService';
import { getIdentityContext } from './identityService';
import { leadService } from './leadService';

/**
 * NOVA ARCHITECTURAL ORCHESTRATOR
 * Sole bridge between UI and all backend services.
 * Now automated for Arab market discovery and relationship building.
 */

export const novaOrchestrator = {
  // --- Market Scan & Entity Discovery ---
  
  async runMarketScan(keyword: string, location: string): Promise<Company[]> {
    console.log(`[NovaOrchestrator] Initiating Arab-Market Scan: ${keyword} in ${location}`);
    try {
      const results = await ai.serverSearchCompanies(keyword, location, getIdentityContext());
      console.log(`[NovaOrchestrator] Scan Complete. Found ${results.length} entities.`);
      return results.map(c => ({
        ...c,
        relevanceScore: Math.min(100, Math.max(0, c.relevanceScore || 0)),
        industry: 'Equine',
        size: c.size || 'N/A'
      }));
    } catch (error) {
      console.error("[NovaOrchestrator] Market scan critical failure:", error);
      return [];
    }
  },

  async discoverCompanies(keyword: string, location: string): Promise<Company[]> {
    return this.runMarketScan(keyword, location);
  },

  async qualifyCompany(company: Company): Promise<Partial<Company>> {
    try {
      const intel = await ai.serverQualifyCompany(company);
      return {
        ...intel,
        companyScore: Math.min(100, Math.max(0, intel.companyScore || 0)),
        qualificationStatus: 'qualified'
      };
    } catch (error) {
      console.error("Orchestrator: Qualification failed", error);
      return { qualificationStatus: 'unqualified' };
    }
  },

  async findDecisionMakers(company: Company): Promise<Lead[]> {
    try {
      const results = await ai.serverFindDecisionMakers(company);
      const leads = results.map(l => ({
        ...l,
        status: 'DISCOVERED' as Lead['status'],
        dealStage: 'Discovery' as DealStage,
        companyDomain: company.domain
      }));

      // AUTO-SAVE TO PERSISTENT INBOX
      for (const lead of leads) {
        await leadService.saveLead(lead);
      }

      return leads;
    } catch (error) {
      console.error("Orchestrator: DM search failed", error);
      return [];
    }
  },

  // --- Intelligence & Strategic Decisions ---

  async analyzeLeadPriority(lead: Lead): Promise<{ 
    status: Lead['status'], 
    dealStage: Lead['dealStage'], 
    scoring: LeadScoring,
    social?: { twitter?: string, facebook?: string, instagram?: string }
  } | null> {
    try {
      const context = await getMemoryContext(lead.id);
      const aiResult = await ai.serverAnalyzePriority(lead, context);
      
      const rawScoring = {
        authority: aiResult.horseAuthorityScore || 0,
        intent: aiResult.horseIntentScore || 0,
        engagement: aiResult.horseEngagementScore || 0
      };

      const scoring: LeadScoring = {
        authority: Math.min(100, Math.max(0, rawScoring.authority)),
        intent: Math.min(100, Math.max(0, rawScoring.intent)),
        engagement: Math.min(100, Math.max(0, rawScoring.engagement)),
        overall: calculateLeadPriority(rawScoring)
      };

      await saveMemory({
        entityId: lead.id,
        type: 'decision',
        content: `Lead prioritized at ${scoring.overall}% in Arab market logic. ${aiResult.explanation}`,
        metadata: { ...aiResult, finalScore: scoring.overall }
      });

      // Update status to Enriched in persistence
      await leadService.updateLeadStatus(lead.id, 'Enriched');

      return { 
        status: 'Enriched', 
        dealStage: (aiResult.dealStage || 'Discovery') as DealStage, 
        scoring,
        social: {
          twitter: aiResult.twitter,
          facebook: aiResult.facebook,
          instagram: aiResult.instagram
        }
      };
    } catch (error) {
      console.error("Orchestrator: Priority analysis failed", error);
      return null;
    }
  },

  /**
   * AUTOMATED INTELLIGENCE PIPELINE
   * Strictly Arab Markets | Horse Product Stakeholders | Auto-Discovery
   */
  async runFullIntelligencePipeline(): Promise<Mission[]> {
    const searchTerms = [
      "Equine Product Buyers", 
      "Horse Feed Importers", 
      "Elite Stables", 
      "Equestrian Retailers", 
      "Royal Horse Clubs",
      "Stable Equipment Distributors"
    ];
    const locations = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "Jordan", "Egypt"];
    
    // Select dynamic targets for breadth
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const companies = await this.discoverCompanies(term, location);
    
    if (companies.length > 0) {
      // Process top potential stakeholders automatically
      const topBatch = companies.slice(0, 5);
      for (const comp of topBatch) {
        const intel = await this.qualifyCompany(comp);
        const leads = await this.findDecisionMakers({ ...comp, ...intel });
        
        // AUTO-PROMOTION: Move elite discoveries (>85 relevance) directly to CRM for relationship building
        if (comp.relevanceScore > 85 || (intel.companyScore && intel.companyScore > 85)) {
           for (const lead of leads) {
             await leadService.updateLeadStatus(lead.id, 'SAVED');
             await saveMemory({
               entityId: lead.id,
               type: 'decision',
               content: 'Lead auto-promoted to CRM due to high Arab-market relevance and product intent.'
             });
           }
        }
      }
    }
    
    return await this.getDailyCommands();
  },

  async getDailyCommands(): Promise<Mission[]> {
    try {
      const discoveredLeads = await leadService.getDiscoveryInbox();
      
      if (discoveredLeads.length > 0) {
        const leadContext = discoveredLeads.slice(0, 15).map(l => `${l.firstName} ${l.lastName} (${l.title}) at ${l.companyName}`).join("; ");
        return await ai.serverGenerateDailyMissions(`LEAD INBOX PENDING (Arab Market): ${leadContext}`, MAX_VISIBLE_RESULTS);
      }

      const recentMemories = await getAllMemories();
      const contextString = recentMemories.slice(0, 10).map(m => `${m.type}: ${m.content}`).join("; ");

      let missions = await ai.serverGenerateDailyMissions(contextString, MAX_VISIBLE_RESULTS);
      
      if (missions.length === 0) {
        return await this.runFullIntelligencePipeline();
      }

      return sortMissionsByPriority(missions);
    } catch (error) {
      console.error("Orchestrator: Command generation failed", error);
      return [];
    }
  },

  async generateOutreach(mission: Mission): Promise<string> {
    try {
      return await ai.serverGenerateOutreach(mission, getIdentityContext());
    } catch (error) {
      console.error("Orchestrator: Outreach failed", error);
      return "Strategic failure in outreach generation.";
    }
  },

  async askBrain(prompt: string): Promise<string> {
    try {
      return await ai.serverAskStrategicBrain(prompt, getIdentityContext());
    } catch (error) {
      console.error("Orchestrator: Brain connection failed", error);
      return "Strategic brain currently offline.";
    }
  },

  /**
   * OUTREACH IS MANUAL ONLY
   * NO AUTOMATED MESSAGING
   */
  async sendEmail(to: string, rawResponse: string, contactName: string): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error("Orchestrator: Dispatch failed", error);
      return false;
    }
  }
};
