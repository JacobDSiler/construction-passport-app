import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { homeFor, useSession } from '../src/lib/session';

// Welcome screen. Anyone who already picked a role goes straight to their home.
export default function Welcome() {
  const router = useRouter();
  const { ready, session } = useSession();

  useEffect(() => {
    if (ready && session.role) router.replace(homeFor(session.role) as never);
  }, [ready, session.role, router]);

  if (!ready || session.role) return <SafeAreaView style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.emoji}>🦺</Text>
        <Text style={styles.title}>Construction Passport</Text>
        <Text style={styles.sub}>Your tickets, always in your pocket. Create an account so your passport is saved and never lost.</Text>
      </View>
      <View style={styles.bottom}>
        <Button label="Get started" variant="light" onPress={() => router.push('/role')} style={styles.stretch} />
        <Text style={styles.link} onPress={() => router.push('/login')}>
          I already have an account · Log in
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy, padding: spacing.lg, justifyContent: 'space-between' },
  top: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  emoji: { fontSize: 72 },
  title: { color: colors.white, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  sub: { color: '#C9D8E8', fontSize: 17, textAlign: 'center', lineHeight: 24 },
  bottom: { gap: spacing.md, alignItems: 'center', paddingBottom: spacing.lg },
  stretch: { alignSelf: 'stretch' },
  link: { color: colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center', paddingVertical: spacing.sm },
});
