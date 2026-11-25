import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { useStore } from '../src/lib/store';
import { useSession } from '../src/lib/session';
import { maybeCreateAccount } from '../src/lib/account';
import { claimWorker } from '../src/lib/api';
import { Qualification } from '../src/lib/passport';

export default function SetupWorker() {
  const router = useRouter();
  const { worker, updateWorker } = useStore();
  const { update } = useSession();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [claim, setClaim] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function next() {
    if (!name.trim()) return setErr('Please enter your name.');
    setBusy(true);
    setErr(null);
    try {
      const accErr = await maybeCreateAccount(email, password);
      if (accErr) return setErr(accErr);

      let patch: { name: string; trade: string; qualifications?: Qualification[] } = { name: name.trim(), trade: trade.trim() };
      if (claim.trim()) {
        const r = await claimWorker(claim);
        if (!r) return setErr('That claim code was not found. Check it, or clear the box to continue without one.');
        const incoming: Qualification[] = (r.certs ?? []).map((c, i) => ({
          id: `q-claim-${Date.now()}-${i}`,
          name: String(c.name ?? c.certName ?? 'Ticket'),
          issuer: c.issuer ? String(c.issuer) : undefined,
          expires: c.expires ? new Date(String(c.expires)).toISOString() : undefined,
          verification: 'pending',
          addedByEmployer: true,
        }));
        patch = { name: name.trim() || r.name || '', trade: trade.trim() || r.trade || '', qualifications: [...worker.qualifications, ...incoming] };
      }
      updateWorker(patch);
      update({ email: email.trim() || null });
      router.push('/setup-photo');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SetupScreen
      step="STEP 1 OF 6"
      title="Set up your passport"
      subtitle="Your name goes on top. If your employer set your passport up already, enter their claim code and we'll fill it in."
    >
      <Field label="Your name" value={name} onChangeText={setName} placeholder="e.g. John Murphy" autoCapitalize="words" />
      <Field label="Your trade" value={trade} onChangeText={setTrade} placeholder="e.g. Electrician" autoCapitalize="words" />
      <Field label="Email (so your passport is saved)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
      <Field label="Claim code (optional)" value={claim} onChangeText={setClaim} placeholder="From your employer, if any" autoCapitalize="characters" />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Setting up…' : 'Next'} onPress={next} disabled={busy} />
    </SetupScreen>
  );
}
