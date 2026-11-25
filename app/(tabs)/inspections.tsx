import { ScrollView, StyleSheet, Text } from 'react-native';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function InspectionsTab() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>Inspections</Text>
        <Text style={styles.p}>Vehicle and machine inspections, defect reports and site audits are being rebuilt next.</Text>
      </Card>
      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  h: { fontSize: 22, fontWeight: '800', color: colors.text },
  p: { fontSize: 17, color: '#5F7385', lineHeight: 24 },
});
