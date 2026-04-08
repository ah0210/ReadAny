/**
 * FloatingTTSBubble — Global draggable mini-player shown when TTS is active.
 *
 * Rendered as a sibling to NavigationContainer in AppInner so it floats
 * above every screen. Tapping it expands a compact player modal.
 *
 * Design:
 * - Bubble always shows headphones icon (no play/pause switching)
 * - Pulsing ring animation when playing; no animation when paused
 * - No X close badge — stop is inside the expanded mini player
 * - Tap bubble → toggle mini player
 * - Long press bubble → stop TTS
 */
import { useTTSStore } from "@/stores";
import { fontSize, radius, useColors } from "@/styles/theme";
import { navigate } from "@/lib/navigationRef";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// ─── Icons ───────────────────────────────────────────────────────────────────

function HeadphonesIcon({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </Svg>
  );
}

function PlayIcon({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}

function PauseIcon({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Svg>
  );
}

function SquareIcon({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M6 6h12v12H6z" />
    </Svg>
  );
}

function BookOpenIcon({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  );
}

// ─── Compact expanded player modal ───────────────────────────────────────────

function TTSMiniPlayer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const playState = useTTSStore((s) => s.playState);
  const currentBookTitle = useTTSStore((s) => s.currentBookTitle);
  const currentChapterTitle = useTTSStore((s) => s.currentChapterTitle);
  const currentBookId = useTTSStore((s) => s.currentBookId);
  const config = useTTSStore((s) => s.config);
  const pause = useTTSStore((s) => s.pause);
  const resume = useTTSStore((s) => s.resume);
  const stop = useTTSStore((s) => s.stop);
  const updateConfig = useTTSStore((s) => s.updateConfig);

  const handleStop = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  const handleGoToReader = useCallback(() => {
    if (currentBookId) {
      navigate("Reader", { bookId: currentBookId });
    }
    onClose();
  }, [currentBookId, onClose]);

  const handlePlayPause = useCallback(() => {
    if (playState === "playing") {
      pause();
    } else if (playState === "paused") {
      resume();
    }
  }, [playState, pause, resume]);

  const adjustRate = useCallback(
    (delta: number) => {
      const newRate = Math.round(Math.max(0.5, Math.min(2.0, config.rate + delta)) * 10) / 10;
      updateConfig({ rate: newRate });
    },
    [config.rate, updateConfig],
  );

  // Pulse animation for the headphones icon when playing
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (playState === "playing") {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }
    pulseAnim.setValue(1);
  }, [playState, pulseAnim]);

  const statusText =
    playState === "loading"
      ? "加载中…"
      : playState === "playing"
        ? "播放中"
        : playState === "paused"
          ? "已暂停"
          : "已停止";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={onClose}
        accessible={false}
      />
      <View
        style={[
          styles.miniPlayerContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            bottom: (insets.bottom || 20) + 80,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Header row */}
        <View style={styles.miniPlayerHeader}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <HeadphonesIcon size={18} color={colors.primary} />
          </Animated.View>
          <View style={styles.miniPlayerTitleGroup}>
            <Text style={[styles.miniPlayerBook, { color: colors.foreground }]} numberOfLines={1}>
              {currentBookTitle || "正在听书"}
            </Text>
            {!!currentChapterTitle && (
              <Text
                style={[styles.miniPlayerChapter, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {currentChapterTitle}
              </Text>
            )}
          </View>
          <Text style={[styles.miniPlayerStatus, { color: colors.mutedForeground }]}>
            {statusText}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.miniPlayerDivider, { backgroundColor: colors.border }]} />

        {/* Controls row */}
        <View style={styles.miniPlayerControls}>
          {/* Rate adjust */}
          <TouchableOpacity
            style={[styles.miniPlayerRateBtn, { backgroundColor: colors.muted }]}
            onPress={() => adjustRate(-0.1)}
          >
            <Text style={[styles.miniPlayerRateText, { color: colors.foreground }]}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.miniPlayerRateValue, { color: colors.mutedForeground }]}>
            {config.rate.toFixed(1)}x
          </Text>

          <TouchableOpacity
            style={[styles.miniPlayerRateBtn, { backgroundColor: colors.muted }]}
            onPress={() => adjustRate(0.1)}
          >
            <Text style={[styles.miniPlayerRateText, { color: colors.foreground }]}>+</Text>
          </TouchableOpacity>

          <View style={[styles.miniPlayerDividerV, { backgroundColor: colors.border }]} />

          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.miniPlayerPlayBtn, { backgroundColor: colors.primary }]}
            onPress={handlePlayPause}
            disabled={playState === "loading" || playState === "stopped"}
          >
            {playState === "loading" ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : playState === "playing" ? (
              <PauseIcon size={20} color={colors.primaryForeground} />
            ) : (
              <PlayIcon size={20} color={colors.primaryForeground} />
            )}
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity
            style={[styles.miniPlayerStopBtn, { backgroundColor: colors.muted }]}
            onPress={handleStop}
          >
            <SquareIcon size={16} color={colors.foreground} />
          </TouchableOpacity>

          {/* Go to reader */}
          {!!currentBookId && (
            <>
              <View style={[styles.miniPlayerDividerV, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={[styles.miniPlayerGoBtn, { backgroundColor: colors.muted }]}
                onPress={handleGoToReader}
              >
                <BookOpenIcon size={16} color={colors.foreground} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main floating bubble ─────────────────────────────────────────────────────

export function FloatingTTSBubble() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const playState = useTTSStore((s) => s.playState);

  const [showPlayer, setShowPlayer] = useState(false);

  // Only show when TTS is active (playing or paused)
  const isActive = playState === "playing" || playState === "paused" || playState === "loading";

  // When TTS stops, close the mini player
  useEffect(() => {
    if (!isActive) {
      setShowPlayer(false);
    }
  }, [isActive]);

  // Draggable position — starts at bottom right
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const bubbleRight = useRef(20);
  const bubbleBottom = useRef(120);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    }),
  ).current;

  // Ripple pulse rings — only when playing
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (playState === "playing") {
      const makeRipple = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        );

      const a1 = makeRipple(ring1, 0);
      const a2 = makeRipple(ring2, 700);
      a1.start();
      a2.start();
      return () => {
        a1.stop();
        a2.stop();
      };
    }
    ring1.setValue(0);
    ring2.setValue(0);
  }, [playState, ring1, ring2]);

  const makeRingStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.0] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.35, 0] }),
  });

  const handleBubbleTap = useCallback(() => {
    setShowPlayer((v) => !v);
  }, []);

  return (
    <>
      {/* Draggable bubble — only rendered when active */}
      {isActive && (
        <Animated.View
          style={[
            styles.bubbleWrapper,
            {
              right: bubbleRight.current,
              bottom: bubbleBottom.current + (insets.bottom || 0),
              transform: pan.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Ripple rings — playing only */}
          <Animated.View
            style={[styles.bubbleRing, { backgroundColor: colors.primary }, makeRingStyle(ring1)]}
            pointerEvents="none"
          />
          <Animated.View
            style={[styles.bubbleRing, { backgroundColor: colors.primary }, makeRingStyle(ring2)]}
            pointerEvents="none"
          />

          {/* Main bubble */}
          <TouchableOpacity
            style={[styles.bubble, { backgroundColor: colors.primary }]}
            onPress={handleBubbleTap}
            activeOpacity={0.85}
          >
            {playState === "loading" ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <HeadphonesIcon size={22} color={colors.primaryForeground} />
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Mini player modal — visible prop controls it independently so it
          can animate out even as isActive drops to false */}
      <TTSMiniPlayer
        visible={showPlayer && isActive}
        onClose={() => setShowPlayer(false)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BUBBLE_SIZE = 56;

const styles = StyleSheet.create({
  bubbleWrapper: {
    position: "absolute",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    zIndex: 9999,
  },
  bubbleRing: {
    position: "absolute",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    top: 0,
    left: 0,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  // Mini player
  miniPlayerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    overflow: "hidden",
  },
  miniPlayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  miniPlayerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  miniPlayerBook: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  miniPlayerChapter: {
    fontSize: fontSize.xs,
  },
  miniPlayerStatus: {
    fontSize: fontSize.xs,
  },
  miniPlayerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  miniPlayerControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  miniPlayerRateBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPlayerRateText: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 20,
  },
  miniPlayerRateValue: {
    fontSize: fontSize.xs,
    width: 36,
    textAlign: "center",
  },
  miniPlayerDividerV: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginHorizontal: 4,
  },
  miniPlayerPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPlayerStopBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPlayerGoBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
