import { ScrollView, StyleSheet, Text } from 'react-native';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

// Employer layer: crew, sites, approvals, expenses, hazards, courses. Built after Passport and timesheets.
export default function Crew() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>Crew</Text>
        <Text style={styles.p}>Company tools (crew, sites, approvals) will live here.</Text>
      </Card>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 20, fontWeight: '800', color: colors.text },
  p: { fontSize: 15, color: colors.muted },
});
