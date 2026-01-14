
import * as ai from './aiService';
import { evaluateRelationshipSafety } from './decisionEngine';
import { Mission } from '../types';
import { saveMemory, getMemoryContext, getAllMemories, getMemoriesForEntity } from './memoryService';
import { getIdentityContext } from './identityService';
import { leadService } from './leadService';

export const novaOrchestrator = {
  _isRefreshing: false,

  isRefreshing(): boolean { return this._isRefreshing; },

  async recalibrateIntelligence(): Promise<void> {
    if (this._isRefreshing) return;
    this._isRefreshing = true;
    
    (async () => {
      try {
        const identity = getIdentityContext();
        await saveMemory({ entityId: "SYSTEM", type: "status", category: "SYSTEM", content: "Recalibration initiated." });

        // Mission Synthesis with Context
        await this.precomputeDailyMissions();

        await saveMemory({ entityId: "SYSTEM", type: "status", category: "SYSTEM", content: "Recalibration complete." });
      } finally {
        this._isRefreshing = false;
      }
    })();
  },

  async precomputeDailyMissions(): Promise<void> {
    const allLeads = await leadService.getAllLeads();
    const activeLeads = allLeads.slice(0, 20);
    
    let missionPrompts = [];
    for (const lead of activeLeads) {
      const context = await getMemoryContext(lead.id);
      const memories = await getMemoriesForEntity(lead.id);
      const safety = evaluateRelationshipSafety(memories);
      
      if (!safety.safe) {
        missionPrompts.push(`ID: ${lead.id} [LOCKED: ${safety.reason}]`);
      } else {
        missionPrompts.push(`ID: ${lead.id} [OPEN: ${lead.firstName} at ${lead.companyName}] Context: ${context}`);
      }
    }
    
    const missions = await ai.serverGenerateDailyMissions(missionPrompts.join('\n'), 33);
    const today = new Date().toISOString().split('T')[0];
    
    await saveMemory({
      entityId: "SYSTEM_MISSIONS",
      type: "command",
      category: "SYSTEM",
      content: JSON.stringify(missions),
      metadata: { date: today }
    });
  },

  async getDailyCommands(): Promise<Mission[]> {
    const memories = await getAllMemories();
    const today = new Date().toISOString().split('T')[0];
    const entry = memories.find(m => m.entityId === "SYSTEM_MISSIONS" && m.metadata?.date === today);
    return entry ? JSON.parse(entry.content) : [];
  },

  async askBrain(prompt: string): Promise<string> {
    return await ai.serverAskStrategicBrain(prompt, getIdentityContext());
  },

  async generateOutreach(mission: Mission): Promise<string> {
    return await ai.serverGenerateOutreach(mission, getIdentityContext());
  },

  async sendEmail(to: string, rawResponse: string, contactName: string): Promise<boolean> {
    // Truncated for brevity...
    return true;
  }
};
