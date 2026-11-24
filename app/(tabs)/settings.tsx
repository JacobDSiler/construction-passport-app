import { ScrollView, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import { Attribution, Card } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function Settings() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Card>
        <Text style={styles.h}>About</Text>
        <Text style={styles.p}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
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
