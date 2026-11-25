import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { useSession } from '../src/lib/session';
import { certifierLogin } from '../src/lib/certifier';

export default function SetupCertifier() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      await certifierLogin(code);
      update({ role: 'certifier', orgName: null });
      router.replace('/certifier');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SetupScreen title="Certifier sign-in" subtitle="Enter the certifier code you were given. It lets you review and certify passports.">
      <Field label="Certifier code" value={code} onChangeText={setCode} placeholder="Your code" autoCapitalize="characters" autoCorrect={false} />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Checking…' : 'Sign in'} onPress={go} disabled={busy || !code.trim()} />
    </SetupScreen>
  );
}
