import { getItem, setItem } from './storage';

/** Plan from docs/MONETIZATION.md: 90 days everything free, then Passport free, working features paid. */
export const TRIAL_DAYS = 90;
export const INDIVIDUAL_PRICE_EUR = 3.8;

export type Feature = 'passport' | 'share' | 'jobs' | 'timesheets' | 'crew' | 'exports';
const ALWAYS_FREE: Feature[] = ['passport', 'share', 'jobs'];

const KEY = 'cp.trialStart.v1';

export interface Access {
  phase: 'trial' | 'subscribed' | 'expired';
  daysLeft: number;
  can: (f: Feature) => boolean;
}

export async function getTrialStart(): Promise<Date> {
  const saved = await getItem(KEY);
  if (saved) {
    const d = new Date(saved);
    if (!isNaN(d.getTime())) return d;
  }
  const now = new Date();
  await setItem(KEY, now.toISOString());
  return now;
}

/**
 * Client-side placeholder. TODO: move trial start and subscription state to the server so a reinstall
 * cannot restart the trial, and connect store purchases (individual plan) and company billing (web).
 */
export async function getAccess(subscribed = false): Promise<Access> {
  const start = await getTrialStart();
  const elapsedDays = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  const daysLeft = Math.max(0, TRIAL_DAYS - elapsedDays);
  const phase = subscribed ? 'subscribed' : daysLeft > 0 ? 'trial' : 'expired';
  return {
    phase,
    daysLeft,
    can: (f) => ALWAYS_FREE.includes(f) || phase !== 'expired',
  };
}
