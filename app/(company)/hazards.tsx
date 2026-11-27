import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useFocusEffect } from 'expo-router';
import { Button, Card, SectionLabel } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useSession } from '../../src/lib/session';
import { listHazards, resolveHazard, rows, str } from '../../src/lib/api';

const isResolved = (h: Record<string, unknown>) => Boolean(h.resolved || h.resolved_at || h.resolvedAt || str(h, 'status').toLowerCase() === 'resolved');

// Hazard reports sent in by the crew: to action and resolved.
export default function CompanyHazards() {
  const { session } = useSession();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.orgCode) return;
    setBusy(true);
    setErr(null);
    try {
      setList(rows(await listHazards(session.orgCode)));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [session.orgCode]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function resolve(h: Record<string, unknown>) {
    try {
      await resolveHazard(session.orgCode!, str(h, 'id') as string, session.orgName);
      load();
    } catch (e) {
      Alert.alert('Could not resolve', (e as Error).message);
    }
  }

  const open = list.filter((h) => !isResolved(h));
  const done = list.filter(isResolved);
  const card = (h: Record<string, unknown>, action: boolean) => (
    <Card key={str(h, 'id') || Math.random().toString()}>
      <Text style={styles.title}>{str(h, 'ref', 'reference', 'title', 'type') || 'Hazard report'}</Text>
      <Text style={styles.muted}>{[str(h, 'site', 'location'), str(h, 'created_at', 'date')].filter(Boolean).join(' · ')}</Text>
      {str(h, 'description', 'details', 'notes') ? <Text style={styles.body}>{str(h, 'description', 'details', 'notes')}</Text> : null}
      {action ? <Button label="Mark resolved" onPress={() => resolve(h)} /> : <Text style={styles.muted}>Resolved{str(h, 'resolved_by') ? ` by ${str(h, 'resolved_by')}` : ''}</Text>}
    </Card>
  );

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      <View style={styles.counts}>
        <Card style={styles.count}><Text style={styles.big}>{open.length}</Text><Text style={styles.muted}>To action</Text></Card>
        <Card style={styles.count}><Text style={styles.big}>{done.length}</Text><Text style={styles.muted}>Resolved</Text></Card>
      </View>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>REPORTS TO RESOLVE</SectionLabel>
      {open.length ? open.map((h) => card(h, true)) : <Text style={styles.muted}>Nothing to action right now. Pull down to refresh.</Text>}
      <SectionLabel>RESOLVED</SectionLabel>
      {done.length ? done.map((h) => card(h, false)) : <Text style={styles.muted}>No resolved reports yet.</Text>}
      <Text style={styles.tag}>Observe · Speak Up · Take Action · Make a Difference</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  counts: { flexDirection: 'row', gap: spacing.md },
  count: { flex: 1, alignItems: 'center' },
  big: { fontSize: 34, fontWeight: '900', color: colors.navy },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 15 },
  body: { fontSize: 16, color: colors.text },
  tag: { textAlign: 'center', color: colors.muted, fontSize: 14, marginTop: spacing.md },
});
