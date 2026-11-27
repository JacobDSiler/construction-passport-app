import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { addCrewMember, CrewAssignment, CrewType } from '../src/lib/api';

function Seg<T extends string>({ value, options, onChange }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <View style={styles.seg}>
      {options.map(([v, label]) => (
        <Pressable key={v} onPress={() => onChange(v)} style={[styles.segBtn, value === v && styles.segOn]}>
          <Text style={[styles.segText, value === v && { color: colors.white }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Add a worker to the crew by the 6-character code on their Share tab. (Scan their QR code or type the code.)
export default function CrewAdd() {
  const router = useRouter();
  const { session } = useSession();
  const [code, setCode] = useState('');
  const [type, setType] = useState<CrewType>('employee');
  const [assignment, setAssignment] = useState<CrewAssignment>('crew');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();

  async function startScan() {
    if (!perm?.granted) {
      const r = await requestPerm();
      if (!r.granted) return setErr('Camera permission is needed to scan. You can type the code instead.');
    }
    setErr(null);
    setScanning(true);
  }

  // Accepts a full passport link (…?p=ABC123) or a bare code.
  function onScanned(data: string) {
    const m = /[?&]p=([A-Za-z0-9]{4,12})/.exec(data);
    const c = (m ? m[1] : data.trim()).toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(c)) return setErr("That QR code isn't a Construction Passport.");
    setCode(c);
    setScanning(false);
  }

  async function go() {
    if (!session.orgCode) return setErr('Your company has no code yet. Set it up again from Profile.');
    setBusy(true);
    setErr(null);
    try {
      await addCrewMember(session.orgCode, code.trim(), type, assignment);
      router.back();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {scanning ? (
        <View style={{ gap: spacing.sm }}>
          <CameraView style={{ height: 320, borderRadius: 16, overflow: 'hidden' }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => onScanned(data)} />
          <Button label="Cancel scan" onPress={() => setScanning(false)} />
        </View>
      ) : (
        <Button label="Scan worker's QR code" onPress={startScan} />
      )}
      <Field label="Worker passport code" value={code} onChangeText={setCode} placeholder="6 characters" autoCapitalize="characters" autoCorrect={false} />
      <Text style={styles.help}>The worker finds this on the Share tab of their app. It's the short code at the end of their passport link, after "?p=".</Text>
      <Text style={styles.label}>They are</Text>
      <Seg value={type} onChange={setType} options={[['employee', 'Employee'], ['subcontractor', 'Subcontractor']]} />
      <Text style={styles.label}>Right now</Text>
      <Seg value={assignment} onChange={setAssignment} options={[['crew', 'On the crew'], ['none', 'Not on a crew']]} />
      <Text style={styles.help}>"Not on a crew" keeps them with the company without being on a crew today, handy for a subcontractor between jobs or someone out scouting sites.</Text>
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Adding…' : 'Add to crew'} onPress={go} disabled={busy || code.trim().length < 4} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  label: { fontSize: 16, fontWeight: '800', color: '#55677A' },
  help: { fontSize: 15, color: colors.muted, lineHeight: 21 },
  seg: { flexDirection: 'row', gap: spacing.sm },
  segBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#C9D6E3', backgroundColor: colors.white, alignItems: 'center' },
  segOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  segText: { fontSize: 17, fontWeight: '800', color: colors.navy },
});
