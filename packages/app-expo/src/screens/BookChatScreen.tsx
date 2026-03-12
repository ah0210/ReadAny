/**
 * BookChatScreen — book-scoped AI chat, opened from reader AI button.
 */
import { useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

import { useStreamingChat } from "@readany/core/hooks/use-streaming-chat";
import { useChatStore } from "@/stores/chat-store";
import { useLibraryStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings-store";
import { convertToMessageV2, mergeMessagesWithStreaming } from "@readany/core/utils/chat-utils";
import type { MessageV2 } from "@readany/core/types/message";
import type { AttachedQuote } from "@readany/core/types";

import { useColors, fontSize as fs, radius, fontWeight as fw } from "@/styles/theme";
import type { ThemeColors } from "@/styles/theme";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChevronLeftIcon } from "@/components/ui/Icon";

type Props = NativeStackScreenProps<RootStackParamList, "BookChat">;

export function BookChatScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors);

  const { books } = useLibraryStore();
  const book = useMemo(() => books.find((b) => b.id === bookId), [books, bookId]);

  const {
    threads,
    loadThreads,
    getActiveThreadId,
    setBookActiveThread,
  } = useChatStore();

  useEffect(() => {
    loadThreads(bookId);
  }, [bookId, loadThreads]);

  const activeThreadId = getActiveThreadId(bookId);
  const activeThread = useMemo(
    () => (activeThreadId ? threads.find((t) => t.id === activeThreadId) : null),
    [threads, activeThreadId],
  );

  const {
    isStreaming,
    currentMessage,
    currentStep,
    error,
    sendMessage,
    stopStream,
  } = useStreamingChat({ book, bookId });

  const messagesV2: MessageV2[] = useMemo(() => {
    if (!activeThread) return [];
    return convertToMessageV2(activeThread.messages);
  }, [activeThread?.messages]);

  const allMessages = useMemo(
    () => mergeMessagesWithStreaming(messagesV2, currentMessage, isStreaming),
    [messagesV2, currentMessage, isStreaming],
  );

  const handleSend = useCallback(
    async (text: string, deepThinking: boolean, quotes?: AttachedQuote[]) => {
      // Validate AI config before sending
      const { aiConfig } = useSettingsStore.getState();
      const endpoint = aiConfig.endpoints.find((e) => e.id === aiConfig.activeEndpointId);
      if (!endpoint?.apiKey || !aiConfig.activeModel) {
        Alert.alert(
          t("chat.configRequired", "需要配置 AI"),
          t("chat.configRequiredMessage", "请先在设置中配置 AI 端点和模型"),
          [
            { text: t("common.cancel", "取消"), style: "cancel" },
            {
              text: t("common.settings", "去设置"),
              onPress: () => navigation.navigate("AISettings"),
            },
          ],
        );
        return;
      }
      await sendMessage(text, bookId, deepThinking, quotes);
    },
    [sendMessage, bookId, navigation, t],
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {t("chat.aiAssistant", "AI 助手")}
        </Text>
        <ModelSelector
          onNavigateToSettings={() => navigation.navigate("AISettings")}
        />
      </View>

      <KeyboardAvoidingView
        style={s.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={s.content}>
          <MessageList
            messages={allMessages}
            isStreaming={isStreaming}
            currentStep={currentStep}
          />
        </View>
        <ChatInput
          onSend={handleSend}
          onStop={stopStream}
          isStreaming={isStreaming}
          placeholder={t("chat.askAboutBook", "询问关于这本书的问题...")}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 8,
    },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: fs.sm,
      fontWeight: fw.medium,
      color: colors.foreground,
      textAlign: "center",
    },
    content: { flex: 1 },
  });
