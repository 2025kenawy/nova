
import { Lead, LeadScoring, Company, MemoryEntry } from '../types';

/**
 * DETERMINISTIC CONTEXT ENGINE
 * Enforces relationship safety and advisor rules.
 */

export const MAX_VISIBLE_RESULTS = 33;
const OUTREACH_COOLDOWN_DAYS = 7;

export const calculateLeadPriority = (scoring: Partial<LeadScoring>): number => {
  const { authority = 0, intent = 0, engagement = 0 } = scoring;
  return Math.round((intent * 0.5) + (authority * 0.3) + (engagement * 0.2));
};

/**
 * Evaluates whether an action should be taken based on deterministic rules.
 * "Do nothing" is a valid and often preferred state for relationship safety.
 */
export const evaluateRelationshipSafety = (memories: MemoryEntry[]): { safe: boolean; reason: string } => {
  const now = new Date();
  
  // 1. Cooldown Rule: Don't pester.
  const lastOutreach = memories
    .filter(m => m.type === 'outreach' || m.category === 'ACTION')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  if (lastOutreach) {
    const lastDate = new Date(lastOutreach.timestamp);
    const diffDays = Math.ceil(Math.abs(now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < OUTREACH_COOLDOWN_DAYS) {
      return { 
        safe: false, 
        reason: `Relationship Cooldown: Last interaction was only ${diffDays} days ago. Wait for more signals.` 
      };
    }
  }

  // 2. Trust Signal Rule: Respect negative signals.
  const negativeTrust = memories.find(m => m.category === 'TRUST_SIGNAL' && m.content.toLowerCase().includes('negative'));
  if (negativeTrust) {
    return {
      safe: false,
      reason: "Trust Warning: Negative strategic signal recorded. Manual verification required before automated outreach."
    };
  }

  return { safe: true, reason: "Optimal engagement window active." };
};

export const sortMissionsByPriority = (missions: any[]): any[] => {
  const priorityMap = { 'Critical': 3, 'High': 2, 'Medium': 1 };
  return [...missions]
    .sort((a, b) => {
      const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
      const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
      if (pB !== pA) return pB - pA;
      return (b.confidence || 0) - (a.confidence || 0);
    })
    .slice(0, MAX_VISIBLE_RESULTS);
};
