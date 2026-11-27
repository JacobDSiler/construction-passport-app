import { useState } from 'react';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { useSession } from '../src/lib/session';
import { maybeCreateAccount } from '../src/lib/account';

export default function SetupTrainer() {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (!name.trim()) return setErr('Please enter your training business name.');
    setBusy(true);
    setErr(null);
    const accErr = await maybeCreateAccount(email, password);
    setBusy(false);
    if (accErr) return setErr(accErr);
    update({ role: 'trainer', email: email.trim() || null, orgName: name.trim() });
    router.replace('/trainer');
  }

  return (
    <SetupScreen title="What's your training business called?" subtitle="Shown to students when they join your courses.">
      <Field label="Company name" value={name} onChangeText={setName} placeholder="e.g. Prime Management" autoCapitalize="words" />
      <Field label="Email (so your passport is saved)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Working…' : 'Continue'} onPress={go} disabled={busy} />
    </SetupScreen>
  );
}
