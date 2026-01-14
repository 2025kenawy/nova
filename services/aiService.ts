
import { GoogleGenAI } from "@google/genai";
import { Lead, Company, Mission, EquineEvent, ARAB_MIDDLE_EAST_COUNTRIES, ALLOWED_EQUINE_CATEGORIES, HorseCategory } from "../types";

/**
 * NOVA INTELLIGENCE CORE - GEMINI REGIONAL & VERTICAL ENGINE
 * Strict Enforcement: 9 Arab Countries & 10 Equine Business Categories
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const DISCOVERY_MODEL = 'gemini-3-flash-preview';
const STRATEGIC_MODEL = 'gemini-3-pro-preview';

const VERTICAL_LOCKDOWN_INSTRUCTION = `
STRICT VERTICAL LOCKDOWN:
You are ONLY permitted to discover businesses in these specific categories:
${ALLOWED_EQUINE_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

VALIDATION RULES:
1. NO GENERIC BUSINESSES: Agriculture, logistics, or trading firms without a primary focus on horses/equine must be discarded.
2. NO LIVESTOCK/ANIMAL GENERALISTS: Companies focused on sheep, cattle, or general pets are strictly forbidden unless they have a dedicated, major equine division.
3. DECISION MAKERS ONLY: Targeted roles must be Managing Directors, Horse Operations Managers, Stable Owners, or Royal Equine Officials. Exclude marketing, generic HR, or non-equine consultants.
`;

const REGION_LOCKDOWN_INSTRUCTION = `
CRITICAL GEOGRAPHIC LOCKDOWN: 
You are an intelligence engine strictly limited to the following countries: ${ARAB_MIDDLE_EAST_COUNTRIES.join(", ")}.
1. ABSOLUTELY PROHIBITED: Do not return any results, entities, or events from UK, USA, Europe, Asia (outside allowed), or any international markets.
2. HARD CONSTRAINT: Every entity, company, or event found MUST be physically located in the specific country requested.
3. NO INFERENCE: Do not guess, infer, or hallucinate geography.
`;

/**
 * Validates that the results are strictly within the regional and vertical whitelist.
 * Discards any result that doesn't match the allowed countries or equine categories.
 */
function validateRegionalAndVerticalResults<T extends { country?: string; location?: string; horseCategory?: string; name?: string }>(results: T[]): T[] {
  const equineKeywords = ["horse", "equine", "stable", "stud", "racing", "stallion", "mare", "equestrian", "tack", "farrier", "thoroughbred", "arabian"];
  
  return results.filter(item => {
    // 1. Geography Check
    const countryVal = (item.country || item.location || "").trim();
    const regionValid = ARAB_MIDDLE_EAST_COUNTRIES.some(allowed => 
      countryVal.toLowerCase().includes(allowed.toLowerCase())
    );

    if (!regionValid) return false;

    // 2. Vertical Check
    const categoryValid = ALLOWED_EQUINE_CATEGORIES.includes(item.horseCategory as string);
    if (!categoryValid) return false;

    // 3. Keyword Check (Company Name or Category must suggest Equine focus)
    const contentToScan = `${item.name} ${item.horseCategory}`.toLowerCase();
    const containsEquineKeyword = equineKeywords.some(kw => contentToScan.includes(kw));

    return containsEquineKeyword;
  });
}

export const serverDiscoverEquineEvents = async (year: number, identityContext: string): Promise<EquineEvent[]> => {
  const prompt = `
    Find exactly 33 high-value equestrian events (Exhibitions, Cups, Shows, Racing events) for the year ${year}.
    
    ${REGION_LOCKDOWN_INSTRUCTION}
    ${VERTICAL_LOCKDOWN_INSTRUCTION}
    
    Output JSON format:
    { "events": [{ "name": "...", "year": 2026, "month": "...", "dates": "...", "city": "...", "country": "...", "organizer": "...", "website": "...", "linkedin": "...", "email": "..." }] }
    
    Identity Context: ${identityContext}
  `;

  const response = await ai.models.generateContent({
    model: DISCOVERY_MODEL,
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: `You are the Nova Regional Event Discovery Engine. Vertical Lockdown: Equine only. Regional Lockdown: Middle East only.`
    }
  });

  const data = JSON.parse(response.text || '{"events": []}');
  const results = data.events || [];

  return validateRegionalAndVerticalResults(results).map((e: any, i: number) => ({
    ...e,
    id: `event-gemini-${Date.now()}-${i}`,
    reminders: []
  }));
};

