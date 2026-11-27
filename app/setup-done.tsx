import { StyleSheet } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { useSession } from '../src/lib/session';

// Step 6: finished. Marks the role as worker and drops into the Passport tab.
export default function SetupDone() {
  const router = useRouter();
  const { worker } = useStore();
  const { update } = useSession();
  const first = worker.name.trim().split(/\s+/)[0] || 'there';
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.h1}>{`You're all set, ${first}!`}</Text>
      <Text style={styles.sub}>Your passport is ready. You can add dates, share it, or add more tickets any time.</Text>
      <Button
        label="See my passport"
        onPress={() => {
          update({ role: 'worker' });
          router.replace('/(tabs)');
        }}
        style={{ alignSelf: 'stretch', marginTop: spacing.lg }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 72 },
  h1: { fontSize: 32, fontWeight: '900', color: '#111', textAlign: 'center' },
  sub: { fontSize: 18, color: colors.muted, textAlign: 'center', lineHeight: 26 },
});
