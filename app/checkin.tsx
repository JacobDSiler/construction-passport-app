import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { CheckIn, loadCheckIns, newRecordId, saveCheckIns } from '../src/lib/records';

const MOODS: { key: CheckIn['mood']; emoji: string; label: string }[] = [
  { key: 'good', emoji: '🟢', label: 'Good' },
  { key: 'ok', emoji: '🟡', label: 'Okay' },
  { key: 'rough', emoji: '🔴', label: 'Rough' },
];

// Private: stays on this phone, nobody else sees it.
export default function CheckInScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CheckIn[]>([]);
  const [mood, setMood] = useState<CheckIn['mood'] | null>(null);
  const [note, setNote] = useState('');
  useEffect(() => {
    loadCheckIns().then(setItems);
  }, []);

  async function save() {
    if (!mood) return;
    const next = [{ id: newRecordId('ci'), at: new Date().toISOString(), mood, note: note.trim() }, ...items].slice(0, 60);
    setItems(next);
    await saveCheckIns(next);
    setNote('');
    if (mood === 'rough') router.push('/support');
    setMood(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.h}>How are you doing?</Text>
        <Text style={styles.sub}>A quick, private check. It stays on your phone — nobody else sees it.</Text>
        <View style={styles.row}>
          {MOODS.map((m) => (
            <Pressable key={m.key} style={[styles.mood, mood === m.key && styles.moodOn]} onPress={() => setMood(m.key)}>
              <Text style={{ fontSize: 36 }}>{m.emoji}</Text>
              <Text style={styles.moodText}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Anything on your mind? (optional)" value={note} onChangeText={setNote} multiline />
        <Button label="Save check-in" disabled={!mood} onPress={save} />
      </Card>
      {items.length ? <SectionLabel>Your recent check-ins</SectionLabel> : null}
      {items.slice(0, 14).map((c) => (
        <Card key={c.id}>
          <Text style={styles.h2}>
            {MOODS.find((m) => m.key === c.mood)?.emoji} {new Date(c.at).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
          {c.note ? <Text style={styles.sub}>{c.note}</Text> : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 19, fontWeight: '800', color: colors.text },
  sub: { fontSize: 17, color: '#5F7385', lineHeight: 24 },
  row: { flexDirection: 'row', gap: spacing.sm },
  mood: { flex: 1, borderWidth: 2, borderColor: '#D6DEE6', borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 4 },
  moodOn: { borderColor: colors.navy, backgroundColor: '#E8F0F8' },
  moodText: { fontSize: 18, fontWeight: '700', color: colors.text },
});
