
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Company, Mission, DealStage, HorseCategory, HorseSubCategory, BuyerRole } from "../types";

/**
 * NOVA CONSOLIDATED AI SERVICE
 * Pure Gemini Architecture.
 * Sole source of truth for market intelligence and strategic reasoning.
 * Configured for Arab-Market Horse Industry Dominance.
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const GEMINI_MODEL = 'gemini-3-pro-preview';

// --- INTERNAL UTILITIES ---

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = 
      error?.message?.includes('429') || 
      error?.status === 429 || 
      JSON.stringify(error).includes('RESOURCE_EXHAUSTED');

    if (isQuotaError && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// --- GEMINI: STRUCTURED DATA RETRIEVAL ---

export const serverSearchCompanies = async (keyword: string, location: string, identityContext: string): Promise<Company[]> => {
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
      model: GEMINI_MODEL,
      contents: `Identify 15-25 high-tier equine entities and horse product buyers (stables, feed importers, tack shops, breeding farms) for keyword: "${keyword}" in "${location}". Ensure domain names are valid and focus strictly on the Arab market and GCC region.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Arab-Market Intelligence. Your goal is to identify buyers, users, and distributors of horse products in Arab countries. Focus on high-value relationships. Output valid JSON. Owner Identity:\n${identityContext}`
      }
    });
    
    const results = JSON.parse(response.text || "[]");
    return results.map((c: any, i: number) => ({
      ...c,
      id: `comp-${Date.now()}-${i}`,
      industry: 'Equine',
      qualificationStatus: 'unqualified' as const
    }));
  });
};

export const serverQualifyCompany = async (company: Company): Promise<Partial<Company>> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      companyScore: { type: Type.NUMBER },
      buyingFocus: { type: Type.STRING },
      stableCapacity: { type: Type.STRING },
      intelligenceSummary: { type: Type.STRING }
    },
    required: ["companyScore", "buyingFocus", "stableCapacity", "intelligenceSummary"]
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze Arab market standing and horse product buying intent for: ${company.name} (${company.domain}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Qualification Engine. Focus on Arab market authority and intent to purchase/use equine products.`
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const serverFindDecisionMakers = async (company: Company): Promise<Lead[]> => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        firstName: { type: Type.STRING },
        lastName: { type: Type.STRING },
        title: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        twitter: { type: Type.STRING },
        facebook: { type: Type.STRING },
        instagram: { type: Type.STRING },
        roleType: { type: Type.STRING }
      },
      required: ["firstName", "lastName", "title", "roleType"]
    }
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Identify key decision makers at ${company.name} who manage horse operations or purchase equine supplies in the Arab market.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Lead Finder. Identify the correct personnel for partnership building in the Arab horse industry.`
      }
    });
    const results = JSON.parse(response.text || "[]");
    return results.map((l: any, i: number) => ({
      ...l,
      id: `lead-${Date.now()}-${i}`,
      companyId: company.id,
      companyName: company.name,
      status: 'DISCOVERED' as Lead['status'],
      dealStage: 'Discovery' as DealStage,
      email: 'verified@nova.secure'
    }));
  });
};

export interface PriorityAnalysisRaw {
  horseAuthorityScore: number;
  horseIntentScore: number;
  horseEngagementScore: number;
  dealStage: DealStage;
  recommendedAction: "email" | "linkedin" | "wait";
  explanation: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export const serverAnalyzePriority = async (leadData: Lead, memoryContext: string): Promise<PriorityAnalysisRaw> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      horseAuthorityScore: { type: Type.NUMBER },
      horseIntentScore: { type: Type.NUMBER },
      horseEngagementScore: { type: Type.NUMBER },
      dealStage: { type: Type.STRING },
      recommendedAction: { type: Type.STRING },
      explanation: { type: Type.STRING },
      twitter: { type: Type.STRING },
      facebook: { type: Type.STRING },
      instagram: { type: Type.STRING }
    },
    required: ["horseAuthorityScore", "horseIntentScore", "horseEngagementScore", "dealStage", "recommendedAction", "explanation"]
  };

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Lead: ${leadData.firstName} ${leadData.lastName} (${leadData.title}) at ${leadData.companyName}. Analyze relationship potential in the Arab equestrian market. Context: ${memoryContext}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are the Nova Strategic Brain. Evaluate relationship value within Arab horse industry networks."
    }
  });

  return JSON.parse(response.text || "{}");
};

export const serverGenerateOutreach = async (mission: Mission, identityContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Draft manual outreach for: ${mission.contactName} at ${mission.company} in the Arab market.`,
    config: {
      systemInstruction: `You are a professional equestrian advisor for the Arab market. Focus on building long-term networks. Outreach must be respectful and manual. Identity: ${identityContext}. Format: 'Subject:' line first, then 'Body:'.`
    }
  });

  return response.text || "Strategic failure in outreach generation.";
};

export const serverGenerateDailyMissions = async (contextLeads: string = "", limit: number = 33): Promise<Mission[]> => {
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
            confidence: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING }
          },
          required: ["contactName", "role", "company", "priority", "explanation", "confidence", "recommendedAction"]
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Synthesize ${limit} Arab-market horse industry relationship missions. ${contextLeads}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are Nova Mission Control. Focus on relationship-first missions in GCC and Arab countries."
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result.missions || [];
};

export const serverAskStrategicBrain = async (prompt: string, identityContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: `You are the Nova Strategic Brain. Expert in Arab equestrian markets and product trade.`
    }
  });

  return response.text || "Strategic brain currently offline.";
};
