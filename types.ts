
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

export type HorseSubCategory = 
  // Core Operations
  | 'Private Stable' | 'Professional Training Stable' | 'Racing Stable' | 'Endurance Stable' | 'Show Jumping Stable'
  | 'Breeding Farm' | 'Stud Farm' | 'Young Horse Farm' | 'Rehabilitation Farm'
  | 'Flat Racing' | 'Endurance Racing' | 'Camel-Horse Facility'
  | 'Riding School' | 'Competition Center' | 'Polo Club' | 'Show Jumping Arena'
  // Health
  | 'Equine Hospital' | 'Mobile Equine Vet' | 'Gov Veterinary Unit'
  | 'Nutrition Consultant' | 'Performance Advisor' | 'Rehab Specialist'
  | 'Blood Testing Lab' | 'Doping Control' | 'Performance Analysis Lab'
  // Supply
  | 'Feed Distributor' | 'Supplement Importer' | 'Vet Product Distributor'
  | 'Feed Manufacturer' | 'Supplement Producer' | 'Equipment Producer'
  | 'Tack Shop' | 'Feed Store' | 'Online Equine Shop'
  // Gov/Elite
  | 'National Stud' | 'Gov Breeding Program' | 'Police/Military Stable'
  | 'Royal Stable' | 'Private Family Operation' | 'Heritage Breeding Center'
  // Services
  | 'Horse Transport' | 'International Shipping' | 'Quarantine Service'
  | 'Stable Builder' | 'Flooring/Ventilation Specialist' | 'Water/Feeding Systems'
  | 'Grooming Service' | 'Farrier' | 'Dental Specialist'
  // Competition
  | 'Racing Event' | 'Endurance Competition' | 'Horse Show'
  | 'Professional Trainer' | 'Performance Coach'
  // Media
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
  email: string;
  linkedin: string;
  status: 'New' | 'Contacted' | 'Replied' | 'Enriched';
  dealStage: DealStage;
  horseCategory?: HorseCategory;
  horseSubCategory?: HorseSubCategory;
  isSaved?: boolean;
}

// Added MemoryEntry interface to fix import errors in components and services
export interface MemoryEntry {
  id: string;
  entityId: string;
  type: string;
  content: string;
  timestamp: string;
  metadata?: any;
}

export enum ViewType {
  SEARCH = 'SEARCH',
  DASHBOARD = 'DASHBOARD',
  LISTS = 'LISTS',
  AI_BRAIN = 'AI_BRAIN'
}
