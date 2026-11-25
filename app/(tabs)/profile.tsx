import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Attribution, Button, Card, Field } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { INDIVIDUAL_PRICE_EUR } from '../../src/lib/entitlements';
import { Crew, loadCrews, saveCrews } from '../../src/lib/records';
import { requestJoin, setSuggestionConsent } from '../../src/lib/api';
import { loadJson, saveJson } from '../../src/lib/storage';

const SUGGEST_KEY = 'cp.suggestConsent.v1';

function LinkCard({ icon, title, body, onPress }: { icon: string; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 34 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.h}>{title}</Text>
          <Text style={styles.p}>{body}</Text>
        </View>
        <Text style={{ fontSize: 30, color: '#5F7385' }}>›</Text>
      </Card>
    </Pressable>
  );
}

export default function ProfileTab() {
  const router = useRouter();
  const { worker, updateWorker, access, shortCode } = useStore();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewCode, setCrewCode] = useState('');
  const [suggest, setSuggest] = useState(true);
  useEffect(() => {
    loadCrews().then(setCrews);
    loadJson<boolean>(SUGGEST_KEY, true).then(setSuggest);
  }, []);

  async function addCrew() {
    const code = crewCode.trim().toUpperCase();
    if (!code) return;
    let status: Crew['status'] = 'requested';
    try {
      if (!shortCode) Alert.alert('Share your passport first', 'Open the Share tab once so your employer can find you, then add the crew code again.');
      else await requestJoin(code, shortCode, worker.name);
    } catch (e) {
      Alert.alert('Could not add the crew', String((e as Error).message ?? e));
      return;
    }
    if (!shortCode) return;
    const next = [...crews.filter((c) => c.code !== code).map((c) => ({ ...c, active: false })), { code, active: true, status }];
    setCrews(next);
    await saveCrews(next);
    setCrewCode('');
  }
  async function makeActive(code: string) {
    const next = crews.map((c) => ({ ...c, active: c.code === code }));
    setCrews(next);
    await saveCrews(next);
  }
  async function toggleSuggest(v: boolean) {
    setSuggest(v);
    saveJson(SUGGEST_KEY, v);
    setSuggestionConsent(v).catch(() => {});
  }
  const [f, setF] = useState({ name: worker.name, trade: worker.trade, phone: worker.phone, email: worker.email, employer: worker.employer });
  useEffect(() => {
    setF({ name: worker.name, trade: worker.trade, phone: worker.phone, email: worker.email, employer: worker.employer });
  }, [worker.name, worker.trade, worker.phone, worker.email, worker.employer]);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.kicker}>USING AS</Text>
          <Text style={styles.h}>Worker</Text>
        </View>
        <Text style={styles.switch} onPress={() => Alert.alert('Coming next', 'The employer and trainer roles are rebuilt after the worker side.')}>Switch</Text>
      </Card>
      <LinkCard icon="🟢" title="Check-in" body="A quick, private check on how you're doing. Stays on your phone — nobody else sees it." onPress={() => router.push('/checkin')} />
      <LinkCard icon="🆘" title="Support" body="Free, confidential helplines — including one built for construction. Any hour." onPress={() => router.push('/support')} />
      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(f.name || '?').trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Field label="Name" value={f.name} onChangeText={(name) => setF({ ...f, name })} />
        <Field label="Trade" value={f.trade} onChangeText={(trade) => setF({ ...f, trade })} />
        <Field label="Phone" value={f.phone} keyboardType="phone-pad" onChangeText={(phone) => setF({ ...f, phone })} />
        <Field label="Email" value={f.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(email) => setF({ ...f, email })} />
        <Field label="Employer" value={f.employer} onChangeText={(employer) => setF({ ...f, employer })} />
        <Button
          label="Save Profile"
          onPress={() => {
            updateWorker(f);
            Alert.alert('Saved', 'Your profile is saved and your shared passport will update.');
          }}
        />
      </Card>

      <Card>
        <Text style={styles.h}>Your crews (optional)</Text>
        <Text style={styles.p}>Add every crew you work for. The one marked &quot;Active&quot; is where new timesheets and expenses go — tap another to switch.</Text>
        {crews.map((c) => (
          <Pressable key={c.code} style={styles.crewRow} onPress={() => makeActive(c.code)}>
            <Text style={styles.crewCode}>{c.code}</Text>
            <Text style={styles.p}>{c.status === 'requested' ? 'Requested' : 'Joined'}{c.active ? ' · Active' : ''}</Text>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field label="" placeholder="Add a crew code" value={crewCode} onChangeText={(t) => setCrewCode(t.toUpperCase())} autoCapitalize="characters" />
          </View>
          <Button label="Add" onPress={addCrew} />
        </View>
      </Card>
      <LinkCard icon="🪪" title="Have a claim code?" body="If your employer set up your passport, enter their code to fill it in automatically." onPress={() => router.push('/claim')} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h}>Training suggestions</Text>
          <Text style={styles.p}>Let an employer suggest courses to you (for example when a ticket&apos;s expiring). You always book them yourself — your details are never shared without you.</Text>
        </View>
        <Switch value={suggest} onValueChange={toggleSuggest} trackColor={{ true: '#7CC8BC' }} />
      </Card>

      <Card>
        <Text style={styles.h}>Your plan</Text>
        <Text style={styles.p}>
          {access?.phase === 'trial'
            ? `Free trial: ${access.daysLeft} days left with everything included. After that your Passport stays free; timesheets and working tools are ${INDIVIDUAL_PRICE_EUR.toFixed(2)} EUR a month (or free if your employer subscribes).`
            : access?.phase === 'expired'
              ? `Your free trial has ended. Passport and sharing are free; timesheets and working tools are ${INDIVIDUAL_PRICE_EUR.toFixed(2)} EUR a month.`
              : 'Subscribed.'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.h}>Coming next</Text>
        <Text style={styles.p}>Second language, training courses, email backup of your passport, and certifier access.</Text>
        <Text style={styles.p}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </Card>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  avatar: { alignSelf: 'center', width: 110, height: 110, borderRadius: 26, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 52, fontWeight: '800' },
  h: { fontSize: 20, fontWeight: '800', color: colors.text },
  p: { fontSize: 16, color: '#5F7385', lineHeight: 23 },
  kicker: { fontSize: 14, fontWeight: '800', letterSpacing: 1, color: '#55677A' },
  switch: { fontSize: 19, fontWeight: '800', color: colors.navy },
  crewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF1F5' },
  crewCode: { fontSize: 19, fontWeight: '800', color: colors.text },
});
