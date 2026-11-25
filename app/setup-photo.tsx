import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/ui';
import { Step } from '../src/components/Step';
import { colors } from '../src/theme';
import { useStore } from '../src/lib/store';
import { pickPhoto } from '../src/lib/pick';

// Step 2: headshot for the front of the passport.
export default function SetupPhoto() {
  const router = useRouter();
  const { worker, updateWorker } = useStore();
  const [uri, setUri] = useState<string | undefined>(worker.photoUri);

  async function take() {
    const p = await pickPhoto('camera');
    if (p) {
      setUri(p.uri);
      updateWorker({ photoUri: p.uri });
    }
  }
  const next = () => router.push({ pathname: '/setup-ticket', params: { kind: 'safepass' } });

  return (
    <Step n={2} emoji="📸" title="Add your photo" text="A clear headshot goes on the front of your passport, so whoever you share it with sees straight away it's really you.">
      <Pressable style={styles.circle} onPress={take}>
        {uri ? <Image source={{ uri }} style={styles.img} /> : <Text style={styles.circleText}>📷 Take your photo</Text>}
      </Pressable>
      <Button label={uri ? 'Continue' : 'Take my photo'} onPress={uri ? next : take} />
      <Text style={styles.skip} onPress={next}>
        {uri ? 'Retake later' : 'Skip for now'}
      </Text>
    </Step>
  );
}

const styles = StyleSheet.create({
  circle: { alignSelf: 'center', width: 220, height: 220, borderRadius: 110, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.navy, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.white },
  circleText: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  img: { width: '100%', height: '100%' },
  skip: { textAlign: 'center', color: colors.muted, fontSize: 17, textDecorationLine: 'underline', paddingVertical: 8 },
});
