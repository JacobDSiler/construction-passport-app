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
        <Stack.Screen name="company" options={{ headerShown: true, title: 'Company' }} />
        <Stack.Screen name="trainer" options={{ headerShown: true, title: 'Training provider' }} />
        <Stack.Screen name="qualification/[id]" options={{ headerShown: true, title: 'Qualification' }} />
        <Stack.Screen name="add-qualification" options={{ headerShown: true, title: 'Add qualification' }} />
        <Stack.Screen name="day-off" options={{ headerShown: true, title: 'Record a day off' }} />
        <Stack.Screen name="job-sheet" options={{ headerShown: true, title: 'Job Sheet' }} />
        <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
        <Stack.Screen name="support" options={{ headerShown: true, title: 'Support' }} />
        <Stack.Screen name="checkin" options={{ headerShown: true, title: 'Check-in' }} />
        <Stack.Screen name="claim" options={{ headerShown: true, title: 'Claim code' }} />
      </Stack>
    </StoreProvider>
    </SessionProvider>
  );
}
