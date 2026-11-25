import { loadJson, saveJson } from './storage';
import { Stamp } from './photos';

// ---- Hazard observations --------------------------------------------------------------------
export type HazardCategory = 'safe' | 'unsafe_condition' | 'unsafe_act' | 'suggestion';
export const HAZARD_LABEL: Record<HazardCategory, string> = {
  safe: 'Safe Act',
  unsafe_condition: 'Unsafe Condition',
  unsafe_act: 'Unsafe Act',
  suggestion: 'Suggestion',
};

export interface HazardReport {
  id: string;
  ref: string; // CP-HOR-2026-0001
  createdAt: string;
  category: HazardCategory;
  toolbox: boolean;
  photoUri?: string;
  stamp?: Stamp;
  observation: string;
  client: string;
  project: string;
  supervisor: string;
  location: string;
  observer: string;
  anonymous: boolean;
  department: string;
  stoppedBy?: 'Co-worker' | 'Supervisor' | 'Other';
  immediateAction: string;
  furtherAction: string;
}

export const HAZARDS_KEY = 'cp.hazards.v1';
export const loadHazards = () => loadJson<HazardReport[]>(HAZARDS_KEY, []);
export const saveHazards = (h: HazardReport[]) => saveJson(HAZARDS_KEY, h);
export function nextHazardRef(existing: HazardReport[], now = new Date()): string {
  const y = now.getFullYear();
  const n = existing.filter((h) => h.ref.startsWith(`CP-HOR-${y}-`)).length + 1;
  return `CP-HOR-${y}-${String(n).padStart(4, '0')}`;
}

// ---- Job sheets -----------------------------------------------------------------------------
export interface JobSheet {
  id: string;
  date: string; // ISO
  jobRef: string;
  client: string;
  site: string;
  operatives: string[];
  plant: string[];
  description: string;
  materials: string;
  photos: string[];
  hours: number;
  minutes: number;
  notes: string;
  signedBy: string;
}
export const JOBSHEETS_KEY = 'cp.jobsheets.v1';
export const loadJobSheets = () => loadJson<JobSheet[]>(JOBSHEETS_KEY, []);
export const saveJobSheets = (j: JobSheet[]) => saveJson(JOBSHEETS_KEY, j);

// ---- Expenses -------------------------------------------------------------------------------
export const EXPENSE_CATEGORIES = ['Fuel', 'Materials', 'Tools', 'Food', 'Travel', 'Accommodation', 'Other'] as const;
export interface Expense {
  id: string;
  spentOn: string; // ISO
  merchant: string;
  amount: number; // EUR
  category: string;
  note: string;
  receiptUri?: string;
  stamp?: Stamp;
  submitted: boolean; // sent to employer
}
export const EXPENSES_KEY = 'cp.expenses.v1';
export const loadExpenses = () => loadJson<Expense[]>(EXPENSES_KEY, []);
export const saveExpenses = (e: Expense[]) => saveJson(EXPENSES_KEY, e);

export const newRecordId = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// ---- Vehicle / machine inspections ----------------------------------------------------------
export type Frequency = 'Daily' | 'Weekly' | 'Monthly';
export interface Vehicle {
  id: string;
  name: string;
  reg: string;
  frequency: Frequency;
  lastCheck?: string;
  lastResult?: 'ok' | 'defects';
}
export interface InspectionItem {
  label: string;
  ok: boolean;
  note?: string;
}
export interface Inspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  reg: string;
  at: string;
  items: InspectionItem[];
  inspector: string;
  stamp?: Stamp;
}
export const DEFAULT_CHECKS = ['Tyres and wheels', 'Lights and indicators', 'Brakes', 'Oil and fluids', 'Mirrors and windows', 'Horn and warning devices', 'Seat belts / restraints', 'Fire extinguisher / first aid', 'Damage check', 'Load secure / safe to use'];
export const VEHICLES_KEY = 'cp.vehicles.v1';
export const INSPECTIONS_KEY = 'cp.inspections.v1';
export const loadVehicles = () => loadJson<Vehicle[]>(VEHICLES_KEY, []);
export const saveVehicles = (v: Vehicle[]) => saveJson(VEHICLES_KEY, v);
export const loadInspections = () => loadJson<Inspection[]>(INSPECTIONS_KEY, []);
export const saveInspections = (v: Inspection[]) => saveJson(INSPECTIONS_KEY, v);

