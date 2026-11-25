import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { AuditPoint, AuditResult, SiteAudit, auditScore, loadSiteAudits, newRecordId, saveSiteAudits } from '../src/lib/records';

// Layout and copy follow docs/reference/web-employer-09-site-audit-list.jpg. Device-only for now.
const RESULTS: { key: AuditResult; label: string }[] = [
  { key: 'pass', label: 'Pass' },
  { key: 'fail', label: 'Fail' },
  { key: 'na', label: 'N/A' },
];
const blankPoint = (): AuditPoint => ({ id: newRecordId('pt'), observation: '', result: 'pass', defect: '' });

export default function SiteAuditScreen() {
  const [audits, setAudits] = useState<SiteAudit[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [points, setPoints] = useState<AuditPoint[]>([]);

  useEffect(() => {
    loadSiteAudits().then(setAudits);
  }, []);

  function startNew() {
    setName(''); setSite(''); setLocation(''); setWeather('');
    setPoints([blankPoint()]);
    setEditing(true);
  }

  function setPoint(id: string, patch: Partial<AuditPoint>) {
    setPoints((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function movePoint(i: number, dir: -1 | 1) {
    setPoints((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    if (!points.some((p) => p.observation.trim())) return Alert.alert('Add a point', 'Describe at least one thing you observed.');
    const missing = points.find((p) => p.result === 'fail' && !p.defect.trim());
    if (missing) return Alert.alert('Describe the defect', 'Every point marked Fail needs a defect description.');
    const clean = points.filter((p) => p.observation.trim()).map((p) => ({ ...p, observation: p.observation.trim(), defect: p.defect.trim() }));
    const a: SiteAudit = {
      id: newRecordId('audit'),
      name: name.trim(),
      site: site.trim(),
      location: location.trim(),
      weather: weather.trim(),
      date: new Date().toISOString(),
      points: clean,
      score: auditScore(clean),
    };
    const next = [a, ...audits];
    setAudits(next);
    await saveSiteAudits(next);
    setEditing(false);
    Alert.alert('Audit saved', `Score ${a.score}%. Kept on this phone only.`);
  }

  async function remove(id: string) {
    const next = audits.filter((a) => a.id !== id);
    setAudits(next);
    await saveSiteAudits(next);
  }

  if (editing) {
    return (
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Site name" />
          <Field label="Site / area" value={site} onChangeText={setSite} placeholder="Site / area" />
          <Field label="Location" value={location} onChangeText={setLocation} placeholder="Address or town" />
          <Field label="Weather" value={weather} onChangeText={setWeather} placeholder="e.g. Dry, windy" />
        </Card>
        <SectionLabel>POINTS</SectionLabel>
        {points.map((p, i) => (
          <Card key={p.id} style={{ gap: spacing.sm }}>
            <Text style={styles.h}>Point {i + 1}</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={p.observation}
              onChangeText={(t) => setPoint(p.id, { observation: t })}
              placeholder="What did you observe? Describe clearly."
              placeholderTextColor="#9AA9B8"
              multiline
            />
            <View style={styles.chips}>
              {RESULTS.map((r) => (
                <Pressable key={r.key} style={[styles.chip, p.result === r.key && styles.chipOn]} onPress={() => setPoint(p.id, { result: r.key })}>
                  <Text style={[styles.chipText, p.result === r.key && styles.chipTextOn]}>{r.label}</Text>
                </Pressable>
              ))}
            </View>
            {p.result === 'fail' ? (
              <TextInput
                style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                value={p.defect}
                onChangeText={(t) => setPoint(p.id, { defect: t })}
                placeholder="Describe any defects found (required if you marked a defect)"
                placeholderTextColor="#9AA9B8"
                multiline
              />
            ) : null}
            <View style={styles.rowActions}>
              <Text style={styles.link} onPress={() => movePoint(i, -1)}>Move up</Text>
              <Text style={styles.link} onPress={() => movePoint(i, 1)}>Move down</Text>
              <Text style={styles.del} onPress={() => setPoints((cur) => cur.filter((x) => x.id !== p.id))}>Remove</Text>
            </View>
          </Card>
        ))}
        <Button label="＋ Add next point" variant="ghost" onPress={() => setPoints((cur) => [...cur, blankPoint()])} />
        <Text style={styles.muted}>Score so far: {auditScore(points)}%</Text>
        <Button label="Save audit" onPress={save} />
        <Button label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Button label="＋  New audit" onPress={startNew} />
      <Text style={styles.h1}>Previous audits</Text>
      {audits.length === 0 ? <Text style={styles.muted}>No audits yet.</Text> : null}
      {audits.map((a) => (
        <Card key={a.id} style={{ gap: 4 }}>
          <Text style={styles.h}>{a.name || a.site || 'Audit'}</Text>
          <Text style={styles.muted}>{new Date(a.date).toLocaleDateString('en-IE')} · Score {a.score}% · {a.points.filter((p) => p.result === 'fail').length} fail</Text>
          {a.points.filter((p) => p.result === 'fail').map((p) => (
            <Text key={p.id} style={[styles.muted, { color: colors.danger }]}>{p.observation}: {p.defect}</Text>
          ))}
          <Text style={styles.del} onPress={() => remove(a.id)}>Delete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 22, fontWeight: '900', color: colors.text, marginTop: spacing.sm },
  h: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 16, color: colors.text, backgroundColor: colors.white },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { flex: 1, borderWidth: 2, borderColor: colors.navy, borderRadius: 12, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.white },
  chipOn: { backgroundColor: colors.navy },
  chipText: { color: colors.navy, fontWeight: '800', fontSize: 15 },
  chipTextOn: { color: colors.white },
  rowActions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  link: { color: colors.navy, fontSize: 15, fontWeight: '700' },
  del: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
