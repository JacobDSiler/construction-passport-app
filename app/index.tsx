import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { colors, spacing } from '../src/theme';

// Welcome screen, mirroring the live app: vest emoji, tagline, create account / log in / try on this device.
export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.emoji}>🦺</Text>
        <Text style={styles.title}>Construction Passport</Text>
        <Text style={styles.sub}>
          Your tickets, always in your pocket. Create an account so your passport is saved and never lost.
        </Text>
      </View>
      <View style={styles.bottom}>
        {/* TODO: wire account creation and login to claim_worker / claim_passport once flows are confirmed from screenshots. */}
        <Button label="Create account" variant="light" onPress={() => router.replace('/(tabs)')} style={styles.stretch} />
        <Text style={styles.link} onPress={() => router.replace('/(tabs)')}>
          I already have an account · Log in
        </Text>
        <Text style={styles.link} onPress={() => router.replace('/(tabs)')}>
          Just try it on this device
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
