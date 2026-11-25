import { getItem, loadJson, saveJson, setItem } from './storage';
import { publishPassport } from './api';
import { Stamp, uploadCertPhoto } from './photos';

export type Verification = 'self' | 'pending' | 'verified';

export interface Qualification {
  id: string;
  name: string;
  issuer?: string;
  issued?: string; // ISO date
  expires?: string; // ISO date, absent = no expiry on record
  verification?: Verification;
  imageUri?: string;
  imageBackUri?: string;
  addedByEmployer?: boolean;
  stamps?: { front?: Stamp; back?: Stamp }; // date and GPS stamp for each photo
}

export interface Worker {
  id: string; // CP-123456
  name: string;
  trade: string;
  phone: string;
  email: string;
  employer: string;
  photoUri?: string;
  qualifications: Qualification[];
  // Kept for compatibility with the original data shape; filled in by later screens.
  inductions: unknown[];
  vehicles: unknown[];
  plant: unknown[];
  hazards: unknown[];
}

export const WORKER_KEY = 'cp.worker.v1';
export const SHORT_CODE_KEY = 'cp.shortCode.v1';

export function blankWorker(): Worker {
  return {
    id: `CP-${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    trade: '',
    phone: '',
    email: '',
    employer: '',
    qualifications: [],
    inductions: [],
    vehicles: [],
    plant: [],
    hazards: [],
  };
}

export const loadWorker = async (): Promise<Worker> => ({ ...blankWorker(), ...(await loadJson<Partial<Worker>>(WORKER_KEY, blankWorker())) });
export const saveWorker = (w: Worker) => saveJson(WORKER_KEY, w);
export const getShortCode = () => getItem(SHORT_CODE_KEY);

export type CertStatus = 'valid' | 'expiring' | 'expired' | 'none';
export const EXPIRING_SOON_DAYS = 60;

export function certStatus(q: Qualification, now = new Date()): { status: CertStatus; label: string } {
  if (!q.expires) return { status: 'none', label: 'No expiry' };
  const exp = new Date(q.expires);
  const days = Math.floor((exp.getTime() - now.getTime()) / 86_400_000);
  const when = exp.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
  if (days < 0) return { status: 'expired', label: `Expired ${when}` };
  if (days <= EXPIRING_SOON_DAYS) return { status: 'expiring', label: `Expires ${when}` };
  return { status: 'valid', label: `Valid to ${when}` };
}

export function compliance(w: Worker): { label: string; tone: 'ok' | 'warn' | 'bad'; valid: number; expiring: number; expired: number } {
  let valid = 0;
  let expiring = 0;
  let expired = 0;
  for (const q of w.qualifications) {
    const s = certStatus(q).status;
    if (s === 'expired') expired++;
    else if (s === 'expiring') expiring++;
    else valid++;
  }
  if (expired > 0) return { label: 'Action needed', tone: 'bad', valid, expiring, expired };
  if (expiring > 0) return { label: 'Expiring soon', tone: 'warn', valid, expiring, expired };
  return { label: 'Fully Compliant', tone: 'ok', valid, expiring, expired };
}

/** Uploads any local cert photos, then publishes the passport. Returns the share code and the worker with public image URLs. */
export async function publishWorker(w: Worker): Promise<{ code: string; worker: Worker }> {
  const quals: Qualification[] = [];
  for (const q of w.qualifications) {
    const front = await uploadCertPhoto(q.imageUri, `${q.id}-front`);
    const back = await uploadCertPhoto(q.imageBackUri, `${q.id}-back`);
    quals.push({ ...q, imageUri: front ?? q.imageUri, imageBackUri: back ?? q.imageBackUri });
  }
  const worker: Worker = { ...w, qualifications: quals };
  const code = String(await publishPassport(worker));
  await setItem(SHORT_CODE_KEY, code);
  return { code, worker };
}

export const publicPassportUrl = (code: string) => `https://construction-passport.netlify.app/?p=${code}`;
