import { Text } from '../../src/components/Text';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/lib/i18n';

const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>{e}</Text>;

export default function TabsLayout() {
  const { bi } = useI18n();
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
      <Tabs.Screen name="index" options={{ title: bi('Passport'), headerTitle: bi('Construction Passport'), tabBarIcon: icon('🪪') }} />
      <Tabs.Screen name="share" options={{ title: bi('Share'), headerTitle: bi('Share Passport'), tabBarIcon: icon('🔳') }} />
      <Tabs.Screen name="timesheet" options={{ title: bi('Timesheet'), headerTitle: bi('Timesheet'), tabBarIcon: icon('🕒') }} />
      <Tabs.Screen name="inspections" options={{ title: bi('Inspections'), headerTitle: bi('Inspections'), tabBarIcon: icon('🚐') }} />
      <Tabs.Screen name="hazards" options={{ title: bi('Hazards'), headerTitle: bi('Hazards'), tabBarIcon: icon('⚠️') }} />
      <Tabs.Screen name="profile" options={{ title: bi('Profile'), headerTitle: bi('Profile'), tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
