import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { createSite, deleteSite, listSites, rows, str } from '../src/lib/api';

export default function Sites() {
  const { session } = useSession();
  const [sites, setSites] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.orgCode) return;
    try {
      setSites(rows(await listSites(session.orgCode)));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [session.orgCode]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() {
    try {
      setErr(null);
      await createSite(session.orgCode!, { name: name.trim(), location: loc.trim() || null });
      setName('');
      setLoc('');
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  async function remove(id: string) {
    try {
      await deleteSite(id);
      load();
    } catch (e) {
      Alert.alert('Could not delete', (e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <SectionLabel>YOUR CREW CODE</SectionLabel>
      <Card>
        <Text style={styles.code} selectable>{session.orgCode ?? '—'}</Text>
        <Text style={styles.muted}>Give this to your workers. When they enter it, their timesheet shows your sites.</Text>
        <Button label="Copy code" variant="ghost" onPress={() => session.orgCode && Clipboard.setStringAsync(session.orgCode)} />
      </Card>
      <SectionLabel>YOUR SITES</SectionLabel>
      {sites.length === 0 ? <Text style={styles.muted}>No sites yet. Add your first one below.</Text> : sites.map((s, i) => (
        <Card key={str(s, 'id') || i} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{str(s, 'name')}</Text>
            {str(s, 'location') ? <Text style={styles.muted}>{str(s, 'location')}</Text> : null}
          </View>
          <Text style={styles.del} onPress={() => remove(str(s, 'id'))}>Delete</Text>
        </Card>
      ))}
      <SectionLabel>ADD A SITE</SectionLabel>
      <Field label="Site name" value={name} onChangeText={setName} placeholder="Site name" />
      <Field label="Location (address or Eircode, optional)" value={loc} onChangeText={setLoc} placeholder="Address or town" />
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <Button label="Add site" onPress={add} disabled={!name.trim()} />
      <Text style={styles.muted}>A location here powers the site weather feature coming next.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  code: { fontSize: 36, fontWeight: '900', color: colors.navy, letterSpacing: 4 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
