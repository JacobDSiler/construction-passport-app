import { ScrollView, StyleSheet, Text } from 'react-native';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { supabaseEnabled } from '../../src/lib/supabase';

// Free forever. Next: certificate list with expiry, add cert (scan / file / photo), share and QR.
export default function PassportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>Your Passport</Text>
        <Text style={styles.p}>Your certificates and tickets will appear here.</Text>
      </Card>
      {!supabaseEnabled && (
        <Card>
          <Text style={styles.warn}>Backend not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.</Text>
        </Card>
      )}
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 20, fontWeight: '800', color: colors.text },
  p: { fontSize: 15, color: colors.muted },
  warn: { fontSize: 14, color: colors.danger },
});