// ---- Crews and check-ins --------------------------------------------------------------------
export interface Crew {
  code: string;
  active: boolean;
  status: 'requested' | 'joined';
}
export const CREWS_KEY = 'cp.crew.v1';
export const loadCrews = () => loadJson<Crew[]>(CREWS_KEY, []);
export const saveCrews = (c: Crew[]) => saveJson(CREWS_KEY, c);

export interface CheckIn {
  id: string;
  at: string;
  mood: 'good' | 'ok' | 'rough';
  note: string;
}
export const CHECKIN_KEY = 'cp.checkin.v1';
export const loadCheckIns = () => loadJson<CheckIn[]>(CHECKIN_KEY, []);
export const saveCheckIns = (c: CheckIn[]) => saveJson(CHECKIN_KEY, c);

// ---- Site diary (local to this device; no backend RPC in BACKEND_CONTRACT.md yet) ---------------
export interface SiteDiaryEntry {
  id: string;
  date: string; // ISO day
  site: string;
  weather: string;
  workersOnSite: number;
  workDone: string;
  visitors: string;
  incidents: string;
  notes: string;
  author: string;
}
export const SITE_DIARY_KEY = 'cp.sitediary.v1';
export const loadSiteDiary = () => loadJson<SiteDiaryEntry[]>(SITE_DIARY_KEY, []);
export const saveSiteDiary = (d: SiteDiaryEntry[]) => saveJson(SITE_DIARY_KEY, d);

// ---- Site audit (local to this device; no backend RPC in BACKEND_CONTRACT.md yet) --------------
// A general starting checklist. It is not a statutory checklist; the user can read it before relying on it.
export const AUDIT_CHECKS: { section: string; label: string }[] = [
  { section: 'Housekeeping', label: 'Walkways and work areas clear of waste and trip hazards' },
  { section: 'Housekeeping', label: 'Materials stored stable and away from edges' },
  { section: 'PPE', label: 'Everyone on site wearing the PPE the task needs' },
  { section: 'Access', label: 'Ladders and scaffolds inspected and in good order' },
  { section: 'Access', label: 'Edges, openings and voids guarded or covered' },
  { section: 'Access', label: 'Safe routes in and out, and emergency exits clear' },
  { section: 'Plant and electrics', label: 'Plant and tools in good condition with guards in place' },
  { section: 'Plant and electrics', label: 'Electrical leads, cables and RCDs in good condition' },
  { section: 'Fire and emergency', label: 'Extinguishers and fire points accessible and in date' },
  { section: 'Fire and emergency', label: 'First aid kit stocked and person named' },
  { section: 'Welfare', label: 'Welfare facilities clean and available' },
  { section: 'Signage', label: 'Site rules, emergency contacts and signage displayed' },
];
export interface AuditItem {
  section: string;
  label: string;
  result: 'pass' | 'fail' | 'na';
  note: string;
}
export interface SiteAudit {
  id: string;
  at: string;
  site: string;
  inspector: string;
  items: AuditItem[];
  score: number; // percent of applicable items passed
}
export const SITE_AUDIT_KEY = 'cp.siteaudit.v1';
export const loadSiteAudits = () => loadJson<SiteAudit[]>(SITE_AUDIT_KEY, []);
export const saveSiteAudits = (a: SiteAudit[]) => saveJson(SITE_AUDIT_KEY, a);
export function auditScore(items: AuditItem[]): number {
  const applicable = items.filter((i) => i.result !== 'na');
  if (!applicable.length) return 0;
  return Math.round((applicable.filter((i) => i.result === 'pass').length / applicable.length) * 100);
}
