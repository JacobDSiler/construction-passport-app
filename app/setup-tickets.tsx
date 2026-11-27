import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/ui';
import { Step } from '../src/components/Step';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';

const CHOICES = ['CSCS Card', 'First Aid', 'MEWP / Cherry Picker', 'Forklift', 'Teleporter', 'Abrasive Wheels', 'Other'];

// Step 5: tap to add other tickets; each becomes a ticket on the Passport (dates added later).
export default function SetupTickets() {
  const router = useRouter();
  const { upsertQualification } = useStore();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  function done() {
    picked.forEach((name, i) => upsertQualification({ id: `q-extra-${Date.now()}-${i}`, name: name === 'Other' ? 'Other ticket' : name, verification: 'self' }));
    router.push('/setup-done');
  }

  return (
    <Step n={5} emoji="🎟️" title="Any other tickets?" text="Tap one to add it. Add as many as you like — or skip and add them later.">
      <View style={{ gap: spacing.sm }}>
        {CHOICES.map((c) => {
          const on = picked.includes(c);
          return (
            <Pressable key={c} style={[styles.chip, on && styles.chipOn]} onPress={() => toggle(c)}>
              <Text style={[styles.chipText, on && { color: colors.white }]}>{on ? '✓ ' : '＋ '}{c}</Text>
            </Pressable>
          );
        })}
      </View>
      {picked.length ? <Button label={`Add ${picked.length} and finish`} onPress={done} /> : null}
      <Text style={styles.skip} onPress={() => router.push('/setup-done')}>
        Skip for now
      </Text>
    </Step>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: '#C9D6E3', paddingVertical: 16, paddingHorizontal: 18 },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 19, fontWeight: '800', color: colors.navy },
  skip: { textAlign: 'center', color: colors.muted, fontSize: 17, textDecorationLine: 'underline', paddingVertical: 8 },
});
