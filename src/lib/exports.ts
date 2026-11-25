import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { attributionFooter, attributionHtml } from './attribution';
import { certStatus, compliance, publicPassportUrl, Worker } from './passport';
import { TsEvent, KIND_LABEL, dayStats, eventsForDay } from './timesheet';
import { addDays, dateDMY, dayLabelLong, fmtDuration, timeHM } from './dates';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const CSS = `body{font-family:Helvetica,Arial,sans-serif;color:#13283B;padding:24px}h1{margin:0 0 4px}h2{margin:18px 0 6px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #D6DEE6;padding:6px 8px;text-align:left;font-size:13px}th{background:#EDF1F6}.muted{color:#5F7385}`;

async function sharePdf(html: string, dialogTitle: string) {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle });
  return uri;
}

export function passportShareText(w: Worker, code: string): string {
  return `${w.name || 'My'} Construction Passport\n${publicPassportUrl(code)}\n\n${attributionFooter()}`;
}

export async function exportPassportPdf(w: Worker, code: string | null) {
  const c = compliance(w);
  const rows = w.qualifications
    .map((q) => {
      const s = certStatus(q);
      return `<tr><td>${esc(q.name)}</td><td>${esc(q.issuer ?? '')}</td><td>${esc(s.label)}</td></tr>`;
    })
    .join('');
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>${esc(w.name || 'Construction Passport')}</h1>
<div class="muted">${esc(w.trade)} ${w.employer ? '· ' + esc(w.employer) : ''} · ${esc(w.id)}</div>
<h2>${esc(c.label)}</h2>
<table><tr><th>Qualification</th><th>Issuer</th><th>Status</th></tr>${rows}</table>
${code ? `<p class="muted">Live passport: ${esc(publicPassportUrl(code))}</p>` : ''}
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share passport PDF');
}

export type Range = { from: Date; to: Date; title: string };

export function rangeDays(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) out.push(new Date(d));
  return out;
}

function stampCell(e: TsEvent): string {
  return e.lat != null ? `${e.lat}, ${e.lng}` : '';
}

export async function exportTimesheetPdf(w: Worker, events: TsEvent[], r: Range) {
  const days = rangeDays(r.from, r.to);
  let total = 0;
  const rows = days
    .map((d) => {
      const de = eventsForDay(events, d);
      if (!de.length) return '';
      const st = dayStats(de);
      total += st.netMins;
      const loc = de.find((e) => e.lat != null);
      return `<tr><td>${esc(dayLabelLong(d))}</td><td>${st.start ? timeHM(st.start) : ''}</td><td>${st.finish ? timeHM(st.finish) : ''}</td><td>${fmtDuration(st.breakMins)}</td><td><b>${fmtDuration(st.netMins)}</b></td><td>${loc ? esc(stampCell(loc)) : ''}</td></tr>`;
    })
    .join('');
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>Timesheet — ${esc(w.name || 'Worker')}</h1>
<div class="muted">${esc(r.title)} · ${esc(w.employer)} · ${esc(w.id)}</div>
<h2>Total: ${fmtDuration(total)}</h2>
<table><tr><th>Day</th><th>Start</th><th>Finish</th><th>Breaks</th><th>Net worked</th><th>Location (GPS)</th></tr>${rows || '<tr><td colspan="6">No entries</td></tr>'}</table>
<p class="muted">Exported ${esc(new Date().toLocaleString('en-IE'))}. Times are recorded on the device; location is taken from GPS when the entry was made.</p>
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share timesheet PDF');
}

export async function exportTimesheetCsv(w: Worker, events: TsEvent[], r: Range) {
  const lines = [`Construction Passport timesheet,${w.name},${w.id}`, `Period,${r.title}`, '', 'Date,Time,Event,Note,Latitude,Longitude'];
  for (const d of rangeDays(r.from, r.to)) {
    for (const e of eventsForDay(events, d)) {
      const note = `"${(e.note ?? '').replace(/"/g, '""')}"`;
      lines.push(`${dateDMY(d)},${timeHM(new Date(e.at))},${KIND_LABEL[e.kind]},${note},${e.lat ?? ''},${e.lng ?? ''}`);
    }
  }
  lines.push('', ...attributionFooter().split('\n'));
  return lines.join('\n');
}
