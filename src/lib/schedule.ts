import { getItem, setItem } from './storage';
import { EventKind } from './timesheet';

export interface DaySchedule {
  on: boolean;
  start: string; // HH:MM
  end: string; // HH:MM
  breakMins: number;
}

/** Index 0 = Monday ... 6 = Sunday. */
export type WeekSchedule = DaySchedule[];

export const SCHEDULE_KEY = 'cp.schedule.v1';
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const defaultSchedule = (): WeekSchedule =>
  DAY_NAMES.map((_, i) => ({ on: i < 5, start: '08:00', end: '17:00', breakMins: 60 }));

export const validTime = (t: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim());

export async function loadSchedule(): Promise<WeekSchedule> {
  try {
    const raw = await getItem(SCHEDULE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length === 7) return p;
    }
  } catch {}
  return defaultSchedule();
}

export const saveSchedule = (s: WeekSchedule) => setItem(SCHEDULE_KEY, JSON.stringify(s));

const at = (day: Date, hm: string, plusMins = 0) => {
  const [h, m] = hm.trim().split(':').map(Number);
  const d = new Date(day);
  d.setHours(h, m + plusMins, 0, 0);
  return d;
};

/** Timesheet events for one day from its schedule row: in, optional midday break, out. */
export function eventsFromSchedule(day: Date, s: DaySchedule): { kind: EventKind; at: Date; note?: string }[] {
  const out: { kind: EventKind; at: Date; note?: string }[] = [];
  const start = at(day, s.start);
  const end = at(day, s.end);
  if (end <= start) return out;
  out.push({ kind: 'clock_in', at: start, note: 'From weekly schedule' });
  const totalMins = (end.getTime() - start.getTime()) / 60000;
  if (s.breakMins > 0 && s.breakMins < totalMins) {
    const bs = new Date(start.getTime() + ((totalMins - s.breakMins) / 2) * 60000);
    bs.setSeconds(0, 0);
    out.push({ kind: 'break_start', at: bs });
    out.push({ kind: 'break_end', at: new Date(bs.getTime() + s.breakMins * 60000) });
  }
  out.push({ kind: 'clock_out', at: end });
  return out;
}

/** JS getDay(): 0 = Sunday. Convert to Monday-first index. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
