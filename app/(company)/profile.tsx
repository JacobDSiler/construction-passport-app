import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Field } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useSession } from '../../src/lib/session';
import { logOut } from '../../src/lib/account';

const ROWS: Array<[string, string, string, string]> = [
  ['📍', 'Manage sites', 'Create your sites and share the crew code so timesheets show real sites.', '/sites'],
  ['🪪', 'Set up worker passports', "Build a worker's tickets before they have the app, then send them a claim code.", '/provision'],
  ['🧾', 'Crew expenses', 'See company expenses your crew submitted.', '/crew-expenses'],
  ['📋', 'Job sheet', 'Fill in a job sheet for the day and export it as a PDF.', '/job-sheet'],
  ['📔', 'Site diary', 'Daily log of work, crew on site, deliveries, delays and visitors.', '/site-diary'],
  ['✅', 'Site audit', 'Audit a site with your own points. Pass, fail or N/A, with the defects written up.', '/site-audit'],
  ['🏢', "Companies you've set up", 'Set up a company for a client or tester, then send them a claim code.', '/companies'],
  ['🆘', 'Support', 'Free, confidential helplines, including one built for construction. Any hour.', '/support'],
];

// Employer profile. Companies-you've-set-up and certifier access follow.
export default function CompanyProfile() {
  const router = useRouter();
  const { session, update, reset } = useSession();
  const [name, setName] = useState(session.orgName ?? '');

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.small}>USING AS</Text>
        <Text style={styles.h}>Employer / Contractor</Text>
        <Text style={styles.muted}>{session.orgName}</Text>
        <Text style={styles.switch} onPress={() => { update({ role: 'worker' }); router.replace('/(tabs)'); }}>Switch to worker</Text>
      </Card>
      <Card>
        <Field label="Company / organisation name" value={name} onChangeText={setName} />
        <Text style={styles.muted}>This is the name recorded when you greenlight a worker.</Text>
        <Button label="Save" onPress={() => update({ orgName: name.trim() })} disabled={!name.trim() || name.trim() === session.orgName} />
      </Card>
      {ROWS.map(([icon, title, sub, href]) => (
        <Pressable key={title} onPress={() => router.push(href as never)}>
          <Card style={styles.row}>
            <Text style={{ fontSize: 28 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.muted}>{sub}</Text>
            </View>
            <Text style={{ fontSize: 26, color: colors.muted }}>›</Text>
          </Card>
        </Pressable>
      ))}
      <Button label="Log out" variant="ghost" onPress={async () => { await logOut(); reset(); router.replace('/'); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md, paddingBottom: 60 },
  small: { fontSize: 13, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  h: { fontSize: 22, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  switch: { color: colors.navy, fontWeight: '800', fontSize: 16, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
});
