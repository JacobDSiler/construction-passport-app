import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Field, SectionLabel } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useSession } from '../../src/lib/session';
import { CourseQuestion, CourseSession, QuestionType, createCourse, getCourse, rows, str, updateCourse } from '../../src/lib/api';

// Same layout and copy as the live "New course" form (docs/reference/web-trainer-02..04).
const TICKETS = ['Safe Pass', 'Manual Handling', 'CSCS', 'First Aid', 'MEWP (IPAF)', 'Abrasive Wheels', 'Working at Heights', 'Confined Space', 'Other'];
const QTYPES: { key: QuestionType; label: string }[] = [
  { key: 'text', label: 'Text answer' },
  { key: 'yesno', label: 'Yes / No' },
  { key: 'choice', label: 'Multiple choice' },
];

export default function NewCourse() {
  const router = useRouter();
  const { session } = useSession();
  const params = useLocalSearchParams<{ code?: string }>();
  const editCode = typeof params.code === 'string' ? params.code.toUpperCase() : undefined;

  const [loading, setLoading] = useState(Boolean(editCode));
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState(session.orgName ?? '');
  const [cert, setCert] = useState('');
  const [location, setLocation] = useState('');
  const [signup, setSignup] = useState('');
  const [price, setPrice] = useState('');
  const [published, setPublished] = useState(true);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [sDate, setSDate] = useState('');
  const [sTime, setSTime] = useState('');
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('text');
  const [qOptions, setQOptions] = useState('');

  useEffect(() => {
    if (!editCode) return;
    getCourse(editCode)
      .then((c) => {
        if (!c) return;
        setTitle(str(c, 'title'));
        setProvider(str(c, 'provider'));
        setCert(str(c, 'cert_type', 'certType'));
        setLocation(str(c, 'location'));
        setSignup(str(c, 'signup'));
        setPrice(str(c, 'price'));
        setQuestions(Array.isArray(c.questionnaire) ? (c.questionnaire as CourseQuestion[]) : []);
        setSessions(Array.isArray(c.sessions) ? (c.sessions as CourseSession[]) : []);
        if (typeof c.published === 'boolean') setPublished(c.published);
      })
      .catch((e) => Alert.alert('Could not load course', (e as Error).message))
      .finally(() => setLoading(false));
  }, [editCode]);

  function addSession() {
    const d = sDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) return Alert.alert('Check the date', 'Enter the date as YYYY-MM-DD, e.g. 2026-10-05.');
    setSessions((cur) => [...cur, { date: d, ...(sTime.trim() ? { time: sTime.trim() } : {}) }].sort((a, b) => a.date.localeCompare(b.date)));
    setSDate('');
    setSTime('');
  }

  function addQuestion() {
    const label = qText.trim();
    if (!label) return;
    const q: CourseQuestion = { label, type: qType };
    if (qType === 'choice') q.options = qOptions.split(',').map((o) => o.trim()).filter(Boolean);
    setQuestions((cur) => [...cur, q]);
    setQText('');
    setQOptions('');
    setQType('text');
  }

  async function save() {
    if (!title.trim()) return Alert.alert('Course name', 'Give the course a name, e.g. Safe Pass.');
    setBusy(true);
    const input = { title: title.trim(), provider: provider.trim(), questionnaire: questions, location: location.trim(), signup: signup.trim(), price: price.trim(), certType: cert, sessions, published };
    try {
      if (editCode) {
        const ok = await updateCourse(editCode, input);
        if (!ok) throw new Error('The course was not saved.');
        router.back();
      } else {
        const code = await createCourse(input);
        if (!code) throw new Error('The course was created but no join code came back. Check the Courses list.');
        Alert.alert('Course created', `Join code: ${code}\nShare it with your students.`, [{ text: 'OK', onPress: () => router.replace('/trainer') }]);
      }
    } catch (e) {
      Alert.alert("Couldn't save", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.navy} /></View>;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Field label="Course name" value={title} onChangeText={setTitle} placeholder="e.g. Safe Pass" />
      <Field label="Training provider / instructor" value={provider} onChangeText={setProvider} placeholder="e.g. SilerTech Training" />

      <Text style={styles.label}>Renews which ticket? <Text style={styles.opt}>(so we can suggest it to workers whose ticket is expiring)</Text></Text>
      <View style={styles.chips}>
        {TICKETS.map((t) => (
          <Pressable key={t} style={[styles.chip, cert === t && styles.chipOn]} onPress={() => setCert(cert === t ? '' : t)}>
            <Text style={[styles.chipText, cert === t && styles.chipTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Where is it held?" value={location} onChangeText={setLocation} placeholder="Venue / address, town, county" />
      <Field label="Sign-up details (booking link, phone, or instructions)" value={signup} onChangeText={setSignup} placeholder="e.g. https://… or call 01 234 5678" autoCapitalize="none" />
      <Field label="Price (optional)" value={price} onChangeText={setPrice} placeholder="e.g. €150" />

      <SectionLabel>Session dates</SectionLabel>
      <Text style={styles.help}>Add the dates you&apos;re running this course. Workers can see and pick a date.</Text>
      <View style={styles.panel}>
        {sessions.map((s, i) => (
          <View key={`${s.date}-${i}`} style={styles.sessionRow}>
            <Text style={styles.sessionText}>{s.date}{s.time ? ` · ${s.time}` : ''}</Text>
            <Text style={styles.remove} onPress={() => setSessions((cur) => cur.filter((_, j) => j !== i))}>Remove</Text>
          </View>
        ))}
        <TextInput style={styles.input} value={sDate} onChangeText={setSDate} placeholder="Date, YYYY-MM-DD (e.g. 2026-10-05)" placeholderTextColor="#9AA9B8" autoCapitalize="none" />
        <TextInput style={styles.input} value={sTime} onChangeText={setSTime} placeholder="Start time (optional), e.g. 09:00" placeholderTextColor="#9AA9B8" />
        <Button label="＋ Add date" variant="ghost" onPress={addSession} />
      </View>

      <SectionLabel>Pre-training questionnaire</SectionLabel>
      <Text style={styles.help}>Questions students answer when they enrol. Optional.</Text>
      <View style={styles.panel}>
        {questions.map((q, i) => (
          <View key={`${q.label}-${i}`} style={styles.sessionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionText}>{q.label}</Text>
              <Text style={styles.help}>{q.type === 'text' ? 'Text answer' : q.type === 'yesno' ? 'Yes / No' : `Choice · ${(q.options ?? []).join(', ')}`}</Text>
            </View>
            <Text style={styles.remove} onPress={() => setQuestions((cur) => cur.filter((_, j) => j !== i))}>Remove</Text>
          </View>
        ))}
        <TextInput style={styles.input} value={qText} onChangeText={setQText} placeholder="New question" placeholderTextColor="#9AA9B8" />
        <View style={styles.typeRow}>
          {QTYPES.map((t) => (
            <Pressable key={t.key} style={[styles.typeChip, qType === t.key && styles.chipOn]} onPress={() => setQType(t.key)}>
              <Text style={[styles.chipText, qType === t.key && styles.chipTextOn]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
        {qType === 'choice' ? <TextInput style={styles.input} value={qOptions} onChangeText={setQOptions} placeholder="Options, separated by commas" placeholderTextColor="#9AA9B8" /> : null}
        <Button label="＋ Add question" variant="ghost" onPress={addQuestion} />
      </View>

      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>List in course search</Text>
          <Text style={styles.help}>When on, workers and employers can find this course by distance and date.</Text>
        </View>
        <Switch value={published} onValueChange={setPublished} trackColor={{ true: colors.navy, false: colors.border }} />
      </View>

      <Button label={busy ? 'Saving…' : editCode ? 'Save course' : 'Create course & get join code'} onPress={save} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  label: { fontSize: 15, fontWeight: '700', color: colors.muted, marginTop: spacing.md },
  opt: { fontWeight: '400' },
  help: { fontSize: 14, color: colors.muted, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  chipOn: { borderColor: colors.navy, backgroundColor: colors.navy },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.text },
  chipTextOn: { color: colors.white },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, fontSize: 16, color: colors.text, backgroundColor: colors.white, marginBottom: spacing.sm },
  panel: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  sessionText: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  remove: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white, borderRadius: 16, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  toggleTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
});
