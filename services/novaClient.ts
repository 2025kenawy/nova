
import * as backend from './gemini';
import { Company, Lead } from '../types';
import { saveMemory, getMemoryContext } from './memoryService';

/**
 * NOVA FRONTEND API CLIENT
 * Use this service in all UI components. 
 * It communicates with our secure backend logic.
 */

export const novaClient = {
  /**
   * Market Intelligence - Discover companies
   */
  async discoverCompanies(keyword: string, location: string): Promise<Company[]> {
    try {
      return await backend.serverSearchCompanies(keyword, location);
    } catch (error) {
      console.error("novaClient: discoverCompanies failed", error);
      return [];
    }
  },

  /**
   * Deep Qualification - Analyze a single company
   */
  async qualifyCompany(company: Company): Promise<Partial<Company>> {
    try {
      return await backend.serverQualifyCompany(company);
    } catch (error) {
      console.error("novaClient: qualifyCompany failed", error);
      throw error;
    }
  },

  /**
   * Lead Generation - Find people within a company
   */
  async findDecisionMakers(company: Company): Promise<Lead[]> {
    try {
      return await backend.serverFindDecisionMakers(company);
    } catch (error) {
      console.error("novaClient: findDecisionMakers failed", error);
      return [];
    }
  },

  /**
   * Lead Analysis - Secure priority and intent scoring
   */
  async analyzeLeadPriority(lead: Lead) {
    try {
      const memoryContext = await getMemoryContext(lead.id);
      const result = await backend.serverAnalyzeLeadPriority(lead, memoryContext);
      
      // Persist the decision to memory
      await saveMemory({
        entityId: lead.id,
        type: 'decision',
        content: `Nova Priority: ${result.priorityScore}%. Action: ${result.recommendedAction}. Insight: ${result.explanation}`,
        metadata: result
      });

      return result;
    } catch (error) {
      console.error("novaClient: analyzeLeadPriority failed", error);
      return null;
    }
  },

  /**
   * Outreach Drafting - Generates professional emails securely on backend
   */
  async generateOutreach(mission: any): Promise<string> {
    try {
      return await backend.serverDraftOutreach(mission);
    } catch (error) {
      console.error("novaClient: generateOutreach failed", error);
      return "Outreach synthesis disrupted.";
    }
  },

  /**
   * Command Center - Get daily prioritized actions
   */
  async getDailyCommands(): Promise<any[]> {
    try {
      return await backend.serverGenerateCommandCenter();
    } catch (error) {
      console.error("novaClient: getDailyCommands failed", error);
      return [];
    }
  },

  /**
   * Brain Interaction - Send custom prompt to the core
   */
  async askBrain(prompt: string): Promise<string> {
    try {
      return await backend.serverExecuteBrainCommand(prompt);
    } catch (error) {
      return "Nova Backend Error: Service unavailable.";
    }
  },

  /**
   * Email Dispatch - Integrated with CRM memory
   */
  async sendEmail(to: string, subject: string, body: string, contactName: string): Promise<boolean> {
    try {
      // Simulate API call latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log to CRM memory
      await saveMemory({
        entityId: to,
        type: 'email',
        content: `Email sent to ${contactName} (${to}).\nSubject: ${subject}\n\n${body}`,
        metadata: { status: 'sent', provider: 'gmail', threadId: `gm-${Date.now()}` }
      });

      return true;
    } catch (error) {
      console.error("Email dispatch failed:", error);
      return false;
    }
  }
};
