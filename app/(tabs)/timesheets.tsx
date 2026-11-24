import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { Access, getAccess, INDIVIDUAL_PRICE_EUR } from '../../src/lib/entitlements';

// Paid after the 90-day trial. Exports and shares always carry the attribution footer (src/lib/attribution.ts).
export default function Timesheets() {
  const [access, setAccess] = useState<Access | null>(null);
  useEffect(() => {
    getAccess().then(setAccess);
  }, []);

  const locked = access ? !access.can('timesheets') : false;
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>Timesheets</Text>
        {locked ? (
          <Text style={styles.p}>
            Your 90-day free period has ended. Timesheets are available for {INDIVIDUAL_PRICE_EUR.toFixed(2)} EUR a month,
            or free if your employer subscribes. Your Passport stays free.
          </Text>
        ) : (
          <Text style={styles.p}>
            {access ? `Free trial: ${access.daysLeft} days left, everything included.` : 'Loading…'}
          </Text>
        )}
      </Card>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 20, fontWeight: '800', color: colors.text },
  p: { fontSize: 15, color: colors.muted, lineHeight: 22 },
});
