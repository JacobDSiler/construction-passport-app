import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { logOut } from '../src/lib/account';

const OPTIONS = [
  { key: 'worker', emoji: '👷', title: "I'm a worker", sub: 'Keep my Safe Pass, tickets and inductions in one place.', href: '/setup-worker' },
  { key: 'company', emoji: '🏗️', title: 'I run a crew or company', sub: "See my crew's tickets and manage site paperwork.", href: '/setup-company' },
  { key: 'trainer', emoji: '🎓', title: "I'm a training provider", sub: 'Run courses, collect student details & questionnaires, and post certs.', href: '/setup-trainer' },
] as const;

export default function RolePicker() {
  const router = useRouter();
  const { session, reset } = useSession();
  const loggedIn = Boolean(session.email);

  return (
    <SafeAreaView style={styles.screen}>
      {!loggedIn ? (
        <Text style={styles.back} onPress={() => router.back()}>
          ‹ Back
        </Text>
      ) : null}
      <Text style={styles.h1}>First up — which are you?</Text>
      <Text style={styles.sub}>You can change this later.</Text>
      {!loggedIn ? (
        <Text style={styles.login} onPress={() => router.push('/login')}>
          Already have an account? Log in
        </Text>
      ) : null}
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {OPTIONS.map((o, i) => (
          <Pressable key={o.key} style={[styles.card, i === 0 && styles.cardPrimary]} onPress={() => router.push(o.href as never)}>
            <Text style={styles.emoji}>{o.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, i === 0 && { color: '#111' }]}>{o.title}</Text>
              <Text style={[styles.cardSub, i === 0 && { color: '#555' }]}>{o.sub}</Text>
            </View>
            <Text style={[styles.chev, i === 0 && { color: '#111' }]}>›</Text>
          </Pressable>
        ))}
      </View>
      {loggedIn ? (
        <Text
          style={styles.login}
          onPress={async () => {
            await logOut();
            reset();
          }}
        >
          Not you? Log out
        </Text>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy, padding: spacing.lg, gap: spacing.sm },
  back: { color: colors.white, fontSize: 18, fontWeight: '700', paddingVertical: spacing.sm },
  h1: { color: colors.white, fontSize: 30, fontWeight: '800', marginTop: spacing.md },
  sub: { color: '#C9D8E8', fontSize: 17 },
  login: { color: colors.white, fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 20, backgroundColor: '#2A6195' },
  cardPrimary: { backgroundColor: colors.white },
  emoji: { fontSize: 40 },
  title: { color: colors.white, fontSize: 21, fontWeight: '800' },
  cardSub: { color: '#C9D8E8', fontSize: 16, marginTop: 2 },
  chev: { color: '#8FB0D0', fontSize: 28 },
});
