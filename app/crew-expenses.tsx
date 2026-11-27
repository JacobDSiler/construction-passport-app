import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useFocusEffect } from 'expo-router';
import { Button, Card } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { listExpenses, rows, setExpenseStatus, str } from '../src/lib/api';

export default function CrewExpenses() {
  const { session } = useSession();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.orgCode) return;
    setBusy(true);
    try {
      setList(rows(await listExpenses(session.orgCode)));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [session.orgCode]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = list.reduce((n, e) => n + (Number(e.amount) || 0), 0);
  async function set(id: string, status: string) {
    try {
      await setExpenseStatus(id, status);
      load();
    } catch (e) {
      Alert.alert('Could not update', (e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      <Card>
        <Text style={styles.h}>Company expenses</Text>
        <Text style={styles.muted}>{`Submitted by your crew · crew code ${session.orgCode ?? ''}. Pull down to refresh.`}</Text>
        <Text style={styles.total}>{`€${total.toFixed(2)}`}</Text>
      </Card>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      {list.length === 0 ? (
        <Text style={styles.muted}>No company expenses submitted yet. When a worker on your crew code adds a company expense, it appears here.</Text>
      ) : (
        list.map((e, i) => (
          <Card key={str(e, 'id') || i}>
            <View style={styles.row}>
              <Text style={styles.name}>{str(e, 'description', 'category', 'title') || 'Expense'}</Text>
              <Text style={styles.name}>{`€${(Number(e.amount) || 0).toFixed(2)}`}</Text>
            </View>
            <Text style={styles.muted}>{[str(e, 'worker_name', 'name'), str(e, 'date'), str(e, 'status')].filter(Boolean).join(' · ')}</Text>
            <View style={styles.row}>
              <Button label="Approve" onPress={() => set(str(e, 'id'), 'approved')} style={{ flex: 1 }} />
              <Button label="Reject" variant="ghost" onPress={() => set(str(e, 'id'), 'rejected')} style={{ flex: 1 }} />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  h: { fontSize: 20, fontWeight: '900', color: colors.text },
  total: { fontSize: 34, fontWeight: '900', color: colors.navy, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
});
