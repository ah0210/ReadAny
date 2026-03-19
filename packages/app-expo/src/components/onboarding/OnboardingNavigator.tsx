import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/styles/theme";
import { View } from "react-native";
import { WelcomePage } from "./steps/WelcomePage";
import { AppearancePage } from "./steps/AppearancePage";
import { AIPage } from "./steps/AIPage";
import { EmbeddingPage } from "./steps/EmbeddingPage";
import { TranslationPage } from "./steps/TranslationPage";
import { SyncPage } from "./steps/SyncPage";
import { CompletePage } from "./steps/CompletePage";

export type OnboardingStackParamList = {
  Welcome: undefined;
  Appearance: undefined;
  AI: undefined;
  Embedding: undefined;
  Translation: undefined;
  Sync: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="Appearance" component={AppearancePage} />
        <Stack.Screen name="AI" component={AIPage} />
        <Stack.Screen name="Embedding" component={EmbeddingPage} />
        <Stack.Screen name="Translation" component={TranslationPage} />
        <Stack.Screen name="Sync" component={SyncPage} />
        <Stack.Screen name="Complete" component={CompletePage} />
      </Stack.Navigator>
    </View>
  );
}
