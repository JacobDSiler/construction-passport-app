import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { AUDIT_CHECKS, AuditItem, SiteAudit, auditScore, loadSiteAudits, newRecordId, saveSiteAudits } from '../src/lib/records';

const RESULTS: { key: AuditItem['result']; label: string }[] = [
  { key: 'pass', label: 'OK' },
  { key: 'fail', label: 'Fail' },
  { key: 'na', label: 'N/A' },
];

export default function SiteAuditScreen() {
  const { worker } = useStore();
  const [audits, setAudits] = useState<SiteAudit[]>([]);
  const [site, setSite] = useState('');
  const [items, setItems] = useState<AuditItem[] | null>(null);

  useEffect(() => {
    loadSiteAudits().then(setAudits);
  }, []);

  function start() {
    if (!site.trim()) return Alert.alert('Name the site first');
    setItems(AUDIT_CHECKS.map((c) => ({ ...c, result: 'pass' as const, note: '' })));
  }

  function setItem(i: number, patch: Partial<AuditItem>) {
    setItems((cur) => (cur ? cur.map((it, j) => (j === i ? { ...it, ...patch } : it)) : cur));
  }

  async function finish() {
    if (!items) return;
    const a: SiteAudit = {
      id: newRecordId('audit'),
      at: new Date().toISOString(),
      site: site.trim(),
      inspector: worker.name,
      items,
      score: auditScore(items),
    };
    const next = [a, ...audits];
    setAudits(next);
    await saveSiteAudits(next);
    setItems(null);
    setSite('');
    Alert.alert('Audit saved', `Score ${a.score}%. Kept on this phone only.`);
  }

  async function remove(id: string) {
    const next = audits.filter((a) => a.id !== id);
    setAudits(next);
    await saveSiteAudits(next);
  }

  if (items) {
    const failed = items.filter((i) => i.result === 'fail').length;
    return (
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>{site}</Text>
        <Text style={styles.muted}>Score so far: {auditScore(items)}% · {failed} fail</Text>
        {AUDIT_CHECKS.map((c, i) => {
          const it = items[i];
          const showSection = i === 0 || AUDIT_CHECKS[i - 1].section !== c.section;
          return (
            <View key={c.label} style={{ gap: spacing.sm }}>
              {showSection ? <SectionLabel>{c.section.toUpperCase()}</SectionLabel> : null}
              <Card>
                <Text style={styles.row}>{c.label}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  {RESULTS.map((r) => (
                    <Pressable key={r.key} style={[styles.chip, it.result === r.key && styles.chipOn]} onPress={() => setItem(i, { result: r.key })}>
                      <Text style={[styles.chipText, it.result === r.key && { color: colors.white }]}>{r.label}</Text>
                    </Pressable>
                  ))}
                </View>
                {it.result === 'fail' ? <Field label="What needs fixing" value={it.note} onChangeText={(t) => setItem(i, { note: t })} placeholder="Describe the problem and the fix" multiline /> : null}
              </Card>
            </View>
          );
        })}
        <Button label="Finish and save audit" onPress={finish} />
        <Button label="Cancel" variant="ghost" onPress={() => setItems(null)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.muted}>A starting checklist of common site checks. Score is the share of applicable checks that passed. Saved on this phone only.</Text>
      <Card>
        <Field label="Site" value={site} onChangeText={setSite} placeholder="Site name or address" />
        <Button label="Start audit" onPress={start} disabled={!site.trim()} />
      </Card>
      <SectionLabel>{`PAST AUDITS (${audits.length})`}</SectionLabel>
      {audits.length === 0 ? <Text style={styles.muted}>No audits yet.</Text> : null}
      {audits.map((a) => (
        <Card key={a.id}>
          <Text style={styles.row}>{a.site}</Text>
          <Text style={styles.muted}>{new Date(a.at).toLocaleDateString('en-IE')} · Score {a.score}% · {a.items.filter((i) => i.result === 'fail').length} fail</Text>
          {a.items.filter((i) => i.result === 'fail').map((i) => (
            <Text key={i.label} style={[styles.muted, { color: colors.danger }]}>• {i.label}{i.note ? `: ${i.note}` : ''}</Text>
          ))}
          <Text style={styles.del} onPress={() => remove(a.id)}>Delete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 24, fontWeight: '900', color: colors.text },
  row: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 23 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  chip: { flex: 1, borderWidth: 2, borderColor: colors.navy, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  chipOn: { backgroundColor: colors.navy },
  chipText: { color: colors.navy, fontWeight: '800', fontSize: 15 },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
