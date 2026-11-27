import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Card } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useI18n } from '../src/lib/i18n';
import { DAY_NAMES, WeekSchedule, defaultSchedule, loadSchedule, saveSchedule, validTime } from '../src/lib/schedule';
import { Alert } from 'react-native';

export default function ScheduleScreen() {
  const router = useRouter();
  const { bi } = useI18n();
  const [s, setS] = useState<WeekSchedule>(defaultSchedule());
  useEffect(() => { loadSchedule().then(setS); }, []);

  const set = (i: number, patch: Partial<WeekSchedule[number]>) => setS((cur) => cur.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  async function save() {
    for (let i = 0; i < 7; i++) {
      if (s[i].on && (!validTime(s[i].start) || !validTime(s[i].end))) {
        Alert.alert(bi('Check the times'), bi('Enter times as HH:MM, e.g. 08:00.'));
        return;
      }
    }
    await saveSchedule(s);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.p}>Set your usual week. On the Timesheet tab you can then fill in today from it with one tap.</Text>
      {s.map((d, i) => (
        <Card key={DAY_NAMES[i]}>
          <View style={styles.row}>
            <Text style={styles.day}>{DAY_NAMES[i]}</Text>
            <Switch value={d.on} onValueChange={(v) => set(i, { on: v })} />
          </View>
          {d.on ? (
            <View style={styles.row}>
              <TextInput style={styles.input} value={d.start} onChangeText={(v) => set(i, { start: v })} placeholder="08:00" placeholderTextColor="#9AA9B8" keyboardType="numbers-and-punctuation" />
              <Text style={styles.to}>to</Text>
              <TextInput style={styles.input} value={d.end} onChangeText={(v) => set(i, { end: v })} placeholder="17:00" placeholderTextColor="#9AA9B8" keyboardType="numbers-and-punctuation" />
              <TextInput style={[styles.input, { width: 64 }]} value={String(d.breakMins)} onChangeText={(v) => set(i, { breakMins: Number(v.replace(/\D/g, '')) || 0 })} keyboardType="number-pad" />
              <Text style={styles.to}>min break</Text>
            </View>
          ) : null}
        </Card>
      ))}
      <Button label="Save schedule" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  p: { fontSize: 16, color: '#55677A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' },
  day: { fontSize: 18, fontWeight: '800', color: colors.text },
  input: { borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 18, width: 84, color: colors.text },
  to: { fontSize: 16, color: '#55677A' },
});
