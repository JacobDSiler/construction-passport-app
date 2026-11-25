import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { listCourses } from '../src/lib/api';
import { logOut } from '../src/lib/account';

// Training provider home. Course creation, enrolments and posting certs are built on top of this next.
export default function Trainer() {
  const router = useRouter();
  const { session, reset, update } = useSession();
  const [courses, setCourses] = useState<unknown[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then((c) => setCourses(c ?? []))
      .catch((e) => setErr((e as Error).message));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.h1}>{session.orgName ?? 'Your training business'}</Text>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>{`COURSES (${courses.length})`}</SectionLabel>
      {courses.length === 0 ? (
        <Card><Text style={styles.muted}>No courses yet. Course creation, student details and questionnaires are coming next.</Text></Card>
      ) : (
        courses.map((c, i) => {
          const o = (c ?? {}) as Record<string, unknown>;
          return (
            <Card key={i}>
              <Text style={styles.row}>{String(o.title ?? o.name ?? 'Course')}</Text>
              <Text style={styles.muted}>{String(o.course_code ?? o.courseCode ?? '')}</Text>
            </Card>
          );
        })
      )}
      <Button label="Use as a worker instead" variant="ghost" onPress={() => { update({ role: 'worker' }); router.replace('/(tabs)'); }} />
      <Button label="Log out" variant="ghost" onPress={async () => { await logOut(); reset(); router.replace('/'); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted, fontSize: 16 },
  row: { fontSize: 18, fontWeight: '700', color: colors.text },
});
