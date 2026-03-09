import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { SettingsHeader } from "./SettingsHeader";
import { colors, fontSize, fontWeight, spacing, radius } from "../../styles/theme";

const THEMES = [
  { id: "light", labelKey: "settings.light" },
  { id: "dark", labelKey: "settings.dark" },
  { id: "sepia", labelKey: "settings.sepia" },
] as const;

const LANGUAGES = [
  { code: "zh", label: "简体中文" },
  { code: "en", label: "English" },
] as const;

export default function AppearanceSettingsScreen() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState(() =>
    i18n.language?.startsWith("zh") ? "zh" : "en",
  );

  const handleLangChange = useCallback(
    async (code: string) => {
      setLang(code);
      try {
        const { changeAndPersistLanguage } = await import(
          "@readany/core/i18n"
        );
        await changeAndPersistLanguage(code);
      } catch {
        // fallback
      }
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SettingsHeader title={t("settings.appearance", "外观设置")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.theme", "主题")}
          </Text>
          <View style={styles.themeGrid}>
            {THEMES.map((item) => {
              const active = theme === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.themeCard,
                    active && styles.themeCardActive,
                  ]}
                  onPress={() => setTheme(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.themeLabel,
                      active && styles.themeLabelActive,
                    ]}
                  >
                    {t(item.labelKey, item.id)}
                  </Text>
                  {active && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.language", "语言")}
          </Text>
          <View style={styles.listCard}>
            {LANGUAGES.map((l, idx) => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.listItem,
                  idx < LANGUAGES.length - 1 && styles.listItemBorder,
                ]}
                onPress={() => handleLangChange(l.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.listItemText}>{l.label}</Text>
                {lang === l.code && (
                  <Text style={styles.checkPrimary}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: 24 },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  themeCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    position: "relative",
  },
  themeCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(224,224,230,0.05)",
  },
  themeLabel: {
    fontSize: fontSize.sm,
    color: colors.foreground,
  },
  themeLabelActive: {
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  checkMark: {
    fontSize: 14,
    color: colors.primary,
  },
  listCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listItemText: {
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  checkPrimary: {
    fontSize: 14,
    color: colors.primary,
  },
});
