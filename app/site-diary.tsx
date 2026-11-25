import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { useStore } from '../src/lib/store';
import { SiteDiaryEntry, loadSiteDiary, newRecordId, saveSiteDiary } from '../src/lib/records';

// Layout and copy follow docs/reference/web-employer-08-site-diary.jpg. Device-only for now.
export default function SiteDiary() {
  const { session } = useSession();
  const { worker } = useStore();
  const [entries, setEntries] = useState<SiteDiaryEntry[]>([]);
  const [site, setSite] = useState('');
  const [weather, setWeather] = useState('');
  const [crew, setCrew] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [deliveries, setDeliveries] = useState('');
  const [delays, setDelays] = useState('');
  const [visitors, setVisitors] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSiteDiary().then(setEntries);
  }, []);

  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  async function save() {
    const e: SiteDiaryEntry = {
      id: newRecordId('diary'),
      date: new Date().toISOString(),
      site: site.trim(),
      weather: weather.trim(),
      crewOnSite: crew.trim(),
      workDone: workDone.trim(),
      deliveries: deliveries.trim(),
      delays: delays.trim(),
      visitors: visitors.trim(),
      notes: notes.trim(),
      author: worker.name,
    };
    const next = [e, ...entries];
    setEntries(next);
    await saveSiteDiary(next);
    setSite(''); setWeather(''); setCrew(''); setWorkDone(''); setDeliveries(''); setDelays(''); setVisitors(''); setNotes('');
    Alert.alert('Diary saved', 'It is kept on this phone only.');
  }

  async function remove(id: string) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await saveSiteDiary(next);
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <View style={styles.banner}>
        <Text style={styles.bannerName}>{session.orgName ?? 'Your company'}</Text>
        <Text style={styles.bannerSub}>Site Diary</Text>
        <Text style={styles.bannerDate}>{today}</Text>
      </View>
      <Card>
        <Field label="Site / location" value={site} onChangeText={setSite} placeholder="e.g. Bridge 78, south compound" />
        <Field label="Weather" value={weather} onChangeText={setWeather} placeholder="e.g. Dry, cold, foggy start" />
        <Field label="Crew on site" value={crew} onChangeText={setCrew} placeholder="e.g. Alfie, Oisin, Sam" />
        <Field label="Work carried out" value={workDone} onChangeText={setWorkDone} placeholder="What was done today" multiline />
        <Field label="Deliveries" value={deliveries} onChangeText={setDeliveries} placeholder="Materials / plant delivered" multiline />
        <Field label="Delays / issues" value={delays} onChangeText={setDelays} placeholder="Anything that held the job up" multiline />
        <Field label="Visitors" value={visitors} onChangeText={setVisitors} placeholder="Site visitors / inspections" multiline />
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Anything else for the record" multiline />
        <Button label="Save diary entry" onPress={save} disabled={!site.trim() || !workDone.trim()} />
      </Card>

      <SectionLabel>{`RECENT ENTRIES (${entries.length})`}</SectionLabel>
      {entries.length === 0 ? <Text style={styles.muted}>No entries yet.</Text> : null}
      {entries.map((e) => (
        <Card key={e.id} style={{ gap: 4 }}>
          <Text style={styles.h}>{e.site}</Text>
          <Text style={styles.muted}>{new Date(e.date).toLocaleDateString('en-IE')}{e.weather ? ` · ${e.weather}` : ''}{e.crewOnSite ? ` · ${e.crewOnSite}` : ''}</Text>
          <Text style={styles.body2}>{e.workDone}</Text>
          {e.delays ? <Text style={[styles.body2, { color: colors.danger }]}>Delays: {e.delays}</Text> : null}
          <Text style={styles.del} onPress={() => remove(e.id)}>Delete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  banner: { backgroundColor: colors.navy, borderRadius: 16, padding: spacing.md, gap: 2 },
  bannerName: { color: colors.white, fontSize: 22, fontWeight: '900' },
  bannerSub: { color: colors.white, fontSize: 17, fontWeight: '700' },
  bannerDate: { color: '#C9D8E8', fontSize: 16 },
  h: { fontSize: 18, fontWeight: '800', color: colors.text },
  body2: { fontSize: 16, color: colors.text, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
