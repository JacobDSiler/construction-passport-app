import { useState } from 'react';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { useSession } from '../src/lib/session';
import { logIn } from '../src/lib/account';
import { useStore } from '../src/lib/store';

export default function Login() {
  const router = useRouter();
  const { update } = useSession();
  const { reload } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const { restored } = await logIn(email, password);
      update({ email: email.trim() });
      await reload();
      if (!restored) {
        setNote('Logged in, but this account has no saved passport yet. Pick who you are to continue.');
      }
      router.replace('/role');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SetupScreen title="Welcome back" subtitle="Log in to bring your passport back onto this phone.">
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      {note ? <Text style={{ color: colors.muted, fontSize: 16 }}>{note}</Text> : null}
      <Button label={busy ? 'Logging in…' : 'Log in'} onPress={go} disabled={busy || !email || !password} />
    </SetupScreen>
  );
}
