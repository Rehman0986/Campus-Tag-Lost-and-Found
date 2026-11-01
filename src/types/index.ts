export type UserRole = 'super_admin' | 'customer' | 'finder';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId?: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'disabled';
}

export interface Tenant {
  id: string;
  name: string;
  campusName: string;
  slug: string;
  ownerId: string;
  planId: string;
  itemLimit: number;
  contactEmail: string;
  phone?: string;
  createdAt: string;
  isVerified: boolean;
}

export type ItemCategory = 
  | 'Electronics & Laptops' 
  | 'Lab & Research Equipment' 
  | 'Textbooks & Notebooks' 
  | 'Keys & Access Badges' 
  | 'Bicycles & Scooters' 
  | 'Musical Instruments' 
  | 'Bags & Backpacks' 
  | 'Other Essentials';

export interface Item {
  id: string;
  tenantId: string;
  publicId: string; // Unguessable UUID used in QR url: /f/{publicId}
  name: string;
  category: ItemCategory;
  description: string;
  photoUrl: string;
  serialNumber?: string;
  rewardOffered?: string;
  isLost: boolean;
  lostDate?: string;
  lostNote?: string;
  isRecovered: boolean;
  recoveredDate?: string;
  createdAt: string;
  updatedAt: string;
  scanCount: number;
  lastScannedAt?: string;
  lastLocation?: {
    lat: number;
    lng: number;
    address?: string;
    timestamp: string;
    source: 'finder' | 'owner';
  };
}

export interface FinderReport {
  id: string;
  itemId: string;
  publicId: string;
  itemName: string;
  tenantId: string;
  timestamp: string;
  message: string;
  finderContactNote?: string;
  evidencePhotoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'unread' | 'read' | 'resolved';
}

export interface MessageThread {
  id: string;
  itemId: string;
  tenantId: string;
  publicId: string;
  finderSessionId: string;
  createdAt: string;
  lastMessageAt: string;
  messages: {
    id: string;
    sender: 'finder' | 'owner';
    text: string;
    timestamp: string;
  }[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in USD
  billingCycle: '7-Day Pass' | 'Monthly' | 'Yearly';
  itemLimit: number;
  trialDays: number;
  features: string[];
  isActive: boolean;
  badge?: string;
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  targetType: 'User' | 'Item' | 'Plan' | 'Settings' | 'Tenant' | 'Report';
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
}

export interface FutureBenefitItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlight: string;
  readinessStatus: 'Active Beta' | 'In Deployment' | 'Campus Pilot' | 'Phase 2 Architecture';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Privacy' | 'Equipment' | 'Campus Security' | 'Pricing';
}

export interface WebsiteSettings {
  appName: string;
  tagline: string;
  heroHeadline: string;
  heroDescription: string;
  contactEmail: string;
  supportPhone: string;
  campusOfficeAddress: string;
  footerDescription: string;
  copyrightText: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  announcementBanner?: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
  };
  howItWorksSteps: HowItWorksStep[];
  featuresList: FeatureItem[];
  futureUseSection?: {
    enabled: boolean;
    badge: string;
    headline: string;
    subheadline: string;
    items: FutureBenefitItem[];
  };
  faqList?: FAQItem[];
  maintenanceMode: boolean;
  isFirstRunCompleted: boolean;
}
