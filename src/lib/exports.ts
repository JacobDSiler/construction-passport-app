import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { attributionFooter, attributionHtml } from './attribution';
import { certStatus, compliance, publicPassportUrl, Worker } from './passport';
import { TsEvent, KIND_LABEL, dayStats, eventsForDay } from './timesheet';
import { addDays, dateDMY, dayLabelLong, fmtDuration, timeHM } from './dates';
import { Expense, HazardReport, HAZARD_LABEL, Inspection, JobSheet } from './records';

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

const stampLine = (st?: { at: string; lat?: number; lng?: number }) =>
  st ? `${esc(new Date(st.at).toLocaleString('en-IE'))}${st.lat != null ? ` &middot; GPS ${st.lat}, ${st.lng}` : ''}` : '';

export async function exportHazardPdf(h: HazardReport) {
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>Hazard Observation</h1>
<div class="muted">${esc(h.ref)} · ${esc(new Date(h.createdAt).toLocaleString('en-IE'))}</div>
<h2>${esc(HAZARD_LABEL[h.category])}${h.toolbox ? ' · Flagged for toolbox talk' : ''}</h2>
<table>
<tr><th>Observation</th><td>${esc(h.observation)}</td></tr>
<tr><th>Client</th><td>${esc(h.client)}</td></tr><tr><th>Project</th><td>${esc(h.project)}</td></tr>
<tr><th>Supervisor</th><td>${esc(h.supervisor)}</td></tr><tr><th>Location / site</th><td>${esc(h.location)}</td></tr>
<tr><th>Observer</th><td>${h.anonymous ? 'Anonymous' : esc(h.observer)}</td></tr>
<tr><th>Department</th><td>${esc(h.department)}</td></tr><tr><th>Task stopped by</th><td>${esc(h.stoppedBy ?? '')}</td></tr>
<tr><th>Immediate action taken</th><td>${esc(h.immediateAction)}</td></tr><tr><th>Further action required</th><td>${esc(h.furtherAction)}</td></tr>
${h.stamp ? `<tr><th>Date / GPS stamp</th><td>${stampLine(h.stamp)}</td></tr>` : ''}
</table>
${h.photoUri ? `<p><img src="${esc(h.photoUri)}" style="max-width:100%;max-height:420px"/></p>` : ''}
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share hazard report');
}

export async function exportJobSheetPdf(j: JobSheet, w: Worker) {
  const list = (a: string[]) => (a.length ? a.map(esc).join(', ') : '—');
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>Job Sheet</h1>
<div class="muted">${esc(dayLabelLong(new Date(j.date)))} · ${esc(w.employer)}</div>
<table>
<tr><th>Job / ref no.</th><td>${esc(j.jobRef)}</td></tr><tr><th>Client</th><td>${esc(j.client)}</td></tr>
<tr><th>Site / location</th><td>${esc(j.site)}</td></tr><tr><th>Operatives</th><td>${list(j.operatives)}</td></tr>
<tr><th>Plant / equipment</th><td>${list(j.plant)}</td></tr><tr><th>Description of works</th><td>${esc(j.description)}</td></tr>
<tr><th>Materials</th><td>${esc(j.materials)}</td></tr><tr><th>Time taken</th><td>${j.hours}h ${j.minutes}min</td></tr>
<tr><th>Notes</th><td>${esc(j.notes)}</td></tr><tr><th>Signed by</th><td>${esc(j.signedBy)}</td></tr>
</table>
${j.photos.map((p) => `<img src="${esc(p)}" style="max-width:48%;margin:4px"/>`).join('')}
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share job sheet');
}

export async function exportExpensesPdf(items: Expense[], w: Worker, title: string) {
  const total = items.reduce((t, e) => t + e.amount, 0);
  const rows = items
    .map((e) => `<tr><td>${esc(dateDMY(new Date(e.spentOn)))}</td><td>${esc(e.merchant)}</td><td>${esc(e.category)}</td><td>${esc(e.note)}</td><td style="text-align:right">&euro;${e.amount.toFixed(2)}</td></tr>`)
    .join('');
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>Expenses — ${esc(w.name || 'Worker')}</h1>
<div class="muted">${esc(title)} · ${esc(w.employer)} · ${esc(w.id)}</div>
<h2>Total: &euro;${total.toFixed(2)}</h2>
<table><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Note</th><th>Amount</th></tr>${rows || '<tr><td colspan="5">No expenses</td></tr>'}</table>
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share expenses');
}

export async function exportInspectionPdf(i: Inspection) {
  const defects = i.items.filter((x) => !x.ok);
  const rows = i.items
    .map((x) => `<tr><td>${esc(x.label)}</td><td>${x.ok ? 'OK' : '<b style="color:#C62828">DEFECT</b>'}</td><td>${esc(x.note ?? '')}</td></tr>`)
    .join('');
  const html = `<html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<h1>${defects.length ? 'Defect Report' : 'Inspection Report'}</h1>
<div class="muted">${esc(i.vehicleName)}${i.reg ? ' · ' + esc(i.reg) : ''} · ${esc(new Date(i.at).toLocaleString('en-IE'))}</div>
<h2>${defects.length ? `${defects.length} defect${defects.length > 1 ? 's' : ''} found — do not use until resolved` : 'No defects found'}</h2>
<table><tr><th>Check</th><th>Result</th><th>Note</th></tr>${rows}</table>
<p>Inspector: ${esc(i.inspector)}</p>
${i.stamp ? `<p class="muted">Date / GPS stamp: ${stampLine(i.stamp)}</p>` : ''}
${attributionHtml()}</body></html>`;
  return sharePdf(html, 'Share inspection');
}
