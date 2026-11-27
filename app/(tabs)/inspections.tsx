import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { Attribution, Button, Card, Field, Pill, SectionLabel, Sheet } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { DEFAULT_CHECKS, Frequency, Inspection, InspectionItem, Vehicle, loadInspections, loadVehicles, newRecordId, saveInspections, saveVehicles } from '../../src/lib/records';
import { exportInspectionPdf } from '../../src/lib/exports';
import { getStamp } from '../../src/lib/photos';

const FREQ: Frequency[] = ['Daily', 'Weekly', 'Monthly'];

export default function InspectionsTab() {
  const { worker } = useStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [history, setHistory] = useState<Inspection[]>([]);
  const [name, setName] = useState('');
  const [reg, setReg] = useState('');
  const [freq, setFreq] = useState<Frequency>('Daily');
  const [running, setRunning] = useState<Vehicle | null>(null);
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    loadVehicles().then(setVehicles);
    loadInspections().then(setHistory);
  }, []);

  async function addVehicle() {
    const v: Vehicle = { id: newRecordId('veh'), name: name.trim(), reg: reg.trim(), frequency: freq };
    const next = [...vehicles, v];
    setVehicles(next);
    await saveVehicles(next);
    setName('');
    setReg('');
  }

  function start(v: Vehicle) {
    setPicker(false);
    setItems(DEFAULT_CHECKS.map((label) => ({ label, ok: true })));
    setRunning(v);
  }

  async function finish() {
    if (!running) return;
    const stamp = await getStamp();
    const insp: Inspection = {
      id: newRecordId('insp'),
      vehicleId: running.id,
      vehicleName: running.name,
      reg: running.reg,
      at: new Date().toISOString(),
      items,
      inspector: worker.name,
      stamp,
    };
    const hasDefects = items.some((i) => !i.ok);
    const nextH = [insp, ...history];
    const nextV = vehicles.map((v) => (v.id === running.id ? { ...v, lastCheck: insp.at, lastResult: hasDefects ? ('defects' as const) : ('ok' as const) } : v));
    setHistory(nextH);
    setVehicles(nextV);
    await saveInspections(nextH);
    await saveVehicles(nextV);
    setRunning(null);
    Alert.alert(hasDefects ? 'Defects recorded' : 'Inspection saved', hasDefects ? 'Do not use it until the defects are resolved. Export the defect report?' : 'No defects found.', [
      { text: 'Export PDF', onPress: () => exportInspectionPdf(insp).catch(() => {}) },
      { text: 'Done' },
    ]);
  }

  const due = (v: Vehicle) => {
    if (!v.lastCheck) return 'Not inspected';
    const days = (Date.now() - new Date(v.lastCheck).getTime()) / 86_400_000;
    const limit = v.frequency === 'Daily' ? 1 : v.frequency === 'Weekly' ? 7 : 30;
    return days > limit ? 'Inspection due' : v.lastResult === 'defects' ? 'Defects reported' : 'OK';
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.hero} onPress={() => (vehicles.length ? setPicker(true) : Alert.alert('Add a vehicle first', 'Add your van, digger or MEWP below, then run an inspection.'))}>
        <Text style={styles.heroTitle}>＋ New inspection</Text>
        <Text style={styles.heroSub}>Small plant · Commercial vehicle ≥3.5T — with defect report PDF</Text>
      </Pressable>
      <Pressable style={styles.hero2} onPress={() => Alert.alert('Coming next', 'Full site safety audits are next on the list.')}>
        <Text style={styles.hero2Title}>＋ New site audit</Text>
        <Text style={styles.hero2Sub}>Full site safety audit — scored, with findings, photos and PDF report</Text>
      </Pressable>

      <Card>
        <Text style={styles.h}>Add a vehicle or machine</Text>
        <Field label="" placeholder="e.g. Transit van, 3-tonne digger, MEWP" value={name} onChangeText={setName} />
        <Field label="" placeholder="Reg / plant no. (optional)" value={reg} onChangeText={setReg} />
        <Text style={styles.label}>Inspect it</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {FREQ.map((f) => (
            <Pressable key={f} style={[styles.chip, freq === f && styles.chipOn]} onPress={() => setFreq(f)}>
              <Text style={[styles.chipText, freq === f && { color: colors.white }]}>{f}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sub}>Adding it doesn&apos;t mark it safe — it starts as &quot;not inspected&quot; until you run an inspection.</Text>
        <Button label="Add" disabled={!name.trim()} onPress={addVehicle} />
      </Card>

      {vehicles.length === 0 ? (
        <Text style={styles.empty}>No vehicles or machines yet. Add your van, digger or MEWP above to run inspections.</Text>
      ) : (
        <>
          <SectionLabel>Your vehicles and machines</SectionLabel>
          {vehicles.map((v) => {
            const d = due(v);
            return (
              <Card key={v.id}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.h}>{v.name}</Text>
                    <Text style={styles.sub}>{[v.reg, v.frequency].filter(Boolean).join(' · ')}</Text>
                  </View>
                  <Pill text={d} tone={d === 'OK' ? 'ok' : d === 'Defects reported' ? 'bad' : 'warn'} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <Text style={styles.link} onPress={() => start(v)}>Inspect now</Text>
                  <Text style={[styles.link, { color: colors.danger }]} onPress={async () => { const n = vehicles.filter((x) => x.id !== v.id); setVehicles(n); await saveVehicles(n); }}>Remove</Text>
                </View>
              </Card>
            );
          })}
        </>
      )}

      {history.length ? (
        <>
          <SectionLabel>Past inspections</SectionLabel>
          {history.slice(0, 20).map((i) => (
            <Card key={i.id} style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h2}>{i.vehicleName}</Text>
                <Text style={styles.sub}>{new Date(i.at).toLocaleString('en-IE')} · {i.items.some((x) => !x.ok) ? `${i.items.filter((x) => !x.ok).length} defect(s)` : 'No defects'}</Text>
              </View>
              <Text style={styles.link} onPress={() => exportInspectionPdf(i).catch(() => {})}>PDF</Text>
            </Card>
          ))}
        </>
      ) : null}
      <Attribution />

      <Sheet visible={picker} title="Which one?" onClose={() => setPicker(false)}>
        {vehicles.map((v) => (
          <Pressable key={v.id} style={styles.pickRow} onPress={() => start(v)}>
            <Text style={styles.h2}>{v.name}</Text>
            <Text style={styles.sub}>{v.reg}</Text>
          </Pressable>
        ))}
      </Sheet>

      <Sheet visible={!!running} title={running ? `Inspect: ${running.name}` : ''} onClose={() => setRunning(null)}>
        <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
          {items.map((it, i) => (
            <View key={it.label} style={styles.check}>
              <Text style={styles.checkLabel}>{it.label}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable style={[styles.pass, it.ok && { backgroundColor: '#1F8A3C' }]} onPress={() => setItems(items.map((x, j) => (j === i ? { ...x, ok: true, note: undefined } : x)))}>
                  <Text style={[styles.passText, it.ok && { color: colors.white }]}>OK</Text>
                </Pressable>
                <Pressable style={[styles.pass, !it.ok && { backgroundColor: '#C62828' }]} onPress={() => setItems(items.map((x, j) => (j === i ? { ...x, ok: false } : x)))}>
                  <Text style={[styles.passText, !it.ok && { color: colors.white }]}>Defect</Text>
                </Pressable>
              </View>
              {!it.ok ? <Field label="" placeholder="Describe the defect" value={it.note ?? ''} onChangeText={(t) => setItems(items.map((x, j) => (j === i ? { ...x, note: t } : x)))} /> : null}
            </View>
          ))}
        </ScrollView>
        <Button label="Finish inspection" onPress={finish} />
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  hero: { backgroundColor: colors.navy, borderRadius: 18, padding: spacing.md, gap: 4 },
  heroTitle: { color: colors.white, fontSize: 24, fontWeight: '800' },
  heroSub: { color: '#DCE7F2', fontSize: 17 },
  hero2: { borderWidth: 2, borderColor: colors.navy, borderRadius: 18, padding: spacing.md, gap: 4, backgroundColor: colors.white },
  hero2Title: { color: colors.navy, fontSize: 24, fontWeight: '800' },
  hero2Sub: { color: '#5F7385', fontSize: 17 },
  h: { fontSize: 22, fontWeight: '800', color: colors.text },
  h2: { fontSize: 19, fontWeight: '800', color: colors.text },
  label: { fontSize: 15, fontWeight: '700', color: '#55677A' },
  sub: { fontSize: 16, color: '#5F7385', lineHeight: 23 },
  empty: { textAlign: 'center', fontSize: 18, color: '#5F7385', lineHeight: 26, paddingVertical: spacing.lg },
  chip: { flex: 1, borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.white },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 17, fontWeight: '700', color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  link: { fontSize: 17, fontWeight: '800', color: colors.navy },
  pickRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  check: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  checkLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  pass: { flex: 1, borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  passText: { fontSize: 17, fontWeight: '800', color: colors.text },
});
