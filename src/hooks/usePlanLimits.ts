// src/hooks/usePlanLimits.ts

export type PlanId = 'free' | 'builder' | 'master';

type Limits = {
  legacyPerMonth: number | 'unlimited';
  ideaPerMonth: number | 'unlimited';
  timelessPerMonth: number | 'unlimited';
  storageBytes: number; // hard cap
  mentorship: 'none' | 'mentee' | 'mentor_mentee';
  showProgressTracker: boolean;
  allowFeaturedIdeas: boolean;
};

export const PLAN_LIMITS: Record<PlanId, Limits> = {
  free: {
    legacyPerMonth: 5,
    ideaPerMonth: 5,
    timelessPerMonth: 5,
    storageBytes: 500 * 1024 * 1024, // 500MB
    mentorship: 'none',
    showProgressTracker: false,
    allowFeaturedIdeas: false,
  },
  builder: {
    legacyPerMonth: 100,      // “Up to 100/month”
    ideaPerMonth: 'unlimited',
    timelessPerMonth: 10,     // “Up to 10/month”
    storageBytes: 5 * 1024 * 1024 * 1024, // 5GB
    mentorship: 'mentee',
    showProgressTracker: true,
    allowFeaturedIdeas: false,
  },
  master: {
    legacyPerMonth: 'unlimited',
    ideaPerMonth: 'unlimited',
    timelessPerMonth: 'unlimited',
    storageBytes: 100 * 1024 * 1024 * 1024, // 100GB
    mentorship: 'mentor_mentee',
    showProgressTracker: true,
    allowFeaturedIdeas: true, // “Unlimited + Featured”
  },
};
