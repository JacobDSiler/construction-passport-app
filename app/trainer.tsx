import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card } from '../src/components/ui';
import { colors, spacing } from '../src/theme';
import { useSession } from '../src/lib/session';
import { deleteCourse, listCourses, rows, str } from '../src/lib/api';
import { logOut } from '../src/lib/account';
import { LanguageButton } from '../src/components/LanguageButton';

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
      <LanguageButton />
      <Text style={styles.h1}>{session.orgName ?? 'Your training business'}</Text>
      <Button label="＋  New course" onPress={() => router.push('/course/new')} />
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      {courses.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.empty}>No courses yet</Text>
          <Text style={styles.muted}>
            Create a course, set a pre-training questionnaire, and share the join code with your students. They enrol, give their postal address for their cert, and answer your questions. You see it all here.
          </Text>
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
              <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
                <Text style={styles.edit} onPress={() => router.push({ pathname: '/course/new', params: { code } })}>Edit</Text>
                <Text style={styles.del} onPress={() => confirmDelete(c)}>Delete course</Text>
              </View>
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
  del: { color: colors.danger, fontSize: 16, fontWeight: '700' },
  edit: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  empty: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
