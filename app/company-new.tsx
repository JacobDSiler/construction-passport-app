import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { createCompany } from '../src/lib/api';
import { getOwnerToken } from '../src/lib/owner';

export default function CompanyNew() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (!name.trim()) return setErr('Please enter the company name.');
    setBusy(true);
    setErr(null);
    try {
      await createCompany(await getOwnerToken(), name, trade.trim() || null);
      router.replace('/companies');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SetupScreen title="Set up a new company" subtitle="You will get a claim code to send to them.">
      <Field label="Company name" value={name} onChangeText={setName} placeholder="e.g. Prime Peak Limited" autoCapitalize="words" />
      <Field label="Trade (optional)" value={trade} onChangeText={setTrade} placeholder="e.g. Groundworks" autoCapitalize="words" />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Saving…' : 'Create company'} onPress={go} disabled={busy} />
    </SetupScreen>
  );
}
