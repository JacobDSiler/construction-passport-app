import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';
import { ATTRIBUTION_LINE, CTA_LINE } from '../lib/attribution';

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'light';
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.btn, variant === 'ghost' && styles.btnGhost, variant === 'light' && styles.btnLight, pressed && { opacity: 0.8 }, style]}
    >
      <Text style={[styles.btnText, (variant === 'ghost' || variant === 'light') && styles.btnTextGhost]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Attribution() {
  return (
    <View style={styles.attr}>
      <Text style={styles.attrStrong}>{ATTRIBUTION_LINE}</Text>
      <Text style={styles.attrText}>{CTA_LINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.navy, paddingVertical: 14, paddingHorizontal: spacing.lg, borderRadius: 12, alignItems: 'center' },
  btnLight: { backgroundColor: colors.white },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  btnTextGhost: { color: colors.navy },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  attr: { paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  attrStrong: { fontSize: 12, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  attrText: { fontSize: 12, color: colors.muted },
});
