import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../src/components/ui';
import { colors, spacing } from '../src/theme';

const call = (n: string) => Linking.openURL(`tel:${n.replace(/\s/g, '')}`);
const text = (n: string, body: string) => Linking.openURL(`sms:${n}?body=${encodeURIComponent(body)}`);

// Free, confidential helplines. Nothing here is tracked or shared.
export default function Support() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.big}>You&apos;re not on your own.</Text>
      <Text style={styles.sub}>All free, confidential, and open any hour. Nothing you tap here is tracked or shared with anyone.</Text>

      <Pressable112 />

      <Card>
        <Text style={styles.h}>Lighthouse Construction Charity</Text>
        <Text style={styles.sub}>Built for construction — money worries too. Free, 24/7, for everyone on site.</Text>
        <Button label="Call 1800 939 122" onPress={() => call('1800 939 122')} />
        <Button label="Text HARDHAT to 50808" variant="ghost" onPress={() => text('50808', 'HARDHAT')} />
      </Card>
      <Card>
        <Text style={styles.h}>Samaritans</Text>
        <Text style={styles.sub}>Whatever&apos;s on your mind, any hour. Free, 24/7.</Text>
        <Button label="Call 116 123" onPress={() => call('116 123')} />
      </Card>
      <Card>
        <Text style={styles.h}>Pieta</Text>
        <Text style={styles.sub}>If you&apos;re thinking of harming yourself, or worried about someone. Free, 24/7.</Text>
        <Button label="Call 1800 247 247" onPress={() => call('1800 247 247')} />
        <Button label="Text HELP to 51444" variant="ghost" onPress={() => text('51444', 'HELP')} />
      </Card>
      <Card>
        <Text style={styles.h}>Text About It</Text>
        <Text style={styles.sub}>Rather text than talk? A trained volunteer replies. Free, 24/7.</Text>
        <Button label="Text HELLO to 50808" variant="ghost" onPress={() => text('50808', 'HELLO')} />
      </Card>

      <Text style={styles.sub}>This is a signpost to help, not a medical service — if life is in danger, call 112 or 999.</Text>
      <Text style={styles.sub}>For the day-to-day, Wysa is a free self-help app (CBT/DBT) — helpful between the tough moments, but not for emergencies.</Text>
      <Text style={styles.link} onPress={() => Linking.openURL('https://www.wysa.com')}>Open Wysa</Text>
    </ScrollView>
  );
}

function Pressable112() {
  return (
    <View style={styles.danger}>
      <Text style={styles.dangerTitle} onPress={() => call('112')}>In danger right now? Call 112 or 999</Text>
      <Text style={styles.dangerSub} onPress={() => call('112')}>Tap to call 112</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.md },
  big: { fontSize: 30, fontWeight: '800', color: colors.text },
  h: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 17, color: '#5F7385', lineHeight: 24 },
  danger: { backgroundColor: '#C62828', borderRadius: 16, padding: spacing.md, gap: 4 },
  dangerTitle: { color: colors.white, fontSize: 21, fontWeight: '800' },
  dangerSub: { color: '#FBE5E2', fontSize: 17 },
  link: { fontSize: 20, fontWeight: '800', color: colors.navy },
});
