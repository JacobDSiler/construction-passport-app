import { useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Field, Pill, Select } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { certStatus, Qualification } from '../../src/lib/passport';
import { MONTHS, monthYearToDate } from '../../src/lib/dates';
import { getStamp } from '../../src/lib/photos';

const thisYear = new Date().getFullYear();
const EXPIRY_YEARS = Array.from({ length: 16 }, (_, i) => thisYear - 1 + i);
const ISSUE_YEARS = Array.from({ length: 25 }, (_, i) => thisYear - i);

type Side = 'front' | 'back';

export default function QualificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { worker, upsertQualification, removeQualification } = useStore();
  const q = worker.qualifications.find((x) => x.id === id);
  const [zoom, setZoom] = useState<string | null>(null);
  if (!q) return <Text style={{ padding: spacing.md }}>Ticket not found.</Text>;

  const s = certStatus(q);
  const exp = q.expires ? new Date(q.expires) : undefined;
  const iss = q.issued ? new Date(q.issued) : undefined;
  const save = (patch: Partial<Qualification>) => upsertQualification({ ...q, ...patch });

  async function capture(side: Side, mode: 'scan' | 'camera' | 'library') {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (mode === 'library') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to choose a picture of your ticket.');
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true });
      } else {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed', 'Allow camera access to photograph your ticket.');
        // Smart Scan uses the crop step so the ticket is framed flat. A full auto-crop scanner needs a native build (later).
        result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: mode === 'scan' });
      }
      if (result.canceled || !result.assets?.[0]) return;
      const stamp = await getStamp(); // date and GPS stamp
      const uri = result.assets[0].uri;
      const stamps = { ...(q!.stamps ?? {}), [side]: stamp };
      save(side === 'front' ? { imageUri: uri, stamps } : { imageBackUri: uri, stamps });
    } catch (e) {
      Alert.alert('Could not add the photo', String((e as Error).message ?? e));
    }
  }

  function remove() {
    Alert.alert('Remove this ticket?', `${q!.name} will be taken off your Passport.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeQualification(q!.id);
          router.back();
        },
      },
    ]);
  }

  const imageBlock = (side: Side) => {
    const uri = side === 'front' ? q.imageUri : q.imageBackUri;
    const label = side === 'front' ? 'Certificate — front' : 'Certificate — back (optional)';
    return (
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.label}>{label}</Text>
        {uri ? (
          <Pressable onPress={() => setZoom(uri)}>
            <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
            <Text style={styles.tap}>Tap to enlarge</Text>
          </Pressable>
        ) : null}
        <Button label={`📐 Smart Scan (${side})`} onPress={() => capture(side, 'scan')} />
        <Button label={`📷 Take Photo (${side})`} variant="ghost" onPress={() => capture(side, 'camera')} />
        <Button label="🖼️ Choose from Library" variant="ghost" onPress={() => capture(side, 'library')} />
        {q.stamps?.[side] ? <Text style={styles.stamp}>{stampText(q.stamps[side]!)}</Text> : null}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Field label="Ticket name" value={q.name} onChangeText={(name) => save({ name })} />
        <Pill text={s.label} tone={s.status === 'expired' ? 'bad' : s.status === 'expiring' ? 'warn' : 'ok'} />
        {!q.expires ? <Text style={styles.warn}>⚠ No expiry date on record</Text> : null}

        <Text style={styles.label}>Expiry (month & year)</Text>
        <View style={styles.pair}>
          <Select placeholder="Month" value={exp?.getMonth()} options={[...Array(12).keys()]} format={(m) => MONTHS[m]} onChange={(m) => save({ expires: monthYearToDate(m, exp?.getFullYear() ?? thisYear, true).toISOString() })} />
          <Select placeholder="Year" value={exp?.getFullYear()} options={EXPIRY_YEARS} onChange={(y) => save({ expires: monthYearToDate(exp?.getMonth() ?? 11, y, true).toISOString() })} />
        </View>

        <Text style={styles.label}>Issue date (month & year)</Text>
        <View style={styles.pair}>
          <Select placeholder="Month" value={iss?.getMonth()} options={[...Array(12).keys()]} format={(m) => MONTHS[m]} onChange={(m) => save({ issued: monthYearToDate(m, iss?.getFullYear() ?? thisYear, false).toISOString() })} />
          <Select placeholder="Year" value={iss?.getFullYear()} options={ISSUE_YEARS} onChange={(y) => save({ issued: monthYearToDate(iss?.getMonth() ?? 0, y, false).toISOString() })} />
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{q.verification === 'verified' ? 'Verified' : q.verification === 'pending' ? 'Pending' : 'Self-listed'}</Text>
        </View>

        {imageBlock('front')}
        {imageBlock('back')}
        <Text style={styles.note}>
          Smart Scan crops the ticket flat. Take Photo uses your plain camera. Any change here updates your shared passport automatically.
        </Text>
      </Card>
      <Text style={styles.remove} onPress={remove}>
        Remove this ticket
      </Text>

      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <Pressable style={styles.zoomBg} onPress={() => setZoom(null)}>
          {zoom ? <Image source={{ uri: zoom }} style={styles.zoomImg} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function stampText(s: { at: string; lat?: number; lng?: number }): string {
  const d = new Date(s.at);
  const when = d.toLocaleString('en-IE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return s.lat != null ? `📍 ${when} · ${s.lat}, ${s.lng}` : `🕒 ${when}`;
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  label: { fontSize: 16, fontWeight: '700', color: '#55677A', marginTop: 6 },
  pair: { flexDirection: 'row', gap: spacing.sm },
  warn: { fontSize: 17, fontWeight: '700', color: '#E08A00' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E3E9EF', marginVertical: 6 },
  statusLabel: { fontSize: 18, color: '#5F7385' },
  statusValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  photo: { width: '100%', height: 220, borderRadius: 14, backgroundColor: '#E3E9EF' },
  tap: { textAlign: 'center', color: '#5F7385', marginTop: 4, fontSize: 16 },
  stamp: { fontSize: 13, color: '#5F7385', textAlign: 'center' },
  note: { fontSize: 15, color: '#5F7385', textAlign: 'center', lineHeight: 21, marginTop: 6 },
  remove: { textAlign: 'center', color: colors.danger, fontSize: 18, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: spacing.md },
  zoomBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' },
  zoomImg: { width: '100%', height: '80%' },
});
