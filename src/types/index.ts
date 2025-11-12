
export interface Feature {
  title: string;
  description: string;
  icon: string;
  link: string;
  cta: string;
}

export interface RouteInfo {
  returnPath?: string;
  pathname?: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  type: string;
  content?: string;
}

export interface IdeaBoostOptions {
  isPublic: boolean;
  isFeatured: boolean;
  isShared: boolean;
}

export interface RecurringMessageSettings {
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customDays?: number[];
  endDate?: string | null;
}

export interface MentorshipBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GroupCircle {
  id: string;
  name: string;
  description: string;
  members: number;
  topics: string[];
  isPublic: boolean;
}

// New interfaces for feature enhancements

export interface TimeCapsuleSettings {
  isTimeCapsule: boolean;
  releaseDate?: string | null;
  releaseStatus: 'scheduled' | 'released' | 'unpublished';
}

export interface MediaSettings {
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'document' | null;
  mediaUrls?: string[];
}

export interface VisibilitySettings {
  isPublic: boolean;
}

export interface IdeaBoostSettings {
  isFeatured: boolean;
  boostCount: number;
  boostUntil?: string | null;
}

export interface MentorProfile {
  id: string;
  expertise: string[];
  industries: string[];
  experienceYears: number;
  monthlyAvailability: number;
  wisdomRating: number;
  calendarUrl?: string | null;
}

export interface MenteeProfile {
  id: string;
  interests: string[];
  currentProjects: string[];
  seekingHelpWith: string | null;
  goals: string[];
}

export interface CaseStudy {
  title: string;
  description: string;
  content?: string;
  image?: string;
}

export interface IdeaPost {
  id: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  boostCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Interface for animation data
export interface AnimationConfig {
  path: string;
  fallbackImage?: string;
}

// Interface for admin dashboard types
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: string[];
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  planType?: string;
}

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
}
