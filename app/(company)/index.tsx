import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Pill } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useSession } from '../../src/lib/session';
import { listCrew, rows, str } from '../../src/lib/api';

export default function Crew() {
  const router = useRouter();
  const { session } = useSession();
  const [crew, setCrew] = useState<Record<string, unknown>[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.orgCode) return;
    setBusy(true);
    setErr(null);
    try {
      setCrew(rows(await listCrew(session.orgCode)));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [session.orgCode]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      <Text style={styles.h1}>{session.orgName ?? 'Your company'}</Text>
      <Button label="＋  Add a worker" onPress={() => router.push('/crew-add')} />
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      {crew.length === 0 && !busy ? (
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.empty}>No crew yet</Text>
          <Text style={styles.muted}>
            Ask a worker to open Share in their app and read you their passport code (6 characters). Tap "Add a worker" and enter it, and you'll see their tickets here and can greenlight them.
          </Text>
        </Card>
      ) : (
        crew.map((c, i) => {
          const code = str(c, 'short_code', 'shortCode', 'code');
          const status = str(c, 'status', 'level');
          return (
            <Pressable key={code || i} onPress={() => code && router.push({ pathname: '/crew-member', params: { code } })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{str(c, 'name', 'worker_name') || code}</Text>
                  <Text style={styles.muted}>{[str(c, 'trade'), str(c, 'type'), code].filter(Boolean).join(' · ')}</Text>
                </View>
                {status ? <Pill text={status} tone={/non|expired|bad|red/i.test(status) ? 'bad' : /expir|warn|amber/i.test(status) ? 'warn' : 'ok'} /> : null}
              </Card>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 26, fontWeight: '900', color: colors.text },
  empty: { fontSize: 20, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
});
