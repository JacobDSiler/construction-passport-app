import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

/** Light, scrollable form page used by every first-run step (back link, optional step label, title, subtitle). */
export function SetupScreen({ step, title, subtitle, children }: { step?: string; title: string; subtitle: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.back} onPress={() => router.back()}>
            ‹ Back
          </Text>
          {step ? <Text style={styles.step}>{step}</Text> : null}
          <Text style={styles.h1}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 80 },
  back: { color: colors.navy, fontSize: 18, fontWeight: '800', paddingVertical: spacing.sm },
  step: { color: colors.muted, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  h1: { color: '#111', fontSize: 32, fontWeight: '900', marginTop: spacing.sm },
  sub: { color: colors.muted, fontSize: 18, lineHeight: 26 },
});
