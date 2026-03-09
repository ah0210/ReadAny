import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsHeader } from "./SettingsHeader";

export function TranslationSettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader title="翻译设置" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>翻译引擎设置将在此处实现</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { fontSize: 16, color: "#71717a" },
});
