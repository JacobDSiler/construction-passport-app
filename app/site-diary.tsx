import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, Field, SectionLabel, Select } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { SiteDiaryEntry, loadSiteDiary, newRecordId, saveSiteDiary } from '../src/lib/records';

const WEATHER = ['Dry', 'Showers', 'Rain', 'Wind', 'Frost', 'Snow', 'Hot'];

export default function SiteDiary() {
  const { worker } = useStore();
  const [entries, setEntries] = useState<SiteDiaryEntry[]>([]);
  const [site, setSite] = useState('');
  const [weather, setWeather] = useState<string | undefined>(undefined);
  const [workers, setWorkers] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [visitors, setVisitors] = useState('');
  const [incidents, setIncidents] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSiteDiary().then(setEntries);
  }, []);

  async function save() {
    const n = Number(workers);
    const e: SiteDiaryEntry = {
      id: newRecordId('diary'),
      date: new Date().toISOString(),
      site: site.trim(),
      weather: weather ?? '',
      workersOnSite: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0,
      workDone: workDone.trim(),
      visitors: visitors.trim(),
      incidents: incidents.trim(),
      notes: notes.trim(),
      author: worker.name,
    };
    const next = [e, ...entries];
    setEntries(next);
    await saveSiteDiary(next);
    setSite(''); setWeather(undefined); setWorkers(''); setWorkDone(''); setVisitors(''); setIncidents(''); setNotes('');
    Alert.alert('Diary saved', 'It is kept on this phone only.');
  }

  async function remove(id: string) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await saveSiteDiary(next);
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.muted}>Today&apos;s diary. Saved on this phone only; it does not sync to the company yet.</Text>
      <Card>
        <Field label="Site" value={site} onChangeText={setSite} placeholder="Site name or address" />
        <Select placeholder="Weather" value={weather} options={WEATHER} onChange={setWeather} />
        <Field label="Workers on site" value={workers} onChangeText={setWorkers} placeholder="0" keyboardType="number-pad" />
        <Field label="Work done today" value={workDone} onChangeText={setWorkDone} placeholder="What was done" multiline />
        <Field label="Visitors" value={visitors} onChangeText={setVisitors} placeholder="Who came on site" multiline />
        <Field label="Incidents or near misses" value={incidents} onChangeText={setIncidents} placeholder="None if nothing happened" multiline />
        <Field label="Other notes" value={notes} onChangeText={setNotes} placeholder="Deliveries, instructions, delays" multiline />
        <Button label="Save diary entry" onPress={save} disabled={!site.trim() || !workDone.trim()} />
      </Card>

      <SectionLabel>{`PAST ENTRIES (${entries.length})`}</SectionLabel>
      {entries.length === 0 ? <Text style={styles.muted}>No entries yet.</Text> : null}
      {entries.map((e) => (
        <Card key={e.id}>
          <Text style={styles.h}>{e.site}</Text>
          <Text style={styles.muted}>{new Date(e.date).toLocaleDateString('en-IE')} · {[e.weather, `${e.workersOnSite} on site`].filter(Boolean).join(' · ')}</Text>
          <Text style={styles.body2}>{e.workDone}</Text>
          {e.incidents ? <Text style={[styles.body2, { color: colors.danger }]}>Incidents: {e.incidents}</Text> : null}
          <Text style={styles.del} onPress={() => remove(e.id)}>Delete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  h: { fontSize: 18, fontWeight: '800', color: colors.text },
  body2: { fontSize: 16, color: colors.text, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
