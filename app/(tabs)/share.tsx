import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Attribution, Button, Card, Pill } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { compliance, publicPassportUrl } from '../../src/lib/passport';
import { exportPassportPdf, passportShareText } from '../../src/lib/exports';
import { setUploadConsent } from '../../src/lib/api';
import { loadJson, saveJson } from '../../src/lib/storage';

const CONSENT_KEY = 'cp.allowEmpUploads.v1';

export default function ShareTab() {
  const { worker, shortCode, publish, ready } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allow, setAllow] = useState(false);
  const c = compliance(worker);

  useEffect(() => {
    loadJson<boolean>(CONSENT_KEY, false).then(setAllow);
  }, []);

  const doPublish = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await publish();
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }, [publish]);

  // First time on this tab: create the shareable passport.
  useEffect(() => {
    if (ready && !shortCode && !busy && !error) doPublish();
  }, [ready, shortCode, busy, error, doPublish]);

  async function toggleConsent(v: boolean) {
    setAllow(v);
    saveJson(CONSENT_KEY, v);
    try {
      await setUploadConsent(v);
    } catch {
      /* will sync next time */
    }
  }

  const url = shortCode ? publicPassportUrl(shortCode) : null;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card style={{ alignItems: 'center' }}>
        <Text style={styles.name}>{worker.name || 'Your name'}</Text>
        <Text style={styles.id}>{worker.id}</Text>
        <View style={styles.qrBox}>
          {url ? <QRCode value={url} size={240} /> : busy ? <ActivityIndicator size="large" color={colors.navy} /> : <Text style={styles.id}>QR appears once your passport is shared.</Text>}
        </View>
        <Pill text={c.label} tone={c.tone} />
        <Text style={styles.help}>Show this to a contractor. They scan it with any phone camera — no app needed — to see your passport, your cert photos, and confirm you.</Text>
      </Card>

      {error ? (
        <Card>
          <Text style={{ color: colors.danger, fontSize: 16 }}>Could not share your passport yet: {error}</Text>
          <Button label="Try again" onPress={doPublish} />
        </Card>
      ) : url ? (
        <Text style={styles.ok}>Shared passport up to date ✓</Text>
      ) : null}
      <Text style={styles.small}>Any change you make — add, edit or remove a ticket — updates automatically. Only people you show it to can see it.</Text>

      <Card style={styles.switchCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h}>Let my employer add certs</Text>
          <Text style={styles.small2}>Allow your employer to add certificates to your passport. You stay in control — turn it off anytime, and you can remove anything they add.</Text>
        </View>
        <Switch value={allow} onValueChange={toggleConsent} trackColor={{ true: '#7CC8BC' }} />
      </Card>

      <View style={styles.three}>
        <Button label="👁 View as public" variant="ghost" style={styles.third} disabled={!url} onPress={() => url && Linking.openURL(url)} />
        <Button
          label="🔗 Copy"
          variant="ghost"
          style={styles.third}
          disabled={!url}
          onPress={async () => {
            if (url) {
              await Clipboard.setStringAsync(url);
              Alert.alert('Copied', 'Your passport link is on the clipboard.');
            }
          }}
        />
        <Button label="📤 Share via…" variant="ghost" style={styles.third} disabled={!shortCode} onPress={() => shortCode && Share.share({ message: passportShareText(worker, shortCode) })} />
      </View>
      <Button label="📄 Save as PDF" variant="ghost" onPress={() => exportPassportPdf(worker, shortCode).catch((e) => Alert.alert('PDF failed', String(e?.message ?? e)))} />

      {url ? (
        <>
          <Text style={styles.cap}>The link your QR opens — tap to preview what an employer sees</Text>
          <Card>
            <Text style={styles.link} onPress={() => Linking.openURL(url)}>
              {url}
            </Text>
          </Card>
        </>
      ) : null}
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  name: { fontSize: 32, fontWeight: '800', color: colors.text },
  id: { fontSize: 18, color: '#5F7385', marginVertical: 6 },
  qrBox: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#D6DEE6', minHeight: 268, minWidth: 268, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.sm },
  help: { fontSize: 18, color: '#5F7385', textAlign: 'center', lineHeight: 26, marginTop: spacing.sm },
  ok: { fontSize: 22, fontWeight: '800', color: colors.ok, textAlign: 'center' },
  small: { fontSize: 16, color: '#5F7385', textAlign: 'center', lineHeight: 23 },
  small2: { fontSize: 15, color: '#5F7385', lineHeight: 22 },
  h: { fontSize: 20, fontWeight: '800', color: colors.text },
  switchCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  three: { flexDirection: 'row', gap: spacing.sm },
  third: { flex: 1, paddingHorizontal: 6 },
  cap: { fontSize: 13, fontWeight: '800', letterSpacing: 1, color: '#55677A', textTransform: 'uppercase' },
  link: { fontSize: 17, color: colors.navy, textDecorationLine: 'underline' },
});
