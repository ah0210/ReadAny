import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface Props {
  title: string;
}

export function SettingsHeader({ title }: Props) {
  const nav = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => nav.goBack()} style={styles.back}>
        <Text style={styles.backText}>‹ 返回</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
  },
  back: { width: 60 },
  backText: { fontSize: 16, color: "#6366f1" },
  title: { flex: 1, fontSize: 18, fontWeight: "600", color: "#fafafa", textAlign: "center" },
  spacer: { width: 60 },
});
