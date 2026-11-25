import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Card, SectionLabel } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { listEnrollments, removeEnrollment, rows, str } from '../../src/lib/api';

// Enrolments for one course. Student answers come back as whatever shape the backend sends, so they are shown as plain key/value text.
function answersText(a: unknown): string[] {
  if (!a) return [];
  if (typeof a === 'string') {
    try {
      return answersText(JSON.parse(a));
    } catch {
      return [a];
    }
  }
  if (Array.isArray(a)) return a.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x)));
  if (typeof a === 'object') return Object.entries(a as Record<string, unknown>).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
  return [String(a)];
}

export default function CourseDetail() {
  const { code, title } = useLocalSearchParams<{ id: string; code: string; title: string }>();
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!code) return;
    try {
      setErr(null);
      setStudents(rows(await listEnrollments(code)));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [code]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  function remove(s: Record<string, unknown>) {
    Alert.alert('Remove student?', `${str(s, 'name', 'student_name') || 'This student'} will be removed from the course.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeEnrollment(str(s, 'id'));
            load();
          } catch (e) {
            Alert.alert('Could not remove', (e as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.h1}>{title || 'Course'}</Text>
      <Text style={styles.muted}>Course code {code}</Text>
      {err ? <Text style={{ color: colors.danger }}>{err}</Text> : null}
      <SectionLabel>{`STUDENTS (${students.length})`}</SectionLabel>
      {students.length === 0 ? (
        <Text style={styles.muted}>No one has enrolled yet. Students enrol with the course code.</Text>
      ) : (
        students.map((s, i) => (
          <Card key={str(s, 'id') || i}>
            <Text style={styles.row}>{str(s, 'name', 'student_name') || 'Student'}</Text>
            {str(s, 'email') ? <Text style={styles.muted}>{str(s, 'email')}</Text> : null}
            {str(s, 'phone') ? <Text style={styles.muted}>{str(s, 'phone')}</Text> : null}
            {str(s, 'address') ? <Text style={styles.muted}>{str(s, 'address')}</Text> : null}
            {answersText(s.answers).map((line, j) => (
              <Text key={j} style={styles.muted}>{line}</Text>
            ))}
            <Text style={styles.del} onPress={() => remove(s)}>Remove</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  h1: { fontSize: 26, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted, fontSize: 16 },
  row: { fontSize: 18, fontWeight: '700', color: colors.text },
  del: { color: colors.danger, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
});
