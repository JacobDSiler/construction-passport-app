import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../src/lib/store';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
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
        <Stack.Screen name="qualification/[id]" options={{ headerShown: true, title: 'Qualification' }} />
        <Stack.Screen name="add-qualification" options={{ headerShown: true, title: 'Add qualification' }} />
      </Stack>
    </StoreProvider>
  );
}
