import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { Attribution, Button, Card, Field, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useStore } from '../src/lib/store';
import { EXPENSE_CATEGORIES, Expense, loadExpenses, newRecordId, saveExpenses } from '../src/lib/records';
import { pickPhoto } from '../src/lib/pick';
import { Stamp } from '../src/lib/photos';
import { exportExpensesPdf } from '../src/lib/exports';
import { dateDMY } from '../src/lib/dates';

export default function ExpensesScreen() {
  const { worker } = useStore();
  const [items, setItems] = useState<Expense[]>([]);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Fuel');
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState<{ uri: string; stamp: Stamp } | null>(null);

  useEffect(() => {
    loadExpenses().then(setItems);
  }, []);

  const value = parseFloat(amount.replace(',', '.'));
  const valid = merchant.trim().length > 0 && Number.isFinite(value) && value > 0;

  async function add() {
    const e: Expense = {
      id: newRecordId('exp'),
      spentOn: new Date().toISOString(),
      merchant: merchant.trim(),
      amount: Math.round(value * 100) / 100,
      category,
      note: note.trim(),
      receiptUri: receipt?.uri,
      stamp: receipt?.stamp,
      submitted: false,
    };
    const next = [e, ...items];
    setItems(next);
    await saveExpenses(next);
    setMerchant('');
    setAmount('');
    setNote('');
    setReceipt(null);
  }

  const total = items.reduce((t, e) => t + e.amount, 0);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.h}>Add an expense</Text>
        {receipt ? (
          <Image source={{ uri: receipt.uri }} style={styles.photo} />
        ) : (
          <Pressable style={styles.photoBox} onPress={async () => setReceipt(await pickPhoto('camera'))}>
            <Text style={styles.photoText}>🧾 Snap a receipt</Text>
          </Pressable>
        )}
        <Field label="Merchant" value={merchant} onChangeText={setMerchant} />
        <Field label="Amount (€)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <View style={styles.chips}>
          {EXPENSE_CATEGORIES.map((c) => (
            <Pressable key={c} style={[styles.chip, category === c && styles.chipOn]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && { color: colors.white }]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Note" value={note} onChangeText={setNote} />
        <Button label="Save expense" disabled={!valid} onPress={add} />
      </Card>

      <SectionLabel>{`Your expenses · €${total.toFixed(2)}`}</SectionLabel>
      {items.length === 0 ? <Text style={styles.sub}>No expenses yet.</Text> : null}
      {items.map((e) => (
        <Card key={e.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.merchant}>{e.merchant}</Text>
            <Text style={styles.sub}>{dateDMY(new Date(e.spentOn))} · {e.category}{e.note ? ` · ${e.note}` : ''}</Text>
          </View>
          <Text style={styles.amount}>€{e.amount.toFixed(2)}</Text>
          <Text style={styles.del} onPress={async () => { const n = items.filter((x) => x.id !== e.id); setItems(n); await saveExpenses(n); }}>✕</Text>
        </Card>
      ))}
      {items.length ? (
        <Button label="📄 Export expenses (PDF)" variant="ghost" onPress={() => exportExpensesPdf(items, worker, 'All saved expenses').catch((e) => Alert.alert('Export failed', String(e?.message ?? e)))} />
      ) : null}
      <Text style={styles.sub}>Sending expenses to your employer is coming next.</Text>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 24, fontWeight: '800', color: colors.text },
  photoBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#C3CFDB', borderRadius: 18, height: 120, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontSize: 20, color: '#5F7385', fontWeight: '600' },
  photo: { width: '100%', height: 200, borderRadius: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#D6DEE6', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  merchant: { fontSize: 19, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: '#5F7385' },
  amount: { fontSize: 20, fontWeight: '800', color: colors.navy },
  del: { fontSize: 22, color: '#5F7385', paddingHorizontal: 6 },
});
