
import * as ai from './aiService';
import { sendResendEmail } from './resend';
import { calculateLeadPriority, sortMissionsByPriority, MAX_VISIBLE_RESULTS } from './decisionEngine';
import { Company, Lead, Mission, LeadScoring, DealStage } from '../types';
import { saveMemory, getMemoryContext, getAllMemories } from './memoryService';
import { getIdentityContext } from './identityService';

/**
 * NOVA ARCHITECTURAL ORCHESTRATOR
 * Sole bridge between UI and all backend services.
 * Implements strict data validation and logic separation.
 */

export const novaOrchestrator = {
  // --- Market Scan & Entity Discovery ---
  
  async discoverCompanies(keyword: string, location: string): Promise<Company[]> {
    console.log(`Nova Orchestrator: Initiating market discovery for ${keyword} in ${location}...`);
    try {
      const results = await ai.serverSearchCompanies(keyword, location, getIdentityContext());
      console.log(`Nova Orchestrator: Found ${results.length} entities.`);
      // Validate and sanitize data before returning to UI
      return results.map(c => ({
        ...c,
        relevanceScore: Math.min(100, Math.max(0, c.relevanceScore || 0)),
        industry: 'Equine',
        size: c.size || 'N/A'
      }));
    } catch (error) {
      console.error("Orchestrator: Market scan failed", error);
      return [];
    }
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
      return results.map(l => ({
        ...l,
        status: 'New' as Lead['status'],
        dealStage: 'Discovery' as DealStage
      }));
    } catch (error) {
      console.error("Orchestrator: DM search failed", error);
      return [];
    }
  },

  // --- Intelligence & Strategic Decisions ---

  async analyzeLeadPriority(lead: Lead): Promise<{ 
    status: Lead['status'], 
    dealStage: Lead['dealStage'], 
    scoring: LeadScoring 
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
        content: `Lead prioritized at ${scoring.overall}%. Logic: ${aiResult.explanation}`,
        metadata: { ...aiResult, finalScore: scoring.overall }
      });

      return { 
        status: 'Enriched', 
        dealStage: (aiResult.dealStage || 'Discovery') as DealStage, 
        scoring 
      };
    } catch (error) {
      console.error("Orchestrator: Priority analysis failed", error);
      return null;
    }
  },

  async runFullIntelligencePipeline(): Promise<Mission[]> {
    console.log("Nova Orchestrator: Executing FULL intelligence pipeline (MAX_RESULTS: " + MAX_VISIBLE_RESULTS + ")...");
    // 1. Force Discovery across broad GCC keywords
    const searchTerms = ["Elite Stables", "Royal Horse Clubs", "Breeding Centers", "Equine Logistics"];
    const locations = ["UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain"];
    
    // Efficiently discover across primary target
    const companies = await this.discoverCompanies(searchTerms[0], locations.join(", "));
    
    if (companies.length > 0) {
      // Process top batch to seed intelligence
      const topBatch = companies.slice(0, 3);
      for (const comp of topBatch) {
        await this.qualifyCompany(comp);
        const leads = await this.findDecisionMakers(comp);
        if (leads.length > 0) {
          await this.analyzeLeadPriority(leads[0]);
        }
      }
    }
    
    // 5. Generate Missions based on new state
    return await this.getDailyCommands();
  },

  async getDailyCommands(): Promise<Mission[]> {
    console.log(`Nova Orchestrator: Synthesizing mission control (Limit: ${MAX_VISIBLE_RESULTS})...`);
    try {
      // Check memory for any recent leads to provide context to Groq
      const recentMemories = await getAllMemories();
      const contextString = recentMemories
        .slice(0, 10)
        .map(m => `${m.type}: ${m.content}`)
        .join("; ");

      let missions = await ai.serverGenerateDailyMissions(contextString, MAX_VISIBLE_RESULTS);
      
      // Step 2: Auto-Discovery if missions are empty or cold
      if (missions.length === 0) {
        console.warn("Nova Orchestrator: Intelligence gap detected. Running emergency discovery.");
        return await this.runFullIntelligencePipeline();
      }

      // Validating mission data
      const validated = missions.map(m => ({
        contactName: m.contactName || "Market Opportunity",
        role: m.role || "Prospect",
        company: m.company || "Pending Search",
        priority: (m.priority === 'High' || m.priority === 'Medium') ? m.priority : 'Medium',
        explanation: m.explanation || "System recommends market re-scan to identify high-intent targets.",
        confidence: m.confidence || 50,
        recommendedAction: m.recommendedAction || "wait"
      }));
      
      return sortMissionsByPriority(validated);
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

  // --- Final Delivery ---

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
          content: `Professional dispatch to ${contactName}: ${subject}`,
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
