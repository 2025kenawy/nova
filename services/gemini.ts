
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Company, HorseCategory, HorseSubCategory, BuyerRole, DealStage } from "../types";
import { getIdentityContext, WALID_IDENTITY } from "./identityService";

/**
 * NOVA SECURE BACKEND SERVICE
 * This file contains all AI logic, prompt construction, and API interactions.
 * UI components must never call this directly; they must use novaClient.ts.
 */

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const HORSE_TAXONOMY_INSTRUCTION = `
FULL HORSE ECOSYSTEM CATEGORY MAP:
1. Core Operations: Stables (Private, Training, Racing, Endurance, Show jumping), Horse Farms (Breeding, Stud, Young, Rehab), Racing Operations (Flat, Endurance, Camel-horse), Equestrian Clubs.
2. Health & Performance: Vet Clinics (Hospital, Mobile, Gov), Nutrition Specialists, Labs.
3. Supply Chain & Trade: Importers/Distributors, Manufacturers, Retailers.
4. Gov & Elite: Gov Programs (National studs, Police/military), Royal & Elite Operations.
5. Services & Infrastructure: Transport, Construction, Care (Grooming, Farriers, Dental).
6. Competition & Events: Events, Trainers & Coaches.
7. Media & Influence: Associations, Media, Influencers.
`;

const SYSTEM_PROMPT = `You are "Nova Core" - Private Intelligence Brain for Walid Kenawy.
${getIdentityContext()}

GEOGRAPHIC SOVEREIGNTY: Focus exclusively on UAE, KSA, Qatar, Kuwait, Oman, Bahrain, Jordan, and Egypt.
MARKET FOCUS: 100% Equine only.

${HORSE_TAXONOMY_INSTRUCTION}

NON-NEGOTIABLE OPERATIONAL RULES:
1. TAXONOMY PURITY: No generic businesses. Every lead MUST map to one or more of the 7 horse categories above.
2. BUYING ROLES: Assign every contact as 'Buyer', 'Influencer', or 'Gatekeeper'.
3. IDENTITY: All communication must be signed as ${getIdentityContext()}.
4. QUALITY: Prioritize "Gov & Elite" and "Racing Operations" in Qatar and Kuwait.
5. NO HALLUCINATIONS: If a company doesn't clearly fit the horse industry, discard it.`;

async function generateStructuredAnalysis(contents: string, schema: any, model: string = 'gemini-3-pro-preview'): Promise<any> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_PROMPT
      }
    });
    
    let text = response.text || "{}";
    // Sanitize in case model wraps in markdown
    if (text.includes('```')) text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Nova Core Logic Failure:", error);
    throw new Error("Intelligence synthesis disrupted.");
  }
}

export const serverSearchCompanies = async (keyword: string, location: string): Promise<Company[]> => {
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
        revenue: { type: Type.STRING },
        relevanceScore: { type: Type.NUMBER }
      },
      required: ["name", "domain", "location", "horseCategory", "horseSubCategory", "buyerRole", "relevanceScore"]
    }
  };

  const results = await generateStructuredAnalysis(
    `Identify elite horse industry entities for query: "${keyword}" in "${location}". Ensure they fit the 7-layer taxonomy.`,
    schema
  );

  return results.map((c: any, i: number) => ({ 
    ...c, 
    id: `comp-${Date.now()}-${i}`, 
    industry: 'Equine',
    qualificationStatus: 'unqualified',
    companyScore: c.relevanceScore || 0
  }));
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

  return await generateStructuredAnalysis(
    `Execute deep equine audit for ${company.name} (${company.horseSubCategory}). Calculate seasonal demand in ${company.location}.`,
    schema
  );
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
        roleType: { type: Type.STRING }
      },
      required: ["firstName", "lastName", "title", "linkedin", "roleType"]
    }
  };

  const results = await generateStructuredAnalysis(
    `Identify decision makers at ${company.name}. Focus on Owners, GMs, and Vets.`,
    schema
  );

  return results.map((l: any, i: number) => ({
    ...l,
    id: `lead-${Date.now()}-${i}`,
    companyId: company.id,
    companyName: company.name,
    horseSubCategory: company.horseSubCategory,
    status: 'New',
    dealStage: 'Discovery',
    email: 'Contact Via Nova'
  }));
};

export const serverGenerateCommandCenter = async (): Promise<any[]> => {
  const schema = {
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
  };

  return await generateStructuredAnalysis(
    "Synthesize daily missions for Walid. Prioritize Royal Stables and Racing Operations.",
    schema
  );
};

export interface DecisionResult {
  horseAuthorityScore: number;
  horseIntentScore: number;
  horseEngagementScore: number;
  priorityScore: number;
  dealStage: DealStage;
  recommendedAction: "email" | "linkedin" | "wait" | "pause" | "close";
  explanation: string;
}

export const serverAnalyzeLeadPriority = async (lead: Lead, memoryContext: string): Promise<DecisionResult> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      horseAuthorityScore: { type: Type.NUMBER },
      horseIntentScore: { type: Type.NUMBER },
      horseEngagementScore: { type: Type.NUMBER },
      priorityScore: { type: Type.NUMBER },
      dealStage: { type: Type.STRING },
      recommendedAction: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ["priorityScore", "dealStage", "recommendedAction", "explanation", "horseAuthorityScore", "horseIntentScore", "horseEngagementScore"]
  };

  const prompt = `
    Analyze Equestrian Priority for Walid Kenawy.
    Lead: ${lead.firstName} ${lead.lastName}
    Company: ${lead.companyName}
    Sector: ${lead.horseSubCategory}
    Context: ${memoryContext}

    OPERATIONAL RULES:
    1. AUTHORITY: High score for owners/heads of royal/gov programs.
    2. INTENT: Boost score if active racing/competition signals are detected in history.
    3. PRIORITY: Reflect sector value. Elite operations > Supply/Trade.
  `;

  return await generateStructuredAnalysis(prompt, schema);
};

export const serverDraftOutreach = async (mission: any): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Draft a high-status, relationship-focused outreach email from ${WALID_IDENTITY.fullName}, ${WALID_IDENTITY.role} at ${WALID_IDENTITY.companyName} (based in ${WALID_IDENTITY.location}), to ${mission.contactName} (${mission.role} at ${mission.company}). 
    
    Focus on: ${mission.recommendedAction}. 
    Context: ${mission.explanation}. 
    
    Signal European quality from Nobel Spirit Labs (Poland) while respecting Middle Eastern cultural pacing.
    Include professional signature with website: ${WALID_IDENTITY.website}
    Ensure the subject line is professional but intriguing.
    Output only the Subject and Body.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  
  return response.text || "Drafting failed.";
};

export const serverExecuteBrainCommand = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return response.text || "Insight logged.";
};
