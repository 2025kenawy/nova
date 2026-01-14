
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Company, Mission, DealStage, MemoryEntry } from "../types";

const DISCOVERY_MODEL = 'gemini-3-flash-preview';
const STRATEGIC_MODEL = 'gemini-3-pro-preview';

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    const isQuotaError = errorMsg.includes('429') || error?.status === 429;
    if (isQuotaError && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const serverSearchCompanies = async (keyword: string, location: string, identityContext: string): Promise<Company[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        domain: { type: Type.STRING },
        location: { type: Type.STRING },
        horseCategory: { type: Type.STRING },
        horseSubCategory: { type: Type.STRING },
        buyerRole: { type: Type.STRING },
        size: { type: Type.STRING },
        relevanceScore: { type: Type.NUMBER },
        revenue: { type: Type.STRING }
      },
      required: ["name", "domain", "location", "horseCategory", "horseSubCategory", "buyerRole", "relevanceScore", "revenue"]
    }
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: DISCOVERY_MODEL,
      contents: `Search for equine buyers for: "${keyword}" in "${location}". Focus on high-tier Arab entities.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Intelligence. Identify high-value relationship targets in the Arab Horse market. Owner Identity:\n${identityContext}`
      }
    });
    
    const results = JSON.parse(response.text || "[]");
    return results.map((c: any, i: number) => ({ ...c, id: `comp-${Date.now()}-${i}`, industry: 'Equine' }));
  });
};

export const serverAnalyzePriority = async (leadData: Lead, memoryContext: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema = {
    type: Type.OBJECT,
    properties: {
      horseAuthorityScore: { type: Type.NUMBER },
      horseIntentScore: { type: Type.NUMBER },
      horseEngagementScore: { type: Type.NUMBER },
      explanation: { type: Type.STRING },
      reasoningSource: { type: Type.STRING }
    },
    required: ["horseAuthorityScore", "horseIntentScore", "horseEngagementScore", "explanation", "reasoningSource"]
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: STRATEGIC_MODEL,
      contents: `Lead: ${leadData.firstName} at ${leadData.companyName}. Context:\n${memoryContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are Nova Senior Advisor. Analyze the relationship. YOU MUST start the 'explanation' and 'reasoningSource' by citing specific historical events from the provided context (e.g., 'Based on recent behavior...', 'Given the last trust signal...')."
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const serverGenerateDailyMissions = async (contextLeads: string = "", limit: number = 33): Promise<Mission[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema = {
    type: Type.OBJECT,
    properties: {
      missions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING },
            role: { type: Type.STRING },
            company: { type: Type.STRING },
            priority: { type: Type.STRING },
            explanation: { type: Type.STRING },
            reasoningSource: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING }
          },
          required: ["contactName", "role", "company", "priority", "explanation", "reasoningSource", "confidence", "recommendedAction"]
        }
      }
    }
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: STRATEGIC_MODEL,
      contents: `Generate ${limit} missions. Context:\n${contextLeads}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are Mission Control. Synthesize strategic relationship goals. Every explanation MUST reference past behavior or known industry context provided. If no strong signal exists, recommend 'Discovery' or 'No Action'."
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.missions || [];
  });
};

export const serverAskStrategicBrain = async (prompt: string, identityContext: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: STRATEGIC_MODEL,
    contents: prompt,
    config: {
      systemInstruction: `You are Nova Strategic Brain. Reference known owner identity: ${identityContext}`
    }
  });
  return response.text || "Offline.";
};

// Added missing serverGenerateOutreach method to fix error in novaOrchestrator
export const serverGenerateOutreach = async (mission: Mission, identityContext: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: STRATEGIC_MODEL,
    contents: `Generate a professional outreach message for: ${mission.contactName} at ${mission.company}. Strategic Goal: ${mission.explanation}`,
    config: {
      systemInstruction: `You are Nova Strategic Outreach Agent. Follow standard elite equine protocol. Owner Identity:\n${identityContext}`
    }
  });
  return response.text || "No response generated.";
};
