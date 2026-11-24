import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        tabBarActiveTintColor: colors.navy,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Passport' }} />
      <Tabs.Screen name="timesheets" options={{ title: 'Timesheets' }} />
      <Tabs.Screen name="crew" options={{ title: 'Crew' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
