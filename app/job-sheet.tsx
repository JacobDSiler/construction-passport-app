import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { Attribution, Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { JobSheet, loadJobSheets, newRecordId, saveJobSheets } from '../src/lib/records';
import { pickPhoto } from '../src/lib/pick';
import { exportJobSheetPdf } from '../src/lib/exports';
import { addDays, dayLabelLong, startOfDay } from '../src/lib/dates';

export default function JobSheetScreen() {
  const { worker } = useStore();
  const [saved, setSaved] = useState<JobSheet[]>([]);
  const [date, setDate] = useState(startOfDay(new Date()));
  const [f, setF] = useState({ jobRef: '', client: '', site: '', description: '', materials: '', notes: '' });
  const [ops, setOps] = useState<string[]>(['']);
  const [plant, setPlant] = useState<string[]>(['']);
  const [photos, setPhotos] = useState<string[]>([]);
  const [h, setH] = useState('0');
  const [m, setM] = useState('0');
  const [signed, setSigned] = useState(worker.name);

  useEffect(() => {
    loadJobSheets().then(setSaved);
  }, []);
  useEffect(() => {
    if (!signed && worker.name) setSigned(worker.name);
  }, [worker.name, signed]);

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const setAt = (arr: string[], setArr: (a: string[]) => void, i: number, v: string) => setArr(arr.map((x, j) => (j === i ? v : x)));

  async function saveAndExport() {
    const sheet: JobSheet = {
      id: newRecordId('job'),
      date: date.toISOString(),
      ...f,
      operatives: ops.map((o) => o.trim()).filter(Boolean),
      plant: plant.map((o) => o.trim()).filter(Boolean),
      photos,
      hours: parseInt(h, 10) || 0,
      minutes: parseInt(m, 10) || 0,
      signedBy: signed,
    };
    const next = [sheet, ...saved];
    setSaved(next);
    await saveJobSheets(next);
    exportJobSheetPdf(sheet, worker).catch((e) => Alert.alert('PDF failed', String(e?.message ?? e)));
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.h}>New job sheet</Text>
        <Text style={styles.label}>Date</Text>
        <View style={styles.nav}>
          <Text style={styles.arrow} onPress={() => setDate(addDays(date, -1))}>◀</Text>
          <Text style={styles.navTitle}>{dayLabelLong(date)}</Text>
          <Text style={styles.arrow} onPress={() => setDate(addDays(date, 1))}>▶</Text>
        </View>
        <Field label="Job / ref no." placeholder="e.g. 78-06.00" value={f.jobRef} onChangeText={set('jobRef')} />
        <Field label="Client" placeholder="e.g. Prime Management" value={f.client} onChangeText={set('client')} />
        <Field label="Site / location" placeholder="e.g. Bridge 78, N4" value={f.site} onChangeText={set('site')} />
        <Text style={styles.label}>Operatives</Text>
        {ops.map((o, i) => (
          <Field key={i} label="" placeholder="Name on the job" value={o} onChangeText={(v) => setAt(ops, setOps, i, v)} />
        ))}
        <Text style={styles.add} onPress={() => setOps([...ops, ''])}>＋ Add operative</Text>
        <Text style={styles.label}>Plant / equipment</Text>
        {plant.map((o, i) => (
          <Field key={i} label="" placeholder="e.g. TM van, signage, IPV" value={o} onChangeText={(v) => setAt(plant, setPlant, i, v)} />
        ))}
        <Text style={styles.add} onPress={() => setPlant([...plant, ''])}>＋ Add plant / equipment</Text>
        <Field label="Description of works" placeholder="What was carried out" value={f.description} onChangeText={set('description')} multiline />
        <Field label="Materials" placeholder="Materials used" value={f.materials} onChangeText={set('materials')} multiline />
        <Text style={styles.label}>Photos</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label="📷 Take photo" variant="ghost" style={{ flex: 1 }} onPress={async () => { const p = await pickPhoto('camera'); if (p) setPhotos([...photos, p.uri]); }} />
          <Button label="🖼️ Add from library" variant="ghost" style={{ flex: 1 }} onPress={async () => { const p = await pickPhoto('library'); if (p) setPhotos([...photos, p.uri]); }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {photos.map((p, i) => (
            <Text key={p} onPress={() => setPhotos(photos.filter((_, j) => j !== i))}>
              <Image source={{ uri: p }} style={styles.thumb} />
            </Text>
          ))}
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Time taken</Text>
          <Field label="" value={h} onChangeText={setH} keyboardType="number-pad" style={styles.time} />
          <Text style={styles.unit}>h</Text>
          <Field label="" value={m} onChangeText={setM} keyboardType="number-pad" style={styles.time} />
          <Text style={styles.unit}>min</Text>
        </View>
        <Field label="Notes" placeholder="Anything else (delays, issues)" value={f.notes} onChangeText={set('notes')} multiline />
        <Field label="Signed by" value={signed} onChangeText={setSigned} />
        <Button label="📄 Save & export PDF" onPress={saveAndExport} />
      </Card>

      {saved.length ? (
        <>
          <SectionLabel>Saved job sheets</SectionLabel>
          {saved.map((j) => (
            <Card key={j.id} style={styles.savedRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedTitle}>{[j.site, j.jobRef].filter(Boolean).join(' · ') || 'Job sheet'}</Text>
                <Text style={styles.sub}>{dayLabelLong(new Date(j.date))}</Text>
              </View>
              <Text style={styles.link} onPress={() => exportJobSheetPdf(j, worker).catch(() => {})}>PDF</Text>
              <Text style={styles.del} onPress={async () => { const n = saved.filter((x) => x.id !== j.id); setSaved(n); await saveJobSheets(n); }}>✕</Text>
            </Card>
          ))}
        </>
      ) : null}
      <Text style={styles.note}>This is a first version — send me your usual job sheet and I&apos;ll match it exactly.</Text>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 24, fontWeight: '800', color: colors.text },
  label: { fontSize: 15, fontWeight: '700', color: '#55677A' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  arrow: { fontSize: 22, color: colors.navy, paddingHorizontal: 8 },
  navTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  add: { fontSize: 17, fontWeight: '800', color: colors.navy, paddingVertical: 6 },
  thumb: { width: 84, height: 84, borderRadius: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  time: { width: 70, textAlign: 'center' },
  unit: { fontSize: 18, fontWeight: '700', color: '#55677A' },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  savedTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: '#5F7385' },
  link: { fontSize: 17, fontWeight: '800', color: colors.navy },
  del: { fontSize: 22, color: '#5F7385', paddingHorizontal: 6 },
  note: { fontSize: 15, color: '#5F7385', textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
});
