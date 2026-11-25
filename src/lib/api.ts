import { supabase } from './supabase';
import { getOwnerToken } from './owner';

/** Thin wrapper over supabase.rpc with one error shape. Argument names match the live database. */
export async function rpc<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error('Backend not configured (missing EXPO_PUBLIC_SUPABASE_* values).');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return data as T;
}

const up = (s: string) => s.trim().toUpperCase();

// ---- Passport -------------------------------------------------------------------------------
export async function publishPassport(data: unknown) {
  return rpc('publish_passport', { p_owner_token: await getOwnerToken(), p_data: data });
}
export async function deleteTimesheetEvent(id: string | number) {
  return rpc('delete_timesheet_event', { p_owner_token: await getOwnerToken(), p_id: id });
}
export const getPassport = (code: string) => rpc('get_passport', { p_code: code });
export async function claimPassport() {
  return rpc('claim_passport', { p_owner_token: await getOwnerToken() });
}
export const getVerifications = (code: string) => rpc('get_verifications', { p_code: code });

// ---- Timesheets -----------------------------------------------------------------------------
export interface TimesheetEventInput {
  shortCode: string;
  kind: string;
  at: string; // ISO timestamp
  site?: string | null;
  employer?: string | null;
  note?: string | null;
  orgCode?: string | null;
}
export async function addTimesheetEvent(e: TimesheetEventInput) {
  return rpc('add_timesheet_event', {
    p_owner_token: await getOwnerToken(),
    p_short_code: e.shortCode,
    p_kind: e.kind,
    p_at: e.at,
    p_site: e.site ?? null,
    p_employer: e.employer ?? null,
    p_note: e.note ?? null,
    p_org_code: e.orgCode ?? null,
  });
}
export const getTimesheet = (shortCode: string, from: string, to: string, orgCode: string) =>
  rpc('get_timesheet', { p_short_code: up(shortCode), p_from: from, p_to: to, p_org_code: up(orgCode) });

// ---- Companies and crew ---------------------------------------------------------------------
export const listCrew = (orgCode: string) => rpc('list_crew', { p_org_code: up(orgCode) });
export const listSites = (orgCode: string) => rpc('list_sites', { p_org_code: up(orgCode) });
export const requestJoin = (orgCode: string, shortCode: string, name?: string | null) =>
  rpc('request_join', { p_org_code: up(orgCode), p_short_code: up(shortCode), p_name: name ?? null, p_type: null, p_assignment: null });

export async function setUploadConsent(allow: boolean) {
  return rpc('set_employer_upload_consent', { p_owner_token: await getOwnerToken(), p_allow: allow });
}

export async function claimWorker(code: string) {
  return rpc<{ orgCode?: string | null; name?: string | null; trade?: string | null; certs?: Array<Record<string, unknown>>; workerType?: string; assignment?: string } | null>(
    'claim_worker',
    { p_claim_code: up(code) },
  );
}
export async function setSuggestionConsent(allow: boolean) {
  return rpc('set_suggestion_consent', { p_owner_token: await getOwnerToken(), p_allow: allow });
}

// ---- Company setup --------------------------------------------------------------------------
export async function createCompany(setupToken: string, name: string, trade?: string | null) {
  return rpc<unknown>('create_company', { p_setup_token: setupToken, p_name: name.trim(), p_trade: trade ?? null });
}
export const peekCompany = (claimCode: string) => rpc<unknown>('peek_company', { p_claim_code: up(claimCode) });
export async function claimCompany(claimCode: string) {
  return rpc<unknown>('claim_company', { p_claim_code: up(claimCode), p_owner_token: await getOwnerToken() });
}
export async function listCourses() {
  return rpc<unknown[]>('list_courses', { p_owner_token: await getOwnerToken() });
}
/** The RPCs return either a bare code string or an object; pull the org code out either way. */
export function extractOrgCode(r: unknown): string | null {
  if (typeof r === 'string') return r;
  if (r && typeof r === 'object') {
    const o = r as Record<string, unknown>;
    for (const k of ['org_code', 'orgCode', 'code']) if (typeof o[k] === 'string') return o[k] as string;
    if (Array.isArray(r) && r[0]) return extractOrgCode(r[0]);
  }
  return null;
}
export function extractName(r: unknown): string | null {
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    const o = r as Record<string, unknown>;
    for (const k of ['name', 'org_name', 'orgName']) if (typeof o[k] === 'string') return o[k] as string;
  }
  return null;
}
