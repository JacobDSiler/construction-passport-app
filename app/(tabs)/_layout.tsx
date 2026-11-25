import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 22 },
        tabBarActiveTintColor: colors.navy,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Passport', headerTitle: 'Construction Passport', tabBarIcon: icon('🪪') }} />
      <Tabs.Screen name="share" options={{ title: 'Share', headerTitle: 'Share Passport', tabBarIcon: icon('🔳') }} />
      <Tabs.Screen name="timesheet" options={{ title: 'Timesheet', headerTitle: 'Timesheet', tabBarIcon: icon('🕒') }} />
      <Tabs.Screen name="inspections" options={{ title: 'Inspections', headerTitle: 'Inspections', tabBarIcon: icon('🚐') }} />
      <Tabs.Screen name="hazards" options={{ title: 'Hazards', headerTitle: 'Hazards', tabBarIcon: icon('⚠️') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerTitle: 'Profile', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
