import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { Attribution, Button, Card, Field, SectionLabel } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { HAZARD_LABEL, HazardCategory, HazardReport, loadHazards, newRecordId, nextHazardRef, saveHazards } from '../../src/lib/records';
import { pickPhoto } from '../../src/lib/pick';
import { Stamp } from '../../src/lib/photos';
import { exportHazardPdf } from '../../src/lib/exports';
import { dayLabelLong } from '../../src/lib/dates';

const CATS: { key: HazardCategory; label: string; emoji: string; bg: string }[] = [
  { key: 'safe', label: 'Safe Act', emoji: '✅', bg: '#1F8A3C' },
  { key: 'unsafe_condition', label: 'Unsafe Condition', emoji: '⚠️', bg: '#F08C00' },
  { key: 'unsafe_act', label: 'Unsafe Act', emoji: '🚫', bg: '#C62828' },
];
const STOPPED = ['Co-worker', 'Supervisor', 'Other'] as const;

export default function HazardsTab() {
  const { worker } = useStore();
  const [saved, setSaved] = useState<HazardReport[]>([]);
  const [category, setCategory] = useState<HazardCategory | null>(null);
  const [toolbox, setToolbox] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; stamp: Stamp } | null>(null);
  const [f, setF] = useState({ observation: '', client: '', project: '', supervisor: '', location: '', department: '', immediateAction: '', furtherAction: '' });
  const [observer, setObserver] = useState(worker.name);
  const [anonymous, setAnonymous] = useState(false);
  const [stoppedBy, setStoppedBy] = useState<(typeof STOPPED)[number] | undefined>();

  useEffect(() => {
    loadHazards().then(setSaved);
  }, []);
  useEffect(() => {
    if (!observer && worker.name) setObserver(worker.name);
  }, [worker.name, observer]);

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const canSubmit = !!category && f.observation.trim().length > 0;
  const catLabel = category ? HAZARD_LABEL[category] : 'SELECT A CATEGORY';

  async function submit() {
    if (!category) return;
    const now = new Date();
    const report: HazardReport = {
      id: newRecordId('haz'),
      ref: nextHazardRef(saved, now),
      createdAt: now.toISOString(),
      category,
      toolbox,
      photoUri: photo?.uri,
      stamp: photo?.stamp,
      observation: f.observation.trim(),
      client: f.client,
      project: f.project,
      supervisor: f.supervisor,
      location: f.location,
      observer: observer || worker.name,
      anonymous,
      department: f.department,
      stoppedBy,
      immediateAction: f.immediateAction,
      furtherAction: f.furtherAction,
    };
    const next = [report, ...saved];
    setSaved(next);
    await saveHazards(next);
    setCategory(null);
    setToolbox(false);
    setPhoto(null);
    setStoppedBy(undefined);
    setF((p) => ({ ...p, observation: '', immediateAction: '', furtherAction: '', department: '' }));
    Alert.alert('Saved', `${report.ref} is saved on this device.`, [
      { text: 'Export PDF', onPress: () => exportHazardPdf(report).catch(() => {}) },
      { text: 'Done' },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        <Text style={styles.headOrg}>{worker.employer || 'Hazard observation'}</Text>
        <Text style={styles.headCat}>{catLabel.toUpperCase()}</Text>
        <Text style={styles.headRef}>
          CP-HOR-{new Date().getFullYear()}-#### · {dayLabelLong(new Date())}
        </Text>
      </View>

      <Text style={styles.label}>Category *</Text>
      <View style={styles.cats}>
        {CATS.map((c) => (
          <Pressable key={c.key} style={[styles.cat, { backgroundColor: c.bg, opacity: category && category !== c.key ? 0.45 : 1 }]} onPress={() => setCategory(c.key)}>
            <Text style={{ fontSize: 34 }}>{c.emoji}</Text>
            <Text style={styles.catText}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.suggestion, category === 'suggestion' ? null : category ? { opacity: 0.55 } : null]} onPress={() => setCategory('suggestion')}>
        <Text style={styles.suggestionText}>💡 Suggestion</Text>
      </Pressable>

      <Pressable style={[styles.toolbox, toolbox && { backgroundColor: '#DCE9F7' }]} onPress={() => setToolbox(!toolbox)}>
        <Text style={styles.toolboxText}>🪖 Flag for Toolbox{toolbox ? ' ✓' : ''}</Text>
      </Pressable>
      <Text style={styles.help}>This flags the report so your employer knows to raise it at the next toolbox talk. Your employer decides when and how.</Text>

      <Text style={styles.label}>Photo</Text>
      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.photo} />
      ) : (
        <Pressable style={styles.photoBox} onPress={async () => setPhoto(await pickPhoto('camera'))}>
          <Text style={styles.photoText}>📷 Take Photo</Text>
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button label="Choose from Library" variant="ghost" style={{ flex: 1 }} onPress={async () => setPhoto((await pickPhoto('library')) ?? photo)} />
        {photo ? <Button label="Remove" variant="ghost" style={{ flex: 1 }} onPress={() => setPhoto(null)} /> : null}
      </View>

      <Field label="Observation *" placeholder="What did you observe? Describe clearly." value={f.observation} onChangeText={set('observation')} multiline />
      <Field label="Client" value={f.client} onChangeText={set('client')} />
      <Field label="Project" value={f.project} onChangeText={set('project')} />
      <Field label="Supervisor (HOC coordinator)" value={f.supervisor} onChangeText={set('supervisor')} />
      <Field label="Location / site" value={f.location} onChangeText={set('location')} />
      <Field label="Observer's name" value={observer} onChangeText={setObserver} />
      <View style={styles.anon}>
        <Switch value={anonymous} onValueChange={setAnonymous} trackColor={{ true: '#7CC8BC' }} />
        <Text style={styles.anonText}>Report anonymously (name hidden on the PDF; kept on this device for the record)</Text>
      </View>
      <Field label="Department" placeholder="e.g. Fencing, Groundworks" value={f.department} onChangeText={set('department')} />

      <Text style={styles.label}>Task stopped by</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {STOPPED.map((s) => (
          <Pressable key={s} style={[styles.stop, stoppedBy === s && styles.stopOn]} onPress={() => setStoppedBy(stoppedBy === s ? undefined : s)}>
            <Text style={[styles.stopText, stoppedBy === s && { color: colors.white }]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="Immediate action taken" placeholder="e.g. Coned off the area and reported to supervisor" value={f.immediateAction} onChangeText={set('immediateAction')} multiline />
      <Field label="Further action required" placeholder="e.g. Electrician to reroute cable overhead" value={f.furtherAction} onChangeText={set('furtherAction')} multiline />
      <Button label="Submit Hazard Observation" disabled={!canSubmit} onPress={submit} />
      <Text style={styles.tag}>Observe · Speak Up · Take Action · Make a Difference</Text>

      {saved.length ? (
        <>
          <SectionLabel>Your saved reports</SectionLabel>
          {saved.map((h) => (
            <Card key={h.id}>
              <Text style={styles.savedRef}>{h.ref} · {HAZARD_LABEL[h.category]}</Text>
              <Text style={styles.help}>{h.observation}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Text style={styles.link} onPress={() => exportHazardPdf(h).catch((e) => Alert.alert('PDF failed', String(e?.message ?? e)))}>PDF</Text>
                <Text style={[styles.link, { color: colors.danger }]} onPress={async () => { const n = saved.filter((x) => x.id !== h.id); setSaved(n); await saveHazards(n); }}>Delete</Text>
              </View>
            </Card>
          ))}
        </>
      ) : null}
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  head: { backgroundColor: colors.navy, borderRadius: 18, padding: spacing.md, gap: 4 },
  headOrg: { color: colors.white, fontSize: 24, fontWeight: '800' },
  headCat: { color: colors.white, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  headRef: { color: '#DCE7F2', fontSize: 17 },
  label: { fontSize: 15, fontWeight: '700', color: '#55677A' },
  cats: { flexDirection: 'row', gap: spacing.sm },
  cat: { flex: 1, borderRadius: 18, paddingVertical: 20, alignItems: 'center', gap: 8 },
  catText: { color: colors.white, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  suggestion: { backgroundColor: colors.navy, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  suggestionText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  toolbox: { alignSelf: 'flex-start', borderWidth: 2, borderColor: colors.navy, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.white },
  toolboxText: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  help: { fontSize: 16, color: '#5F7385', lineHeight: 23 },
  photoBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#C3CFDB', borderRadius: 18, height: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  photoText: { fontSize: 22, color: '#5F7385', fontWeight: '600' },
  photo: { width: '100%', height: 240, borderRadius: 18 },
  anon: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  anonText: { flex: 1, fontSize: 16, color: '#5F7385', lineHeight: 22 },
  stop: { flex: 1, borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.white },
  stopOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  stopText: { fontSize: 17, fontWeight: '700', color: colors.text },
  tag: { textAlign: 'center', color: colors.navy, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  savedRef: { fontSize: 18, fontWeight: '800', color: colors.text },
  link: { fontSize: 17, fontWeight: '800', color: colors.navy },
});
