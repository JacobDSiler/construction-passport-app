import { useState } from 'react';
import { Text } from '../src/components/Text';
import { useRouter } from 'expo-router';
import { Button, Field } from '../src/components/ui';
import { SetupScreen } from '../src/components/SetupScreen';
import { colors } from '../src/theme';
import { getSetupToken, useSession } from '../src/lib/session';
import { maybeCreateAccount } from '../src/lib/account';
import { claimCompany, createCompany, extractName, extractOrgCode, peekCompany } from '../src/lib/api';

export default function SetupCompany() {
  const router = useRouter();
  const { update } = useSession();
  const [mode, setMode] = useState<'new' | 'claim'>('new');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [claim, setClaim] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      if (mode === 'claim') {
        if (!claim.trim()) return setErr('Enter the claim code you were given.');
        const peek = await peekCompany(claim).catch(() => null);
        if (!peek) return setErr('That claim code was not found.');
        const accErr = await maybeCreateAccount(email, password);
        if (accErr) return setErr(accErr);
        const r = await claimCompany(claim);
        update({ role: 'company', email: email.trim() || null, orgName: extractName(r) ?? extractName(peek) ?? 'My company', orgCode: extractOrgCode(r) ?? extractOrgCode(peek) });
      } else {
        if (!name.trim()) return setErr('Please enter your company name.');
        const accErr = await maybeCreateAccount(email, password);
        if (accErr) return setErr(accErr);
        const r = await createCompany(await getSetupToken(), name);
        update({ role: 'company', email: email.trim() || null, orgName: name.trim(), orgCode: extractOrgCode(r) });
      }
      router.replace('/(company)');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SetupScreen
      title={mode === 'new' ? "What's your company called?" : 'Enter your company claim code'}
      subtitle={mode === 'new' ? 'This is the name shown when you confirm a worker.' : 'Someone set your company up already, so enter the code they gave you.'}
    >
      {mode === 'new' ? (
        <Field label="Company name" value={name} onChangeText={setName} placeholder="e.g. Prime Management" autoCapitalize="words" />
      ) : (
        <Field label="Company claim code" value={claim} onChangeText={setClaim} placeholder="e.g. ABC123" autoCapitalize="characters" />
      )}
      <Field label="Email (so your passport is saved)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
      {err ? <Text style={{ color: colors.danger, fontSize: 16 }}>{err}</Text> : null}
      <Button label={busy ? 'Working…' : 'Continue'} onPress={go} disabled={busy} />
      <Text style={{ color: colors.navy, fontSize: 18, fontWeight: '800', textAlign: 'center' }} onPress={() => setMode(mode === 'new' ? 'claim' : 'new')}>
        {mode === 'new' ? 'Someone already set us up? Enter a company claim code →' : '← Set up a new company instead'}
      </Text>
    </SetupScreen>
  );
}
