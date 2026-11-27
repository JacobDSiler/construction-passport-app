import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Card, Field } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { Qualification } from '../src/lib/passport';

const COMMON: { name: string; issuer?: string }[] = [
  { name: 'Safe Pass', issuer: 'SOLAS' },
  { name: 'Manual Handling', issuer: 'QQI' },
  { name: 'Working at Heights', issuer: 'SOLAS' },
  { name: 'MEWP (Cherry Picker)', issuer: 'IPAF' },
  { name: 'First Aid', issuer: 'PHECC' },
  { name: 'CSCS Card', issuer: 'SOLAS' },
  { name: 'Abrasive Wheels' },
  { name: 'Confined Space' },
  { name: 'Banksman / Signaller' },
  { name: 'Asbestos Awareness' },
  { name: 'Fire Safety' },
  { name: 'Forklift' },
];

export default function AddQualification() {
  const router = useRouter();
  const { upsertQualification } = useStore();
  const [custom, setCustom] = useState('');

  function create(name: string, issuer?: string) {
    const q: Qualification = { id: `q-${Date.now()}`, name: name.trim(), issuer, verification: 'self' };
    upsertQualification(q);
    router.replace({ pathname: '/qualification/[id]', params: { id: q.id } });
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.h}>What ticket are you adding?</Text>
      <Card>
        {COMMON.map((c) => (
          <Pressable key={c.name} style={styles.row} onPress={() => create(c.name, c.issuer)}>
            <Text style={styles.rowText}>{c.name}</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}
      </Card>
      <Card>
        <Field label="Something else" placeholder="e.g. Pipe Fitting Cert" value={custom} onChangeText={setCustom} />
        <Button label="Add" disabled={!custom.trim()} onPress={() => create(custom)} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 24, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  rowText: { fontSize: 19, color: colors.text, fontWeight: '600' },
  chev: { fontSize: 28, color: '#5F7385' },
});
