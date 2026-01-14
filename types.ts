
export type DealStage = 
  | 'Discovery' 
  | 'Evaluation' 
  | 'Trial' 
  | 'Supply discussion' 
  | 'Closing / Contract' 
  | 'None'
  | 'Saved'
  | 'Strategic';

export type HorseCategory = 
  | 'Core Operations'
  | 'Health & Performance'
  | 'Supply & Trade'
  | 'Gov & Elite'
  | 'Services'
  | 'Competition'
  | 'Media & Influence'
  | 'None';

export type LeadStatus = 'DISCOVERED' | 'SAVED' | 'IGNORED' | 'ARCHIVED' | 'Enriched';
export type RelationshipTemperature = 'Cold' | 'Warm' | 'Hot';
export type MemoryCategory = 'TRUST_SIGNAL' | 'CULTURAL_NOTE' | 'BUYING_CYCLE' | 'ENGAGEMENT' | 'ACTION' | 'SYSTEM';

export interface Reminder {
  id: string;
  date: string;
  type: 'Follow-up' | 'Event Check-in' | 'Meeting' | 'Contract Review';
  note: string;
  isCompleted: boolean;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  roleType: 'Decision Maker' | 'Influencer' | 'Gatekeeper' | 'Irrelevant';
  companyId: string;
  companyName: string;
  companyDomain?: string;
  email: string;
  linkedin: string;
  status: LeadStatus;
  dealStage: DealStage;
  horseCategory?: HorseCategory;
  // Added horseSubCategory to fix type error in ExpoLanding.tsx
  horseSubCategory?: string;
  isSaved?: boolean;
  scoring?: LeadScoring;
  discoveredAt?: string;
  notes?: string;
  whatsapp?: string;
  whatsappPermission?: boolean;
  temperature?: RelationshipTemperature;
  source?: string;
  reminders?: Reminder[];
  relationship_stage?: string;
  saved_at?: string;
  strategic_intent?: string;
  nova_confidence?: number;
}

// Added Company interface to fix import errors in LeadSearch, decisionEngine, and aiService
export interface Company {
  id: string;
  name: string;
  domain: string;
  location: string;
  industry: string;
  horseCategory: HorseCategory;
  horseSubCategory?: string;
  buyerRole?: string;
  size?: string;
  relevanceScore?: number;
  revenue?: string;
}

// Added UserIdentity interface to fix import error in identityService
export interface UserIdentity {
  fullName: string;
  role: string;
  companyName: string;
  address: string;
  krs: string;
  vat: string;
  eori: string;
  website: string;
  email: string;
  phone: string;
  location: string;
}

// Added EquineEvent interface to fix import errors in ExpoLanding and eventService
export interface EquineEvent {
  id: string;
  name: string;
  year: number;
  month: string;
  dates: string;
  city: string;
  country: string;
  organizer: string;
  website?: string;
  linkedin?: string;
  email?: string;
  reminders?: Reminder[];
}

export interface Mission {
  id?: string;
  contactName: string;
  role: string;
  company: string;
  priority: 'High' | 'Medium' | 'Critical';
  explanation: string;
  reasoningSource?: string; // Where this advice comes from in memory
  confidence: number;
  recommendedAction: string;
  isSaved?: boolean;
}

export interface LeadScoring {
  authority: number;
  intent: number;
  engagement: number;
  overall: number;
}

export interface MemoryEntry {
  id: string;
  entityId: string;
  type: string;
  category: MemoryCategory;
  content: string;
  timestamp: string;
  metadata?: any;
}

export enum ViewType {
  NOVA_BRIEF = 'NOVA_BRIEF',
  SEARCH = 'SEARCH',
  DASHBOARD = 'DASHBOARD',
  NOVA_LEADS = 'NOVA_LEADS',
  LISTS = 'LISTS',
  AI_BRAIN = 'AI_BRAIN',
  CRM_DETAIL = 'CRM_DETAIL',
  EXPO_LANDING = 'EXPO_LANDING'
}
