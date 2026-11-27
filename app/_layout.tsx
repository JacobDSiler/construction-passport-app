import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../src/lib/store';
import { SessionProvider } from '../src/lib/session';
import { colors } from '../src/theme';
import { LanguageProvider, useI18n } from '../src/lib/i18n';

function Screens() {
  const { bi } = useI18n();
  return (
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="trainer" options={{ headerShown: true, title: bi('Courses') }} />
        <Stack.Screen name="crew-add" options={{ headerShown: true, title: bi('Add Worker') }} />
        <Stack.Screen name="crew-member" options={{ headerShown: true, title: bi('Crew member') }} />
        <Stack.Screen name="sites" options={{ headerShown: true, title: bi('Manage Sites') }} />
        <Stack.Screen name="crew-expenses" options={{ headerShown: true, title: bi('Crew Expenses') }} />
        <Stack.Screen name="provision" options={{ headerShown: true, title: bi('Set up worker passports') }} />
        <Stack.Screen name="qualification/[id]" options={{ headerShown: true, title: bi('Qualification') }} />
        <Stack.Screen name="add-qualification" options={{ headerShown: true, title: bi('Add qualification') }} />
        <Stack.Screen name="day-off" options={{ headerShown: true, title: bi('Record a day off') }} />
        <Stack.Screen name="schedule" options={{ headerShown: true, title: bi('Weekly schedule') }} />
        <Stack.Screen name="job-sheet" options={{ headerShown: true, title: bi('Job Sheet') }} />
        <Stack.Screen name="expenses" options={{ headerShown: true, title: bi('Expenses') }} />
        <Stack.Screen name="support" options={{ headerShown: true, title: bi('Support') }} />
        <Stack.Screen name="checkin" options={{ headerShown: true, title: bi('Check-in') }} />
        <Stack.Screen name="claim" options={{ headerShown: true, title: bi('Claim code') }} />
        <Stack.Screen name="certifier" options={{ headerShown: true, title: bi('Certifier') }} />
        <Stack.Screen name="setup-certifier" options={{ headerShown: false }} />
        <Stack.Screen name="companies" options={{ headerShown: true, title: bi('Companies') }} />
        <Stack.Screen name="company-new" options={{ headerShown: false }} />
        <Stack.Screen name="site-diary" options={{ headerShown: true, title: bi('Site diary') }} />
        <Stack.Screen name="site-audit" options={{ headerShown: true, title: bi('Site audit') }} />
        <Stack.Screen name="course/new" options={{ headerShown: true, title: bi('New course') }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: true, title: bi('Course') }} />
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <StoreProvider>
          <StatusBar style="light" />
          <Screens />
        </StoreProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
