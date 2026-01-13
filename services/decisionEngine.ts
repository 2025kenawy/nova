
import { Lead, LeadScoring, Company } from '../types';

/**
 * DETERMINISTIC DECISION ENGINE
 * Pure functions only. No API calls. No UI.
 */

export const MAX_VISIBLE_RESULTS = 33;

export const calculateLeadPriority = (scoring: Partial<LeadScoring>): number => {
  const { authority = 0, intent = 0, engagement = 0 } = scoring;
  // Weighted priority calculation: Intent is most important (50%), then Authority (30%), then Engagement (20%)
  return Math.round((intent * 0.5) + (authority * 0.3) + (engagement * 0.2));
};

export const filterEliteCompanies = (companies: Company[]): Company[] => {
  return companies.filter(c => c.relevanceScore > 75);
};

export const sortMissionsByPriority = (missions: any[]): any[] => {
  const priorityMap = { 'High': 2, 'Medium': 1 };
  return [...missions]
    .sort((a, b) => {
      const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
      const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
      if (pB !== pA) return pB - pA;
      return (b.confidence || 0) - (a.confidence || 0);
    })
    .slice(0, MAX_VISIBLE_RESULTS);
};
