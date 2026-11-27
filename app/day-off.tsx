import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Card, Field } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { addDays, dayLabelLong, startOfDay } from '../src/lib/dates';

const TYPES = ['Holiday', 'Sick', 'Bank holiday', 'No work'] as const;

export default function DayOff() {
  const router = useRouter();
  const { addEvent } = useStore();
  const [day, setDay] = useState(startOfDay(new Date()));
  const [type, setType] = useState<(typeof TYPES)[number]>('Holiday');
  const [note, setNote] = useState('');

  async function save() {
    const at = new Date(day);
    at.setHours(12, 0, 0, 0);
    await addEvent('day_off', { at, note: `${type}${note.trim() ? ` — ${note.trim()}` : ''}` });
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.label}>Day</Text>
        <View style={styles.nav}>
          <Text style={styles.arrow} onPress={() => setDay(addDays(day, -1))}>◀</Text>
          <Text style={styles.navTitle}>{dayLabelLong(day)}</Text>
          <Text style={styles.arrow} onPress={() => setDay(addDays(day, 1))}>▶</Text>
        </View>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => (
            <Pressable key={t} style={[styles.chip, type === t && styles.chipOn]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && { color: colors.white }]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
        <Button label="Record day off" onPress={save} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  label: { fontSize: 15, fontWeight: '700', color: '#55677A' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  arrow: { fontSize: 22, color: colors.navy, paddingHorizontal: 8 },
  navTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12 },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 18, fontWeight: '700', color: colors.text },
});
