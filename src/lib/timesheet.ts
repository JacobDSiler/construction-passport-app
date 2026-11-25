import { dayKey } from './dates';

export type EventKind = 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'note' | 'day_off';

export interface TsEvent {
  id: string;
  kind: EventKind;
  at: string; // ISO
  note?: string;
  site?: string;
  lat?: number;
  lng?: number;
  travel?: boolean;
  attachments?: string[];
  remoteId?: string | number;
}

export const TS_KEY = 'cp.timesheet.v1';

export const KIND_LABEL: Record<EventKind, string> = {
  clock_in: 'Clock in',
  clock_out: 'Clock out',
  break_start: 'On break',
  break_end: 'Back on',
  note: 'Note',
  day_off: 'Day off',
};

export const newId = () => `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const eventsForDay = (events: TsEvent[], d: Date) =>
  events.filter((e) => dayKey(new Date(e.at)) === dayKey(d)).sort((a, b) => a.at.localeCompare(b.at));

export type ClockState = 'out' | 'in' | 'break';

export function clockState(events: TsEvent[], d = new Date()): ClockState {
  const last = [...eventsForDay(events, d)].reverse().find((e) => ['clock_in', 'clock_out', 'break_start', 'break_end'].includes(e.kind));
  if (!last || last.kind === 'clock_out') return 'out';
  return last.kind === 'break_start' ? 'break' : 'in';
}

export interface DayStats {
  start?: Date;
  finish?: Date;
  breakMins: number;
  travelMins: number;
  netMins: number;
}

/** Start/finish, breaks and net worked for one day's events. An open day is counted up to `now`. */
export function dayStats(dayEvents: TsEvent[], now = new Date()): DayStats {
  const sorted = [...dayEvents].sort((a, b) => a.at.localeCompare(b.at));
  const ins = sorted.filter((e) => e.kind === 'clock_in');
  const outs = sorted.filter((e) => e.kind === 'clock_out');
  if (!ins.length) return { breakMins: 0, travelMins: 0, netMins: 0 };
  const start = new Date(ins[0].at);
  const finish = outs.length ? new Date(outs[outs.length - 1].at) : undefined;
  const end = finish ?? now;
  let breakMs = 0;
  let open: Date | null = null;
  for (const e of sorted) {
    if (e.kind === 'break_start') open = new Date(e.at);
    else if (e.kind === 'break_end' && open) {
      breakMs += new Date(e.at).getTime() - open.getTime();
      open = null;
    }
  }
  if (open && !finish) breakMs += now.getTime() - open.getTime();
  else if (open && finish) breakMs += finish.getTime() - open.getTime();
  const total = Math.max(0, end.getTime() - start.getTime());
  return { start, finish, breakMins: breakMs / 60000, travelMins: 0, netMins: Math.max(0, total - breakMs) / 60000 };
}
