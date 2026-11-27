import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Card, Field } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { claimWorker } from '../src/lib/api';
import { Qualification } from '../src/lib/passport';

// An employer sets up a passport and gives the worker a claim code; entering it fills the passport in.
export default function Claim() {
  const router = useRouter();
  const { worker, updateWorker } = useStore();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await claimWorker(code);
      if (!r) {
        setMsg('That code was not found. Check it and try again.');
        return;
      }
      const incoming: Qualification[] = (r.certs ?? []).map((c, i) => ({
        id: `q-claim-${Date.now()}-${i}`,
        name: String(c.name ?? c.certName ?? 'Ticket'),
        issuer: c.issuer ? String(c.issuer) : undefined,
        expires: c.expires ? new Date(String(c.expires)).toISOString() : undefined,
        verification: 'pending',
        addedByEmployer: true,
      }));
      const have = new Set(worker.qualifications.map((q) => q.name.trim().toLowerCase()));
      updateWorker({
        name: worker.name || r.name || '',
        trade: worker.trade || r.trade || '',
        qualifications: [...worker.qualifications, ...incoming.filter((q) => !have.has(q.name.trim().toLowerCase()))],
      });
      setMsg(`Done. Your passport has been filled in${incoming.length ? ` with ${incoming.length} ticket${incoming.length > 1 ? 's' : ''}` : ''}.`);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setMsg(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.h}>Have a claim code?</Text>
        <Text style={styles.sub}>If your employer set up your passport, enter their code to fill it in automatically.</Text>
        <Field label="Claim code" value={code} onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" />
        <Button label={busy ? 'Checking…' : 'Claim passport'} disabled={busy || !code.trim()} onPress={go} />
        {msg ? <Text style={styles.sub}>{msg}</Text> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { fontSize: 17, color: '#5F7385', lineHeight: 24 },
});
