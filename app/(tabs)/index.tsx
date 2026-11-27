import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useRouter } from 'expo-router';
import { Attribution, Button, Card, Pill, SectionLabel } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { certStatus, compliance } from '../../src/lib/passport';

const TONE = { valid: 'ok', expiring: 'warn', expired: 'bad', none: 'ok' } as const;

export default function PassportTab() {
  const router = useRouter();
  const { worker, ready } = useStore();
  const c = compliance(worker);
  const initial = (worker.name || '?').trim().charAt(0).toUpperCase();

  if (!ready) return null;
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card style={styles.headCard}>
        <Text style={styles.name}>{worker.name || 'Your name'}</Text>
        <Pill text={c.label} tone={c.tone} />
      </Card>

      <SectionLabel action="Edit" onAction={() => router.push('/(tabs)/profile')}>
        Profile
      </SectionLabel>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name2}>{worker.name || 'Add your name'}</Text>
          {worker.trade ? <Text style={styles.sub}>{worker.trade}</Text> : null}
          <Text style={styles.sub}>{worker.employer || 'Add your employer'}</Text>
        </View>
      </Card>

      <SectionLabel>Compliance status</SectionLabel>
      <Card>
        <View style={styles.row}>
          <Text style={styles.h}>Qualifications</Text>
          <Text style={styles.sub2}>
            {c.expired ? `🔴 ${c.expired} expired  ` : ''}
            {c.expiring ? `🟠 ${c.expiring} expiring  ` : ''}
            <Text style={{ color: colors.ok }}>●</Text> {c.valid} valid
          </Text>
        </View>
      </Card>

      <SectionLabel action="Add" onAction={() => router.push('/add-qualification')}>
        Qualifications
      </SectionLabel>
      {worker.qualifications.length === 0 ? (
        <Card>
          <Text style={styles.sub}>No tickets yet. Tap Add to scan your Safe Pass or any other ticket into your Passport.</Text>
        </Card>
      ) : (
        worker.qualifications.map((q) => {
          const s = certStatus(q);
          return (
            <Pressable key={q.id} onPress={() => router.push({ pathname: '/qualification/[id]', params: { id: q.id } })}>
            <Card style={styles.qCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h}>{q.name}</Text>
                <Text style={styles.sub}>{s.label}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: s.status === 'expired' ? colors.danger : s.status === 'expiring' ? colors.accent : colors.ok }]} />
              <Text style={styles.chev}>›</Text>
            </Card>
            </Pressable>
          );
        })
      )}

      <View style={{ height: spacing.md }} />
      <Button label="Show My Passport (QR)" onPress={() => router.push('/(tabs)/share')} />
      <Button label="Report a Hazard" variant="ghost" onPress={() => router.push('/(tabs)/hazards')} />
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.sm },
  headCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 30, fontWeight: '800', color: colors.text, flexShrink: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 84, height: 84, borderRadius: 20, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 38, fontWeight: '800' },
  name2: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { fontSize: 16, color: '#5F7385' },
  sub2: { fontSize: 16, color: '#5F7385', fontWeight: '600' },
  h: { fontSize: 22, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusDot: { width: 16, height: 16, borderRadius: 8 },
  chev: { fontSize: 32, color: '#5F7385', paddingHorizontal: 6 },
});
