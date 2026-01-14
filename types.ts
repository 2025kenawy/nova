
export type DealStage = 
  | 'Discovery' 
  | 'Evaluation' 
  | 'Trial' 
  | 'Supply discussion' 
  | 'Closing / Contract' 
  | 'None';

export type HorseCategory = 
  | 'Core Operations'      // Stables, Farms, Racing, Clubs
  | 'Health & Performance' // Vets, Nutrition, Labs
  | 'Supply & Trade'       // Distributors, Manufacturers, Retail
  | 'Gov & Elite'          // Royal, Gov Programs
  | 'Services'             // Logistics, Construction, Care
  | 'Competition'          // Events, Trainers
  | 'Media & Influence'    // Federations, Media
  | 'None';

export type LeadStatus = 'DISCOVERED' | 'SAVED' | 'IGNORED' | 'ARCHIVED' | 'Enriched';

export type RelationshipTemperature = 'Cold' | 'Warm' | 'Hot';

export interface Reminder {
  id: string;
  date: string;
  type: 'Follow-up' | 'Event Check-in' | 'Meeting' | 'Contract Review';
  note: string;
  isCompleted: boolean;
}

export interface EquineEvent {
  id: string;
  name: string;
  dates: string;
  city: string;
  country: string;
  organizer: string;
  website: string;
  email?: string;
  linkedin?: string;
  category: string;
  month: string;
  year: number;
  discoveredAt: string;
  reminders?: Reminder[];
}

export type HorseSubCategory = 
  | 'Private Stable' | 'Professional Training Stable' | 'Racing Stable' | 'Endurance Stable' | 'Show Jumping Stable'
  | 'Breeding Farm' | 'Stud Farm' | 'Young Horse Farm' | 'Rehabilitation Farm'
  | 'Flat Racing' | 'Endurance Racing' | 'Camel-Horse Facility'
  | 'Riding School' | 'Competition Center' | 'Polo Club' | 'Show Jumping Arena'
  | 'Equine Hospital' | 'Mobile Equine Vet' | 'Gov Veterinary Unit'
  | 'Nutrition Consultant' | 'Performance Advisor' | 'Rehab Specialist'
  | 'Blood Testing Lab' | 'Doping Control' | 'Performance Analysis Lab'
  | 'Feed Distributor' | 'Supplement Importer' | 'Vet Product Distributor'
  | 'Feed Manufacturer' | 'Supplement Producer' | 'Equipment Producer'
  | 'Tack Shop' | 'Feed Store' | 'Online Equine Shop'
  | 'National Stud' | 'Gov Breeding Program' | 'Police/Military Stable'
  | 'Royal Stable' | 'Private Family Operation' | 'Heritage Breeding Center'
  | 'Horse Transport' | 'International Shipping' | 'Quarantine Service'
  | 'Stable Builder' | 'Flooring/Ventilation Specialist' | 'Water/Feeding Systems'
  | 'Grooming Service' | 'Farrier' | 'Dental Specialist'
  | 'Racing Event' | 'Endurance Competition' | 'Horse Show'
  | 'Professional Trainer' | 'Performance Coach'
  | 'Equestrian Federation' | 'Racing Authority'
  | 'Horse Magazine' | 'Social Media Influencer' | 'Industry Reporter'
  | 'None';

export type BuyerRole = 'Buyer' | 'Influencer' | 'Gatekeeper';

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

export interface LeadScoring {
  authority: number;
  intent: number;
  engagement: number;
  overall: number;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  revenue: string;
  linkedin?: string;
  logo?: string;
  companyScore?: number;
  horseCategory?: HorseCategory;
  horseSubCategory?: HorseSubCategory;
  buyerRole?: BuyerRole;
  relevanceScore: number;
  stableCapacity?: string;
  buyingFocus?: string;
  qualificationStatus?: 'unqualified' | 'qualifying' | 'qualified';
  intelligenceSummary?: string;
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
  twitter?: string;
  facebook?: string;
  instagram?: string;
  status: LeadStatus;
  dealStage: DealStage;
  horseCategory?: HorseCategory;
  horseSubCategory?: HorseSubCategory;
  isSaved?: boolean;
  scoring?: LeadScoring;
  discoveredAt?: string;
  notes?: string;
  whatsapp?: string;
  whatsappPermission?: boolean;
  temperature?: RelationshipTemperature;
  source?: string;
  reminders?: Reminder[];
}

export interface Mission {
  contactName: string;
  role: string;
  company: string;
  priority: 'High' | 'Medium';
  explanation: string;
  confidence: number;
  recommendedAction: string;
}

export interface MemoryEntry {
  id: string;
  entityId: string;
  type: string;
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
