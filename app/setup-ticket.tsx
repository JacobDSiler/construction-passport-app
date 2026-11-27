import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Select } from '../src/components/ui';
import { Step } from '../src/components/Step';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { pickPhoto } from '../src/lib/pick';
import { MONTHS, monthYearToDate } from '../src/lib/dates';
import { Qualification } from '../src/lib/passport';
import { Stamp } from '../src/lib/photos';

const thisYear = new Date().getFullYear();
const EXPIRY_YEARS = Array.from({ length: 16 }, (_, i) => thisYear - 1 + i);
const ISSUE_YEARS = Array.from({ length: 25 }, (_, i) => thisYear - i);

const KINDS = {
  safepass: {
    n: 3,
    emoji: '🦺',
    title: 'Safe Pass',
    name: 'Safe Pass',
    text: 'Nearly every worker needs a valid Safe Pass to be on an Irish site. Scan the front of the card, the back, and add its expiry.',
    next: { pathname: '/setup-ticket', params: { kind: 'manual' } },
    issue: false,
  },
  manual: {
    n: 4,
    emoji: '📦',
    title: 'Manual Handling',
    name: 'Manual Handling',
    text: 'The other one almost every site asks for. Scan both sides of your Manual Handling cert and add its expiry.',
    next: { pathname: '/setup-tickets' },
    issue: true,
  },
} as const;

// Steps 3 and 4: Safe Pass and Manual Handling, with front/back scan and expiry.
export default function SetupTicket() {
  const { kind } = useLocalSearchParams<{ kind: 'safepass' | 'manual' }>();
  const cfg = KINDS[kind === 'manual' ? 'manual' : 'safepass'];
  const router = useRouter();
  const { upsertQualification } = useStore();
  const [front, setFront] = useState<{ uri: string; stamp: Stamp } | null>(null);
  const [back, setBack] = useState<{ uri: string; stamp: Stamp } | null>(null);
  const [expM, setExpM] = useState<number>();
  const [expY, setExpY] = useState<number>();
  const [issM, setIssM] = useState<number>();
  const [issY, setIssY] = useState<number>();

  const go = () => router.push(cfg.next as never);

  function save() {
    const q: Qualification = {
      id: `q-${kind}-${Date.now()}`,
      name: cfg.name,
      verification: 'self',
      imageUri: front?.uri,
      imageBackUri: back?.uri,
      stamps: { ...(front ? { front: front.stamp } : {}), ...(back ? { back: back.stamp } : {}) },
      expires: expY != null ? monthYearToDate(expM ?? 11, expY, true).toISOString() : undefined,
      issued: issY != null ? monthYearToDate(issM ?? 0, issY, false).toISOString() : undefined,
    };
    upsertQualification(q);
    go();
  }

  const slot = (label: string, val: typeof front, set: (v: typeof front) => void, big: boolean) => (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.slot, big && styles.slotBig]} onPress={async () => set(await pickPhoto('camera'))}>
        {val ? <Image source={{ uri: val.uri }} style={styles.img} resizeMode="cover" /> : <Text style={styles.slotText}>{`📸  Scan the ${label.toLowerCase().startsWith('front') ? 'front' : 'back'}`}</Text>}
      </Pressable>
    </View>
  );

  const hasData = Boolean(front || back || expY != null);

  return (
    <Step n={cfg.n} emoji={cfg.emoji} title={cfg.title} text={cfg.text}>
      {slot('Front of card', front, setFront, true)}
      {slot('Back of card (if it has one)', back, setBack, false)}
      <Text style={styles.label}>{cfg.issue ? 'Expiry (month & year, optional)' : 'Expiry (month & year)'}</Text>
      <View style={styles.pair}>
        <Select placeholder="Month" value={expM} options={[...Array(12).keys()]} format={(m) => MONTHS[m]} onChange={setExpM} />
        <Select placeholder="Year" value={expY} options={EXPIRY_YEARS} onChange={setExpY} />
      </View>
      {cfg.issue ? (
        <>
          <Text style={styles.label}>Issue date (month & year, optional)</Text>
          <View style={styles.pair}>
            <Select placeholder="Month" value={issM} options={[...Array(12).keys()]} format={(m) => MONTHS[m]} onChange={setIssM} />
            <Select placeholder="Year" value={issY} options={ISSUE_YEARS} onChange={setIssY} />
          </View>
        </>
      ) : null}
      <Button label="Scan the card" onPress={save} disabled={!hasData} />
      <Text style={styles.skip} onPress={go}>
        I don't have this / skip for now
      </Text>
    </Step>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: '800', color: '#55677A' },
  pair: { flexDirection: 'row', gap: spacing.sm },
  slot: { height: 100, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B9C6D3', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  slotBig: { height: 170, borderColor: colors.navy },
  slotText: { color: colors.navy, fontSize: 17, fontWeight: '800' },
  img: { width: '100%', height: '100%' },
  skip: { textAlign: 'center', color: colors.muted, fontSize: 17, textDecorationLine: 'underline', paddingVertical: 8 },
});
