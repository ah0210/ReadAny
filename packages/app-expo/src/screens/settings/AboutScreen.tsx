import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsHeader } from "./SettingsHeader";
import Constants from "expo-constants";

export function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader title="关于" />
      <View style={styles.content}>
        <Text style={styles.appName}>ReadAny</Text>
        <Text style={styles.version}>v{version}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  appName: { fontSize: 24, fontWeight: "700", color: "#fafafa", marginBottom: 8 },
  version: { fontSize: 16, color: "#71717a" },
});
