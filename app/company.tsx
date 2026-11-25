import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { listCrew, listSites } from '../src/lib/api';
import { logOut } from '../src/lib/account';

// Company home: org code to share with workers, crew list and sites. Approvals, expenses, hazards and
// timesheet review are built on top of this next.
export default function Company() {
  const router = useRouter();
  const { session, reset, update } = useSession();
  const [crew, setCrew] = useState<unknown[]>([]);
  const [sites, setSites] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.orgCode) return;
    setBusy(true);
    setErr(null);
    try {
      setCrew(((await listCrew(session.orgCode)) as unknown[]) ?? []);
      setSites(((await listSites(session.orgCode)) as unknown[]) ?? []);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [session.orgCode]);

  useEffect(() => {
    load();
  }, [load]);

  const label = (r: unknown) => {
    const o = (r ?? {}) as Record<string, unknown>;
    return String(o.name ?? o.worker_name ?? o.short_code ?? o.shortCode ?? 'Unnamed');
  };

  return (
    <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      <Text style={styles.h1}>{session.orgName ?? 'Your company'}</Text>
      <Card>
        <Text style={styles.label}>Company code (give this to your crew)</Text>
        <Text style={styles.code} selectable>
          {session.orgCode ?? '—'}
        </Text>
      </Card>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>{`CREW (${crew.length})`}</SectionLabel>
      {crew.length === 0 ? <Text style={styles.muted}>No crew yet. Workers join by entering your company code on their Profile.</Text> : crew.map((c, i) => <Card key={i}><Text style={styles.row}>{label(c)}</Text></Card>)}
      <SectionLabel>{`SITES (${sites.length})`}</SectionLabel>
      {sites.length === 0 ? <Text style={styles.muted}>No sites yet.</Text> : sites.map((s, i) => <Card key={i}><Text style={styles.row}>{label(s)}</Text></Card>)}
      <Button label="Use as a worker instead" variant="ghost" onPress={() => { update({ role: 'worker' }); router.replace('/(tabs)'); }} />
      <Button label="Log out" variant="ghost" onPress={async () => { await logOut(); reset(); router.replace('/'); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  label: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  code: { fontSize: 34, fontWeight: '900', color: colors.navy, letterSpacing: 3, marginTop: 4 },
  muted: { color: colors.muted, fontSize: 16 },
  row: { fontSize: 18, fontWeight: '700', color: colors.text },
});
