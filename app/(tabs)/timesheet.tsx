import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Attribution, Button, Card, Field, Sheet } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { INDIVIDUAL_PRICE_EUR } from '../../src/lib/entitlements';
import { EventKind, KIND_LABEL, TsEvent, clockState, dayStats, eventsForDay } from '../../src/lib/timesheet';
import { addDays, dayLabel, dayLabelLong, fmtDuration, startOfDay, startOfWeek, timeHM } from '../../src/lib/dates';
import { Range, exportTimesheetCsv, exportTimesheetPdf } from '../../src/lib/exports';

type Scope = 'Day' | 'Week' | 'Month';

export default function TimesheetTab() {
  const { worker, events, addEvent, removeEvent, access } = useStore();
  const [noteFor, setNoteFor] = useState<EventKind | null>(null);
  const [note, setNote] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);

  const now = new Date();
  const state = clockState(events, now);
  const today = eventsForDay(events, now);
  const todayStats = dayStats(today, now);
  const weekStart = startOfWeek(now);
  const weekMins = useMemo(() => {
    let t = 0;
    for (let i = 0; i < 7; i++) t += dayStats(eventsForDay(events, addDays(weekStart, i)), now).netMins;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  if (access && !access.can('timesheets')) {
    return (
      <ScrollView contentContainerStyle={styles.body}>
        <Card>
          <Text style={styles.h}>Your 90-day free period has ended</Text>
          <Text style={styles.p}>
            Timesheets and the working tools are {INDIVIDUAL_PRICE_EUR.toFixed(2)} EUR a month, or free if your employer subscribes. Your Passport and sharing stay free, always.
          </Text>
        </Card>
        <Attribution />
      </ScrollView>
    );
  }

  const confirmNote = (kind: EventKind) => {
    setNote('');
    setNoteFor(kind);
  };
  const quick = async (kind: EventKind) => {
    if (kind === 'clock_in') return confirmNote(kind);
    await addEvent(kind);
  };

  const banner =
    state === 'in' ? 'On the clock' : state === 'break' ? 'On break' : 'Not clocked in';
  const bannerHelp = state === 'out' ? 'Tap Clock In when you start work.' : undefined;
  const bannerBg = state === 'in' ? '#1F8A3C' : state === 'break' ? '#E58A00' : colors.navy;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.clockRow}>
        <BigButton label="Clock In" emoji="🟢" color="#1F8A3C" disabled={state !== 'out'} onPress={() => quick('clock_in')} />
        <BigButton label={state === 'break' ? 'Back on' : 'Break'} emoji={state === 'break' ? '🟢' : '☕'} color="#F08C00" disabled={state === 'out'} onPress={() => quick(state === 'break' ? 'break_end' : 'break_start')} />
        <BigButton label="Clock Out" emoji="🔴" color="#C62828" disabled={state === 'out'} onPress={() => quick('clock_out')} />
      </View>

      <View style={[styles.banner, { backgroundColor: bannerBg }]}>
        <Text style={styles.bannerTitle}>{banner}</Text>
        {bannerHelp ? <Text style={styles.bannerSub}>{bannerHelp}</Text> : null}
        <Text style={styles.bannerRight}>Today: {fmtDuration(todayStats.netMins)}</Text>
      </View>

      <Pressable style={styles.dashed} onPress={() => setAddOpen(true)}>
        <Text style={styles.dashedText}>＋ Add or back-date an entry</Text>
      </Pressable>

      {today.length ? (
        <Card>
          <Text style={styles.sectionLabel}>Today</Text>
          {[...today].reverse().map((e) => (
            <EventRow key={e.id} e={e} onDelete={() => removeEvent(e.id)} />
          ))}
        </Card>
      ) : null}

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionLabel}>This week</Text>
          <Text style={styles.weekTotal}>{fmtDuration(weekMins)}</Text>
        </View>
        <Text style={styles.p}>{weekMins === 0 ? 'No hours yet this week. Tap Clock In to start.' : 'Tap Find a timesheet to see each day.'}</Text>
      </Card>

      <NavCard icon="🔎" title="Find a timesheet" body="Look up a day, week or month — see the hours, and export it." onPress={() => setFindOpen(true)} />
      <NavCard icon="🗓️" title="Record a day off" body="Holiday, sick, bank holiday, no work — logged to your timesheet and your employer." onPress={() => Alert.alert('Coming next', 'Day off is next on the list.')} />
      <NavCard icon="🧾" title="Expenses" body="Snap a receipt — submit to your employer, or keep it personal with its own export." onPress={() => Alert.alert('Coming next', 'Expenses are next on the list.')} />
      <NavCard icon="📋" title="Job sheet" body="Fill in the day's job sheet and export it as a PDF." onPress={() => Alert.alert('Coming next', 'Job sheets are next on the list.')} />

      <Button
        label="📥 Export today…"
        onPress={() => exportRange({ from: startOfDay(now), to: startOfDay(now), title: dayLabelLong(now) })}
      />
      <Button
        label="📄 Export this week (PDF)"
        variant="ghost"
        onPress={() => exportPdf({ from: weekStart, to: addDays(weekStart, 6), title: `Week of ${dayLabelLong(weekStart)}` })}
      />
      <Text style={styles.foot}>Your hours flow to your employer automatically once your passport is shared with them.</Text>
      <Attribution />

      {/* Note when clocking in */}
      <Sheet visible={noteFor !== null} title="Clock in — add a note (optional)" onClose={() => setNoteFor(null)}>
        <Field label="Note" placeholder="e.g. On site, foggy start — Bridge 78" value={note} onChangeText={setNote} multiline />
        <View style={styles.sheetBtns}>
          <Text style={styles.cancel} onPress={() => setNoteFor(null)}>Cancel</Text>
          <Button
            label="Save"
            onPress={async () => {
              const k = noteFor!;
              setNoteFor(null);
              await addEvent(k, { note });
            }}
          />
        </View>
      </Sheet>

      <AddEntrySheet visible={addOpen} onClose={() => setAddOpen(false)} onAdd={(k, at, n) => addEvent(k, { at, note: n })} />
      <FindSheet visible={findOpen} onClose={() => setFindOpen(false)} events={events} onDelete={removeEvent} onExport={exportRange} />
    </ScrollView>
  );

  function exportRange(r: Range) {
    Alert.alert('Export', r.title, [
      { text: 'PDF (save, email or send)', onPress: () => exportPdf(r) },
      { text: 'Spreadsheet (CSV)', onPress: () => exportCsv(r) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }
  async function exportPdf(r: Range) {
    try {
      await exportTimesheetPdf(worker, events, r);
    } catch (e) {
      Alert.alert('Export failed', String((e as Error).message ?? e));
    }
  }
  async function exportCsv(r: Range) {
    await Share.share({ title: 'Timesheet', message: await exportTimesheetCsv(worker, events, r) });
  }

}
function FindSheet({ visible, onClose, events, onDelete, onExport }: { visible: boolean; onClose: () => void; events: TsEvent[]; onDelete: (id: string) => void; onExport: (r: Range) => void }) {
  const [scope, setScope] = useState<Scope>('Day');
  const [anchor, setAnchor] = useState(startOfDay(new Date()));
  const range = rangeFor(scope, anchor);
  const days: Date[] = [];
  for (let d = new Date(range.from); d <= range.to; d = addDays(d, 1)) days.push(new Date(d));
  let total = 0;
  const rows = days
    .map((d) => ({ d, ev: eventsForDay(events, d) }))
    .filter((r) => r.ev.length)
    .map((r) => {
      const st = dayStats(r.ev);
      total += st.netMins;
      return { ...r, st };
    });
  const step = scope === 'Day' ? 1 : scope === 'Week' ? 7 : 30;
  return (
    <Sheet visible={visible} title="Find a timesheet" onClose={onClose}>
      <View style={styles.tabs}>
        {(['Day', 'Week', 'Month'] as Scope[]).map((s) => (
          <Pressable key={s} style={[styles.tab, scope === s && styles.tabOn]} onPress={() => setScope(s)}>
            <Text style={[styles.tabText, scope === s && { color: colors.navy }]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.nav}>
        <Text style={styles.arrow} onPress={() => setAnchor(addDays(anchor, -step))}>◀</Text>
        <Text style={styles.navTitle}>{range.title}</Text>
        <Text style={styles.arrow} onPress={() => setAnchor(addDays(anchor, step))}>▶</Text>
      </View>
      <ScrollView style={{ maxHeight: 340 }}>
        {rows.length === 0 ? <Text style={styles.p}>No entries for this period.</Text> : null}
        {rows.map(({ d, ev, st }) => (
          <View key={d.toISOString()} style={{ marginBottom: 10 }}>
            {scope !== 'Day' ? <Text style={styles.dayHead}>{dayLabel(d)} · {fmtDuration(st.netMins)}</Text> : null}
            {scope === 'Day' ? ev.map((e) => <EventRow key={e.id} e={e} onDelete={() => onDelete(e.id)} />) : null}
            {scope === 'Day' ? (
              <View style={{ gap: 6, marginTop: 8 }}>
                <StatRow k="Start" v={st.start ? timeHM(st.start) : '—'} />
                <StatRow k="Finish" v={st.finish ? timeHM(st.finish) : '—'} />
                <StatRow k="Breaks" v={`– ${fmtDuration(st.breakMins)}`} />
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <StatRow k="Net worked" v={fmtDuration(total)} bold />
      <Button label="📥 Export this period…" onPress={() => onExport(range)} />
    </Sheet>
  );
}

function rangeFor(scope: Scope, anchor: Date): Range {
  if (scope === 'Day') return { from: anchor, to: anchor, title: dayLabelLong(anchor) };
  if (scope === 'Week') {
    const s = startOfWeek(anchor);
    return { from: s, to: addDays(s, 6), title: `${dayLabel(s)} – ${dayLabel(addDays(s, 6))}` };
  }
  const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { from: s, to: e, title: s.toLocaleString('en-IE', { month: 'long', year: 'numeric' }) };
}

function StatRow({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View style={styles.rowBetween}>
      <Text style={[styles.statK, bold && { color: colors.navy, fontWeight: '800' }]}>{k}</Text>
      <Text style={[styles.statV, bold && { color: colors.navy, fontSize: 24 }]}>{v}</Text>
    </View>
  );
}

function EventRow({ e, onDelete }: { e: { at: string; kind: EventKind; note?: string; lat?: number }; onDelete: () => void }) {
  return (
    <View style={styles.event}>
      <Text style={styles.evTime}>{timeHM(new Date(e.at))}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.evKind}>{KIND_LABEL[e.kind]}</Text>
        {e.note ? <Text style={styles.evNote}>{e.note}</Text> : null}
        {e.lat != null ? <Text style={styles.evNote}>📍 location stamped</Text> : null}
      </View>
      <Text style={styles.evDel} onPress={onDelete}>✕</Text>
    </View>
  );
}

function BigButton({ label, emoji, color, disabled, onPress }: { label: string; emoji: string; color: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.big, { backgroundColor: color, opacity: disabled ? 0.4 : 1 }]} disabled={disabled} onPress={onPress}>
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
      <Text style={styles.bigText}>{label}</Text>
    </Pressable>
  );
}

function NavCard({ icon, title, body, onPress }: { icon: string; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.nav2}>
        <Text style={{ fontSize: 34 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.h}>{title}</Text>
          <Text style={styles.p}>{body}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Card>
    </Pressable>
  );
}

const KINDS: EventKind[] = ['note', 'clock_in', 'break_start', 'break_end', 'clock_out'];

function AddEntrySheet({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (k: EventKind, at: Date, note: string) => void }) {
  const [day, setDay] = useState(startOfDay(new Date()));
  const [time, setTime] = useState(timeHM(new Date()));
  const [kind, setKind] = useState<EventKind>('note');
  const [note, setNote] = useState('');
  const valid = /^([01]?\d|2[0-3]):[0-5]\d$/.test(time.trim());
  return (
    <Sheet visible={visible} title="Add an entry" onClose={onClose}>
      <Text style={styles.fieldLabel}>Day</Text>
      <View style={styles.nav}>
        <Text style={styles.arrow} onPress={() => setDay(addDays(day, -1))}>◀</Text>
        <Text style={styles.navTitle}>{dayLabel(day)}</Text>
        <Text style={styles.arrow} onPress={() => setDay(addDays(day, 1))}>▶</Text>
      </View>
      <Field label="Time (24h)" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" />
      <Text style={styles.fieldLabel}>What happened?</Text>
      <View style={styles.chips}>
        {KINDS.map((k) => (
          <Pressable key={k} style={[styles.chip, kind === k && styles.chipOn]} onPress={() => setKind(k)}>
            <Text style={[styles.chipText, kind === k && { color: colors.white }]}>{KIND_LABEL[k]}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="Note" placeholder="e.g. Arrive on site — Bridge 78-06.00" value={note} onChangeText={setNote} multiline />
      <View style={styles.sheetBtns}>
        <Text style={styles.cancel} onPress={onClose}>Cancel</Text>
        <Button
          label="Add entry"
          disabled={!valid}
          onPress={() => {
            const [h, m] = time.trim().split(':').map(Number);
            const at = new Date(day);
            at.setHours(h, m, 0, 0);
            onAdd(kind, at, note);
            setNote('');
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 22, fontWeight: '800', color: colors.text },
  p: { fontSize: 17, color: '#5F7385', lineHeight: 24 },
  clockRow: { flexDirection: 'row', gap: spacing.sm },
  big: { flex: 1, borderRadius: 20, paddingVertical: 22, alignItems: 'center', gap: 6 },
  bigText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  banner: { borderRadius: 18, padding: spacing.md, gap: 4 },
  bannerTitle: { color: colors.white, fontSize: 26, fontWeight: '800' },
  bannerSub: { color: '#DCE7F2', fontSize: 18 },
  bannerRight: { color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'right', marginTop: 4 },
  dashed: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.navy, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  dashedText: { color: colors.navy, fontSize: 19, fontWeight: '800' },
  sectionLabel: { fontSize: 16, fontWeight: '800', letterSpacing: 1, color: '#55677A', textTransform: 'uppercase' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTotal: { fontSize: 30, fontWeight: '800', color: colors.navy },
  event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  evTime: { fontSize: 24, fontWeight: '800', color: colors.text, width: 76 },
  evKind: { fontSize: 20, color: colors.text, fontWeight: '600' },
  evNote: { fontSize: 14, color: '#5F7385' },
  evDel: { fontSize: 24, color: '#5F7385', paddingHorizontal: 8 },
  nav2: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chev: { fontSize: 30, color: '#5F7385' },
  foot: { textAlign: 'center', color: '#5F7385', fontSize: 16, lineHeight: 23 },
  sheetBtns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  cancel: { fontSize: 18, fontWeight: '700', color: '#5F7385' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#55677A' },
  tabs: { flexDirection: 'row', backgroundColor: '#EDF1F6', borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 11 },
  tabOn: { backgroundColor: colors.white },
  tabText: { fontSize: 18, fontWeight: '700', color: '#5F7385' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  arrow: { fontSize: 22, color: colors.navy, paddingHorizontal: 8 },
  navTitle: { fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center', flexShrink: 1 },
  dayHead: { fontSize: 17, fontWeight: '800', color: colors.navy },
  statK: { fontSize: 18, color: '#5F7385' },
  statV: { fontSize: 18, fontWeight: '800', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 17, fontWeight: '700', color: colors.text },
});
