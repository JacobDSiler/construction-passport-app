import { ScrollView, StyleSheet, Text } from 'react-native';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function HazardsTab() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>Hazards</Text>
        <Text style={styles.p}>Hazard observations (Safe Act, Unsafe Condition, Unsafe Act, Suggestion) with photos and PDF are being rebuilt next.</Text>
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
