import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button, Card } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { deleteCompany, listCompanies, rows, str } from '../src/lib/api';

// Layout and copy follow docs/reference/web-employer-12-companies.jpg.
export default function Companies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Record<string, unknown>[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setCompanies(rows(await listCompanies()));
    } catch (e) {
      setErr((e as Error).message);
      setCompanies([]);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  function confirmDelete(c: Record<string, unknown>) {
    const code = str(c, 'org_code', 'orgCode', 'code');
    if (!code) return Alert.alert('Missing company code');
    Alert.alert('Delete company?', `${str(c, 'name', 'org_name') || 'This company'} and its crew will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompany(code);
            load();
          } catch (e) {
            Alert.alert('Could not delete', (e as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.intro}>
        Set up a company once, then send them a claim code. They open Construction Passport, choose Employer, enter the code, and their company and crew are already there. Good for testers who would rather not fiddle with setup.
      </Text>
      <Button label="＋  Set up a new company" onPress={() => router.push('/company-new')} />
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      {companies === null ? null : companies.length === 0 ? (
        <Text style={styles.empty}>No companies set up yet. Tap “Set up a new company” to begin.</Text>
      ) : (
        companies.map((c, i) => {
          const claim = str(c, 'claim_code', 'claimCode');
          return (
            <Card key={str(c, 'org_code', 'orgCode') || i} style={{ gap: 4 }}>
              <Text style={styles.name}>{str(c, 'name', 'org_name') || 'Company'}</Text>
              {str(c, 'trade') ? <Text style={styles.muted}>{str(c, 'trade')}</Text> : null}
              <Text style={styles.muted}>Crew code {str(c, 'org_code', 'orgCode')}</Text>
              {claim ? (
                <View style={{ gap: 6, marginTop: spacing.xs }}>
                  <Text style={styles.muted}>Claim code</Text>
                  <Text style={styles.code} selectable>{claim}</Text>
                  <Text style={styles.link} onPress={() => Clipboard.setStringAsync(claim)}>Copy claim code</Text>
                </View>
              ) : null}
              <Text style={styles.del} onPress={() => confirmDelete(c)}>Delete company</Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  intro: { fontSize: 17, color: colors.muted, lineHeight: 24 },
  empty: { fontSize: 16, color: colors.muted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 22 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text },
  muted: { fontSize: 15, color: colors.muted },
  code: { fontSize: 26, fontWeight: '900', color: colors.navy, letterSpacing: 3 },
  link: { color: colors.navy, fontSize: 15, fontWeight: '700' },
  del: { color: colors.danger, fontSize: 15, fontWeight: '700', marginTop: spacing.sm },
});
