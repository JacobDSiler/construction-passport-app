import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../theme';
import { ATTRIBUTION_LINE, CTA_LINE } from '../lib/attribution';
import { useI18n } from '../lib/i18n';

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'light' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === 'ghost' && styles.btnGhost,
        variant === 'light' && styles.btnLight,
        variant === 'danger' && styles.btnDanger,
        (pressed || disabled) && { opacity: disabled ? 0.5 : 0.8 },
        style,
      ]}
    >
      <Text style={[styles.btnText, (variant === 'ghost' || variant === 'light') && styles.btnTextGhost]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Attribution() {
  return (
    <View style={styles.attr}>
      <Text style={styles.attrStrong}>{ATTRIBUTION_LINE}</Text>
      <Text style={styles.attrText}>{CTA_LINE}</Text>
    </View>
  );
}

export function SectionLabel({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {action ? (
        <Text style={styles.sectionAction} onPress={onAction}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Pill({ text, tone }: { text: string; tone: 'ok' | 'warn' | 'bad' | 'none' }) {
  const fg = tone === 'ok' ? colors.ok : tone === 'warn' ? '#B7791F' : tone === 'bad' ? colors.danger : colors.muted;
  const bg = tone === 'ok' ? '#E6F4EA' : tone === 'warn' ? '#FDF3DC' : tone === 'bad' ? '#FBE5E2' : '#EDF1F5';
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const { bi } = useI18n();
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor="#9AA9B8" {...props} placeholder={props.placeholder ? bi(props.placeholder, ' / ') : props.placeholder} style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} />
    </View>
  );
}

/** Dropdown that opens a simple list modal (month, year, etc.). */
export function Select<T extends string | number>({
  placeholder,
  value,
  options,
  onChange,
  format,
}: {
  placeholder: string;
  value: T | undefined;
  options: T[];
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const fmt = format ?? String;
  return (
    <>
      <Pressable style={[styles.input, styles.select]} onPress={() => setOpen(true)}>
        <Text style={[styles.selectText, value === undefined && { color: '#9AA9B8' }]}>{value === undefined ? placeholder : fmt(value)}</Text>
        <Text style={{ color: colors.muted }}>▾</Text>
      </Pressable>
      <Sheet visible={open} title={placeholder} onClose={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((o) => (
            <Pressable
              key={String(o)}
              style={styles.option}
              onPress={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <Text style={[styles.optionText, o === value && { fontWeight: '800', color: colors.navy }]}>{fmt(o)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </>
  );
}

export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Text style={styles.sectionAction} onPress={onClose}>
              Close ✕
            </Text>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.navy, paddingVertical: 15, paddingHorizontal: spacing.lg, borderRadius: 14, alignItems: 'center' },
  btnLight: { backgroundColor: colors.white },
  btnGhost: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.navy },
  btnDanger: { backgroundColor: colors.danger },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  btnTextGhost: { color: colors.navy },
  card: { backgroundColor: colors.white, borderRadius: 18, padding: spacing.md, borderWidth: 1, borderColor: '#E1E7EE', gap: spacing.sm },
  attr: { paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  attrStrong: { fontSize: 12, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  attrText: { fontSize: 12, color: colors.muted },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 1, color: '#55677A', textTransform: 'uppercase' },
  sectionAction: { fontSize: 16, fontWeight: '800', color: colors.navy },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  pillText: { fontSize: 16, fontWeight: '800' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#55677A' },
  input: { borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: colors.text, backgroundColor: colors.white },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
  selectText: { fontSize: 18, color: colors.text },
  option: { paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  optionText: { fontSize: 18, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(8,20,32,0.55)', justifyContent: 'center', padding: spacing.md },
  sheet: { backgroundColor: colors.white, borderRadius: 20, padding: spacing.md, gap: spacing.sm, maxHeight: '88%' },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
});
