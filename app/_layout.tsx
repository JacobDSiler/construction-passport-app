import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../src/lib/store';
import { SessionProvider } from '../src/lib/session';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SessionProvider>
    <StoreProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="trainer" options={{ headerShown: true, title: 'Courses' }} />
        <Stack.Screen name="crew-add" options={{ headerShown: true, title: 'Add Worker' }} />
        <Stack.Screen name="crew-member" options={{ headerShown: true, title: 'Crew member' }} />
        <Stack.Screen name="sites" options={{ headerShown: true, title: 'Manage Sites' }} />
        <Stack.Screen name="crew-expenses" options={{ headerShown: true, title: 'Crew Expenses' }} />
        <Stack.Screen name="provision" options={{ headerShown: true, title: 'Set up worker passports' }} />
        <Stack.Screen name="qualification/[id]" options={{ headerShown: true, title: 'Qualification' }} />
        <Stack.Screen name="add-qualification" options={{ headerShown: true, title: 'Add qualification' }} />
        <Stack.Screen name="day-off" options={{ headerShown: true, title: 'Record a day off' }} />
        <Stack.Screen name="job-sheet" options={{ headerShown: true, title: 'Job Sheet' }} />
        <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
        <Stack.Screen name="support" options={{ headerShown: true, title: 'Support' }} />
        <Stack.Screen name="checkin" options={{ headerShown: true, title: 'Check-in' }} />
        <Stack.Screen name="claim" options={{ headerShown: true, title: 'Claim code' }} />
        <Stack.Screen name="certifier" options={{ headerShown: true, title: 'Certifier' }} />
        <Stack.Screen name="setup-certifier" options={{ headerShown: false }} />
        <Stack.Screen name="site-diary" options={{ headerShown: true, title: 'Site diary' }} />
        <Stack.Screen name="site-audit" options={{ headerShown: true, title: 'Site audit' }} />
        <Stack.Screen name="course/new" options={{ headerShown: true, title: 'New course' }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: true, title: 'Course' }} />
      </Stack>
    </StoreProvider>
    </SessionProvider>
  );
}
