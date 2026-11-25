import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, SectionLabel } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { deleteCourse, listCourses, rows, str } from '../src/lib/api';
import { logOut } from '../src/lib/account';

// Training provider home: list courses, open one to see its enrolments. Course creation is not in the backend contract yet.
export default function Trainer() {
  const router = useRouter();
  const { session, reset, update } = useSession();
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setCourses(rows(await listCourses()));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  function confirmDelete(c: Record<string, unknown>) {
    Alert.alert('Delete course?', `${str(c, 'title', 'name') || 'This course'} and its enrolments will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourse(str(c, 'id'));
            load();
          } catch (e) {
            Alert.alert('Could not delete', (e as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.h1}>{session.orgName ?? 'Your training business'}</Text>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>{`COURSES (${courses.length})`}</SectionLabel>
      {courses.length === 0 ? (
        <Card>
          <Text style={styles.muted}>No courses yet. Creating a course needs a backend function that is not in the contract yet.</Text>
        </Card>
      ) : (
        courses.map((c, i) => {
          const code = str(c, 'course_code', 'courseCode');
          return (
            <Card key={str(c, 'id') || i}>
              <Pressable onPress={() => router.push({ pathname: '/course/[id]', params: { id: str(c, 'id'), code, title: str(c, 'title', 'name') } })}>
                <Text style={styles.row}>{str(c, 'title', 'name') || 'Course'}</Text>
                <Text style={styles.muted}>{code}</Text>
              </Pressable>
              <Text style={styles.del} onPress={() => confirmDelete(c)}>Delete course</Text>
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
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
