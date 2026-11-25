import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Pill } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { getPassport, greenlight, removeCrewMember, rows, str } from '../src/lib/api';

// A crew member's passport as the employer sees it, with Greenlight and Remove.
export default function CrewMember() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { session } = useSession();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getPassport(String(code));
      setData(Array.isArray(r) ? ((r[0] as Record<string, unknown>) ?? null) : (r as Record<string, unknown> | null));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [code]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const quals = rows(data?.quals ?? data?.qualifications ?? data?.certs);

  async function confirm() {
    try {
      await greenlight(String(code), session.orgName ?? 'Employer', session.email ?? '');
      setDone(true);
    } catch (e) {
      Alert.alert('Could not greenlight', (e as Error).message);
    }
  }
  function remove() {
    Alert.alert('Remove from crew?', 'They stay in the app; they just leave your crew list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            if (session.orgCode) await removeCrewMember(session.orgCode, String(code));
            router.back();
          } catch (e) {
            Alert.alert('Could not remove', (e as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <Card>
        <Text style={styles.name}>{str(data, 'name') || String(code)}</Text>
        <Text style={styles.muted}>{[str(data, 'trade'), str(data, 'employer'), String(code).toUpperCase()].filter(Boolean).join(' · ')}</Text>
        {str(data, 'status') ? <Pill text={str(data, 'status')} tone="ok" /> : null}
      </Card>
      <Text style={styles.section}>TICKETS</Text>
      {quals.length === 0 ? <Text style={styles.muted}>No tickets on this passport yet.</Text> : quals.map((q, i) => (
        <Card key={i}>
          <Text style={styles.q}>{str(q, 'name', 'title')}</Text>
          <Text style={styles.muted}>{str(q, 'expires', 'expiry') ? `Expires ${new Date(str(q, 'expires', 'expiry')).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}` : 'No expiry on record'}</Text>
        </Card>
      ))}
      <Button label={done ? '✓ Greenlit' : 'Greenlight this worker'} onPress={confirm} disabled={done} />
      <Text style={styles.remove} onPress={remove}>Remove from crew</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  name: { fontSize: 24, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted, fontSize: 16 },
  section: { fontSize: 14, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  q: { fontSize: 18, fontWeight: '800', color: colors.text },
  remove: { textAlign: 'center', color: colors.danger, fontSize: 18, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: spacing.md },
});
