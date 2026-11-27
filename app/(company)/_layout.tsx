import { Text } from '../../src/components/Text';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import { useI18n } from '../../src/lib/i18n';

const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>{e}</Text>;

// Employer / contractor home: Crew, My Passport, Share, Hazards, Profile (same tabs as the live app).
export default function CompanyTabs() {
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
      <Tabs.Screen name="index" options={{ title: bi('Crew'), headerTitle: bi('My Crew'), tabBarIcon: icon('👷') }} />
      <Tabs.Screen name="mypassport" options={{ title: bi('My Passport'), headerTitle: bi('My Passport'), tabBarIcon: icon('🪪') }} />
      <Tabs.Screen name="share" options={{ title: bi('Share'), headerTitle: bi('Share Passport'), tabBarIcon: icon('🔳') }} />
      <Tabs.Screen name="hazards" options={{ title: bi('Hazards'), headerTitle: bi('Hazards'), tabBarIcon: icon('⚠️') }} />
      <Tabs.Screen name="profile" options={{ title: bi('Profile'), headerTitle: bi('Profile'), tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