export const serverSearchCompanies = async (keyword: string, location: string, identityContext: string): Promise<Company[]> => {
  const prompt = `
    Perform a High-Velocity "Big Brain" Market Intelligence Scan.
    Task: Identify the top 20 high-value companies and stakeholders specifically for the equine industry in ${location}.
    
    ${REGION_LOCKDOWN_INSTRUCTION}
    ${VERTICAL_LOCKDOWN_INSTRUCTION}
    
    For each company, provide:
    - Accurate Legal Name
    - Corporate Domain
    - Physical Headquarters (City, Country)
    - Industry Segment (MUST be one of the 10 allowed horse categories)
    - Strategic Relevance Score (0-100)
    - Estimated Revenue or Market Cap Category
    - Key Stakeholder Role (Decision makers only)
    
    Output JSON format:
    { "results": [{ "name": "...", "domain": "...", "location": "...", "horseCategory": "...", "horseSubCategory": "...", "buyerRole": "...", "size": "...", "relevanceScore": 85, "revenue": "..." }] }
    
    Identity Context: ${identityContext}
  `;

  const response = await ai.models.generateContent({
    model: DISCOVERY_MODEL,
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: `You are the Nova Big Brain Regional & Vertical Scanner. Horse business focus is MANDATORY. Lockdown is active for ${location}.`
    }
  });

  const data = JSON.parse(response.text || '{"results": []}');
  const results = data.results || [];

  return validateRegionalAndVerticalResults(results).map((c: any, i: number) => ({
    ...c,
    id: `comp-gemini-${Date.now()}-${i}`,
    industry: 'Equine Industry'
  }));
};

export const serverAnalyzePriority = async (leadData: Lead, memoryContext: string): Promise<any> => {
  const prompt = `
    Strategic Analysis of ${leadData.firstName} ${leadData.lastName} at ${leadData.companyName}.
    History: ${memoryContext}
    
    ${REGION_LOCKDOWN_INSTRUCTION}
    ${VERTICAL_LOCKDOWN_INSTRUCTION}
    
    Output JSON Object:
    { "horseAuthorityScore": 0-100, "horseIntentScore": 0-100, "horseEngagementScore": 0-100, "explanation": "...", "reasoningSource": "..." }
  `;

  const response = await ai.models.generateContent({
    model: STRATEGIC_MODEL,
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are the Nova Big Brain. Evaluate trust and intent within the Middle Eastern equine sector."
    }
  });

  return JSON.parse(response.text || "{}");
};

export const serverGenerateDailyMissions = async (contextLeads: string = "", limit: number = 33): Promise<Mission[]> => {
  const prompt = `
    Generate ${limit} missions from this context:
    ${contextLeads}
    
    ${REGION_LOCKDOWN_INSTRUCTION}
    ${VERTICAL_LOCKDOWN_INSTRUCTION}
    
    Output JSON Object with missions array:
    { "missions": [{ "contactName": "...", "role": "...", "company": "...", "priority": "High|Medium|Critical", "explanation": "...", "reasoningSource": "...", "confidence": 0-100, "recommendedAction": "..." }] }
  `;

  const response = await ai.models.generateContent({
    model: DISCOVERY_MODEL,
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are Mission Control. Optimize engagement across regional equine nodes."
    }
  });

  const result = JSON.parse(response.text || '{"missions": []}');
  return result.missions || [];
};

export const serverAskStrategicBrain = async (prompt: string, identityContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: STRATEGIC_MODEL,
    contents: prompt,
    config: {
      systemInstruction: `You are the Nova Strategic Big Brain. Answer complex queries with deep logic, restricted to Middle East equine market dynamics. ${REGION_LOCKDOWN_INSTRUCTION} ${VERTICAL_LOCKDOWN_INSTRUCTION} Owner: ${identityContext}`
    }
  });
  return response.text;
};

export const serverGenerateOutreach = async (mission: Mission, identityContext: string): Promise<string> => {
  const prompt = `
    Draft high-impact outreach for ${mission.contactName} at ${mission.company}.
    Context: ${mission.explanation}
  `;

  const response = await ai.models.generateContent({
    model: DISCOVERY_MODEL,
    contents: prompt,
    config: {
      systemInstruction: `You are the Nova Outreach Engine. Professional and culturally precise communication for the Arab equine region. ${REGION_LOCKDOWN_INSTRUCTION} ${VERTICAL_LOCKDOWN_INSTRUCTION} Owner: ${identityContext}`
    }
  });
  return response.text;
}
