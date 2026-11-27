import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { CrewType, deleteProvisioned, listProvisioned, provisionWorker, rows, str } from '../src/lib/api';

const TICKETS = ['Safe Pass', 'Manual Handling', 'CSCS Card', 'First Aid', 'MEWP (IPAF)', 'Abrasive Wheels', 'Working at Heights', 'Confined Space'];

// Build a worker's passport before they have the app, then hand them the claim code.
export default function Provision() {
  const { session } = useSession();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [type, setType] = useState<CrewType>('employee');
  const [picked, setPicked] = useState<string[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setList(rows(await listProvisioned()));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function create() {
    try {
      setErr(null);
      const r = await provisionWorker({
        orgCode: session.orgCode!,
        name: name.trim(),
        trade: trade.trim(),
        type,
        assignment: 'crew',
        certs: picked.map((n) => ({ name: n })),
      });
      const c = typeof r === 'string' ? r : str(r as Record<string, unknown>, 'claim_code', 'claimCode', 'code');
      setCode(c || null);
      setName('');
      setTrade('');
      setPicked([]);
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  async function del(id: string) {
    try {
      await deleteProvisioned(id);
      load();
    } catch (e) {
      Alert.alert('Could not delete', (e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.muted}>Set up a worker's passport before they have the app. Add their name, trade and tickets, then send them the claim code. When they install the app and enter it, everything appears.</Text>
      {code ? (
        <Card>
          <Text style={styles.muted}>Claim code for the worker</Text>
          <Text style={styles.code} selectable>{code}</Text>
          <Button label="Copy code" variant="ghost" onPress={() => Clipboard.setStringAsync(code)} />
        </Card>
      ) : null}
      <SectionLabel>NEW WORKER</SectionLabel>
      <Field label="Worker's name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Trade (optional)" value={trade} onChangeText={setTrade} autoCapitalize="words" />
      <View style={styles.seg}>
        {(['employee', 'subcontractor'] as CrewType[]).map((t) => (
          <Pressable key={t} onPress={() => setType(t)} style={[styles.segBtn, type === t && styles.segOn]}>
            <Text style={[styles.segText, type === t && { color: colors.white }]}>{t === 'employee' ? 'Employee' : 'Subcontractor'}</Text>
          </Pressable>
        ))}
      </View>
      <SectionLabel>TICKETS</SectionLabel>
      {TICKETS.map((t) => {
        const on = picked.includes(t);
        return (
          <Pressable key={t} onPress={() => setPicked((p) => (on ? p.filter((x) => x !== t) : [...p, t]))} style={[styles.chip, on && styles.segOn]}>
            <Text style={[styles.segText, on && { color: colors.white }]}>{(on ? '✓ ' : '＋ ') + t}</Text>
          </Pressable>
        );
      })}
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <Button label="Create passport & get code" onPress={create} disabled={!name.trim() || !session.orgCode} />
      <SectionLabel>SET UP SO FAR</SectionLabel>
      {list.length === 0 ? <Text style={styles.muted}>No passports set up yet.</Text> : list.map((p, i) => (
        <Card key={str(p, 'id') || i} style={styles.listRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{str(p, 'name')}</Text>
            <Text style={styles.muted}>{[str(p, 'trade'), str(p, 'claim_code', 'claimCode')].filter(Boolean).join(' · ')}</Text>
          </View>
          <Text style={styles.del} onPress={() => del(str(p, 'id'))}>Delete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  code: { fontSize: 36, fontWeight: '900', color: colors.navy, letterSpacing: 4 },
  seg: { flexDirection: 'row', gap: spacing.sm },
  segBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#C9D6E3', backgroundColor: colors.white, alignItems: 'center' },
  chip: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#C9D6E3', backgroundColor: colors.white },
  segOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  segText: { fontSize: 17, fontWeight: '800', color: colors.navy },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
