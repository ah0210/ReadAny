/**
 * RootNavigator — top-level stack containing TabNavigator and full-screen routes.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigator";
import { ReaderScreen } from "@/screens/ReaderScreen";
import { AppearanceSettingsScreen } from "@/screens/settings/AppearanceSettingsScreen";
import { AISettingsScreen } from "@/screens/settings/AISettingsScreen";
import { TTSSettingsScreen } from "@/screens/settings/TTSSettingsScreen";
import { TranslationSettingsScreen } from "@/screens/settings/TranslationSettingsScreen";
import { SyncSettingsScreen } from "@/screens/settings/SyncSettingsScreen";
import { AboutScreen } from "@/screens/settings/AboutScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Reader: { bookId: string };
  AppearanceSettings: undefined;
  AISettings: undefined;
  TTSSettings: undefined;
  TranslationSettings: undefined;
  SyncSettings: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
      <Stack.Screen name="AISettings" component={AISettingsScreen} />
      <Stack.Screen name="TTSSettings" component={TTSSettingsScreen} />
      <Stack.Screen name="TranslationSettings" component={TranslationSettingsScreen} />
      <Stack.Screen name="SyncSettings" component={SyncSettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
