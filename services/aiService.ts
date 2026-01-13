
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Company, Mission, DealStage, HorseCategory, HorseSubCategory, BuyerRole } from "../types";

/**
 * NOVA CONSOLIDATED AI SERVICE
 * Pure Gemini Architecture.
 * Sole source of truth for market intelligence and strategic reasoning.
 */

const GEMINI_API_KEY = process.env.API_KEY || "";
const GEMINI_MODEL = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
      contents: `Identify high-tier equine entities for keyword: "${keyword}" in "${location}". Scan broadly to find at least 15-20 relevant entities.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Market Core. Focus on the horse industry. Owner Identity:\n${identityContext}`
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
      contents: `Analyze equine market standing for: ${company.name} (${company.domain}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Qualification Engine. Rate authority and intent within the horse industry.`
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
      contents: `Identify key decision makers at ${company.name} involved in equine operations. Include social media links (LinkedIn, Twitter, Facebook, Instagram) if available.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are Nova Lead Finder. Output only horse-relevant personnel. For social links, provide full URLs or 'N/A'.`
      }
    });
    const results = JSON.parse(response.text || "[]");
    return results.map((l: any, i: number) => ({
      ...l,
      id: `lead-${Date.now()}-${i}`,
      companyId: company.id,
      companyName: company.name,
      status: 'New' as Lead['status'],
      dealStage: 'Discovery' as DealStage,
      email: 'verified@nova.secure'
    }));
  });
};

// --- STRATEGIC BRAIN (GEMINI NATIVE) ---

export interface PriorityAnalysisRaw {
  horseAuthorityScore: number;
  horseIntentScore: number;
  horseEngagementScore: number;
  dealStage: DealStage;
  recommendedAction: "email" | "linkedin" | "wait";
  explanation: string;
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
      explanation: { type: Type.STRING }
    },
    required: ["horseAuthorityScore", "horseIntentScore", "horseEngagementScore", "dealStage", "recommendedAction", "explanation"]
  };

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Lead: ${leadData.firstName} ${leadData.lastName} (${leadData.title}) at ${leadData.companyName}. Market Context: ${memoryContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are the Nova Strategic Brain. Analyze this lead's value in the equestrian market. Output valid JSON scores 0-100."
    }
  });

  return JSON.parse(response.text || "{}");
};

export const serverGenerateOutreach = async (mission: Mission, identityContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Draft for: ${mission.contactName} at ${mission.company}. Intent: ${mission.explanation}. Action: ${mission.recommendedAction}.`,
    config: {
      systemInstruction: `You are a high-tier equestrian strategic advisor. Identity: ${identityContext}. Draft concise, high-status outreach. Format: 'Subject:' line first, then 'Body:'.`
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
    contents: `Synthesize up to ${limit} high-impact GCC horse industry missions. ${contextLeads ? `Context: ${contextLeads}` : "Broad search required."}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are Nova Mission Control. Synthesize high-impact equestrian signals into actionable strategic missions."
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
      systemInstruction: `You are the Nova Strategic Brain. Identity: ${identityContext}. Be blunt, strategic, and professional. Focus solely on business growth in the equestrian sector.`
    }
  });

  return response.text || "Strategic brain currently offline.";
};
