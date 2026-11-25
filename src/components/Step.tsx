import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

/** Onboarding step page: back link, "Step n of 6", emoji, title, body text, then the step's controls. */
export function Step({ n, emoji, title, text, children }: { n?: number; emoji: string; title: string; text: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.back} onPress={() => router.back()}>
          ‹ Back
        </Text>
        {n ? <Text style={styles.step}>{`STEP ${n} OF 6`}</Text> : null}
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.sub}>{text}</Text>
        <View style={{ gap: spacing.md, marginTop: spacing.sm }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 80 },
  back: { color: colors.navy, fontSize: 18, fontWeight: '800', paddingVertical: spacing.sm },
  step: { color: colors.muted, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  emoji: { fontSize: 44, marginTop: spacing.sm },
  h1: { color: '#111', fontSize: 32, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 18, lineHeight: 26 },
});
