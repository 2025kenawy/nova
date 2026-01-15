
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
  | 'Horse Feed & Nutrition'
  | 'Veterinary & Equine Health'
  | 'Breeding & Stud Farms'
  | 'Racing & Competition'
  | 'Horse Equipment & Tack'
  | 'Equine Transport & Logistics'
  | 'Auctions & Horse Trading'
  | 'Government & Royal Equestrian Operations'
  | 'Equestrian Events & Expos'
  | 'High-Value Stables & Private Horse Owners'
  | 'None';

export type LeadStatus = 'DISCOVERED' | 'SAVED' | 'IGNORED' | 'ARCHIVED' | 'Enriched';
export type RelationshipTemperature = 'Cold' | 'Warm' | 'Hot';
export type MemoryCategory = 'TRUST_SIGNAL' | 'CULTURAL_NOTE' | 'BUYING_CYCLE' | 'ENGAGEMENT' | 'ACTION' | 'SYSTEM';

export const ARAB_MIDDLE_EAST_COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Jordan",
  "Egypt",
  "Morocco"
];

export const ALLOWED_EQUINE_CATEGORIES = [
  "Horse Feed & Nutrition",
  "Veterinary & Equine Health",
  "Breeding & Stud Farms",
  "Racing & Competition",
  "Horse Equipment & Tack",
  "Equine Transport & Logistics",
  "Auctions & Horse Trading",
  "Government & Royal Equestrian Operations",
  "Equestrian Events & Expos",
  "High-Value Stables & Private Horse Owners"
];

export interface Reminder {
  id: string;
  date: string;
  type: 'Follow-up' | 'Event Check-in' | 'Meeting' | 'Contract Review';
  note: string;
  isCompleted: boolean;
}

export interface Hotel {
  name: string;
  description: string;
  rating: string;
  googleHotelsUrl: string;
  bookingUrl: string;
  directionsUrl: string;
}

export interface FlightOption {
  type: 'Best Price' | 'Shortest Time' | 'Optimal Arrival';
  route: string;
  carrier: string;
  estimatedPrice: string;
  duration: string;
  searchUrl: string;
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
  reasoningSource?: string;
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
