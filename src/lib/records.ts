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
