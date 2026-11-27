import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../src/components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { logOut } from '../src/lib/account';
import { certifyPassport, clearCertifierCode, getCertifierCode, listReviewPassports, revokeCertification } from '../src/lib/certifier';
import { str } from '../src/lib/api';

// Certifier home: passports waiting for review, with certify and revoke.
export default function Certifier() {
  const router = useRouter();
  const { reset } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [passports, setPassports] = useState<Record<string, unknown>[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const c = await getCertifierCode();
    setCode(c);
    if (!c) return;
    try {
      setErr(null);
      setPassports(await listReviewPassports(c));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function act(kind: 'certify' | 'revoke', p: Record<string, unknown>) {
    if (!code) return;
    const short = str(p, 'short_code', 'shortCode', 'code');
    if (!short) return Alert.alert('Missing passport code');
    try {
      if (kind === 'certify') await certifyPassport(code, short);
      else await revokeCertification(code, short);
      load();
    } catch (e) {
      Alert.alert(kind === 'certify' ? 'Could not certify' : 'Could not revoke', (e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.h1}>Certifier</Text>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>{`PASSPORTS FOR REVIEW (${passports.length})`}</SectionLabel>
      {passports.length === 0 ? (
        <Card><Text style={styles.muted}>Nothing waiting for review.</Text></Card>
      ) : (
        passports.map((p, i) => (
          <Card key={str(p, 'short_code', 'shortCode') || i}>
            <Text style={styles.row}>{str(p, 'name', 'worker_name') || 'Passport'}</Text>
            <Text style={styles.muted}>{[str(p, 'trade'), str(p, 'short_code', 'shortCode')].filter(Boolean).join(' · ')}</Text>
            <Button label="Certify" onPress={() => act('certify', p)} />
            <Text style={styles.del} onPress={() => act('revoke', p)}>Revoke certification</Text>
          </Card>
        ))
      )}
      <Button
        label="Log out"
        variant="ghost"
        onPress={async () => {
          await clearCertifierCode();
          await logOut();
          reset();
          router.replace('/');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted, fontSize: 16 },
  row: { fontSize: 18, fontWeight: '700', color: colors.text },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
