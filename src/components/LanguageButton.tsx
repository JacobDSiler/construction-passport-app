import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Sheet } from './ui';
import { colors, spacing } from '../theme';
import { LANGUAGES } from '../i18n/languages';
import { useI18n } from '../lib/i18n';

/** Picks the second language shown next to English. English is always shown. */
export function LanguageButton({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={[styles.btn, light && styles.btnLight]}>
        <Text style={[styles.btnText, light && { color: colors.white }]}>{`🌐 ${current ? current.name : 'Language'}`}</Text>
      </Pressable>
      <Sheet visible={open} title="Show a second language next to English" onClose={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 420 }}>
          <Pressable style={styles.option} onPress={() => { setLang('en'); setOpen(false); }}>
            <Text style={[styles.optionText, lang === 'en' && styles.on]}>English only</Text>
          </Pressable>
          {LANGUAGES.map((l) => (
            <Pressable key={l.code} style={styles.option} onPress={() => { setLang(l.code); setOpen(false); }}>
              <View>
                <Text style={[styles.optionText, lang === l.code && styles.on]}>{l.name}</Text>
                <Text style={styles.small}>{l.english}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.note}>English always stays on screen, so your crew and bosses can read along with you.</Text>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  btnLight: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)' },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  optionText: { fontSize: 18, color: colors.text },
  on: { fontWeight: '800', color: colors.navy },
  small: { fontSize: 13, color: colors.muted },
  note: { marginTop: spacing.md, color: colors.muted, fontSize: 14 },
});
