import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Attribution, Button, Card, Field } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useStore } from '../../src/lib/store';
import { INDIVIDUAL_PRICE_EUR } from '../../src/lib/entitlements';

export default function ProfileTab() {
  const { worker, updateWorker, access } = useStore();
  const [f, setF] = useState({ name: worker.name, trade: worker.trade, phone: worker.phone, email: worker.email, employer: worker.employer });
  useEffect(() => {
    setF({ name: worker.name, trade: worker.trade, phone: worker.phone, email: worker.email, employer: worker.employer });
  }, [worker.name, worker.trade, worker.phone, worker.email, worker.employer]);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
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
        <Text style={styles.p}>Check-in, support helplines, language, your crews, claim codes, training courses, email backup and certifier access.</Text>
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
});
