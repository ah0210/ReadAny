/**
 * StatsScreen — Full reading stats page matching Tauri mobile MobileStatsPage.
 * Features: stats cards, heatmap/bar chart toggle, trend chart, period book list,
 * longest streak card.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { readingStatsService } from "@readany/core/stats";
import type { OverallStats, DailyStats, PeriodBookStats, TrendPoint } from "@readany/core/stats";
import { useReadingSessionStore } from "@readany/core/stores/reading-session-store";
import { colors, radius, fontSize, fontWeight } from "@/styles/theme";
import {
  BookOpenIcon,
  ClockIcon,
  FlameIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/Icon";

const SCREEN_WIDTH = Dimensions.get("window").width;

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number.parseInt(m)}/${Number.parseInt(d)}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ────────────────── StatCard ──────────────────

function StatCard({
  icon,
  title,
  value,
  unit,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
}) {
  return (
    <View style={s.statCard}>
      <View style={s.statCardHeader}>
        <Text style={s.statCardTitle}>{title}</Text>
        {icon}
      </View>
      <View style={s.statCardBody}>
        <Text style={s.statCardValue}>{value}</Text>
        {unit && <Text style={s.statCardUnit}>{unit}</Text>}
      </View>
    </View>
  );
}

// ────────────────── Heatmap (26 weeks matching Tauri) ──────────────────

function FullHeatmap({ dailyStats }: { dailyStats: DailyStats[] }) {
  const CELL = 10;
  const GAP = 2;
  const WEEKS = 26;

  const { cells, monthLabels } = useMemo(() => {
    const statsMap = new Map<string, number>();
    for (const d of dailyStats) statsMap.set(d.date, d.totalTime);

    const today = new Date();
    const todayDay = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (WEEKS * 7 + todayDay - 1));

    const result: { x: number; y: number; intensity: number; date: string }[] = [];
    const mLabels: { label: string; x: number }[] = [];
    const maxTime = Math.max(1, ...dailyStats.map((d) => d.totalTime));

    let weekIdx = 0;
    let lastMonth = -1;
    const cursor = new Date(startDate);
    let currentWeekDays: { date: string; time: number; dow: number }[] = [];

    while (cursor <= today) {
      const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const dow = cursor.getDay();
      const month = cursor.getMonth();

      if (dow === 0 && currentWeekDays.length > 0) {
        weekIdx++;
      }

      if (month !== lastMonth) {
        mLabels.push({ label: `${month + 1}月`, x: weekIdx * (CELL + GAP) });
        lastMonth = month;
      }

      const time = statsMap.get(dateStr) || 0;
      result.push({
        x: weekIdx * (CELL + GAP),
        y: dow * (CELL + GAP),
        intensity: time > 0 ? Math.min(1, time / maxTime) : 0,
        date: dateStr,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells: result, monthLabels: mLabels };
  }, [dailyStats]);

  const getColor = (intensity: number) => {
    if (intensity === 0) return colors.muted;
    if (intensity < 0.25) return "rgba(16,185,129,0.2)";
    if (intensity < 0.5) return "rgba(16,185,129,0.4)";
    if (intensity < 0.75) return "rgba(16,185,129,0.6)";
    return "rgba(16,185,129,0.85)";
  };

  const totalWidth = (WEEKS + 1) * (CELL + GAP);

  return (
    <View>
      {/* Month labels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth, height: 14 }}>
          {monthLabels.map((m, i) => (
            <Text
              key={`${m.label}-${i}`}
              style={{
                position: "absolute",
                left: m.x,
                top: 0,
                fontSize: 9,
                color: colors.mutedForeground,
              }}
            >
              {m.label}
            </Text>
          ))}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ height: 7 * (CELL + GAP), width: totalWidth }}>
          {cells.map((cell, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: cell.x,
                top: cell.y,
                width: CELL,
                height: CELL,
                borderRadius: 2,
                backgroundColor: getColor(cell.intensity),
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ────────────────── Bar Chart ──────────────────

function BarChart({
  data,
  labels,
}: {
  data: { label: string; value: number }[];
  labels?: string[];
}) {
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const BAR_HEIGHT = 140;

  if (data.length === 0) {
    return (
      <View style={s.barChartEmpty}>
        <Text style={s.barChartEmptyText}>暂无数据</Text>
      </View>
    );
  }

  return (
    <View style={s.barChartWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.barChartContent}
      >
        {data.map((item, idx) => (
          <View key={`${item.label}-${idx}`} style={s.barCol}>
            <View style={[s.barTrack, { height: BAR_HEIGHT }]}>
              <View
                style={[
                  s.barFill,
                  {
                    height: Math.max(2, (item.value / maxVal) * BAR_HEIGHT),
                    backgroundColor: item.value > 0 ? colors.emerald : colors.muted,
                  },
                ]}
              />
            </View>
            <Text style={s.barLabel}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ────────────────── Simple Trend Chart (area-like with bars) ──────────────────

function TrendChart({ data }: { data: TrendPoint[] }) {
  const { t } = useTranslation();
  const maxVal = Math.max(1, ...data.map((d) => d.dailyTime));
  const BAR_HEIGHT = 100;

  if (data.length === 0) {
    return (
      <View style={s.barChartEmpty}>
        <Text style={s.barChartEmptyText}>{t("stats.noData", "暂无数据")}</Text>
      </View>
    );
  }

  // Show every 5th label
  const showLabel = (idx: number) => idx === 0 || idx === data.length - 1 || idx % 5 === 0;

  return (
    <View style={s.barChartWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.trendContent}
      >
        {data.map((item, idx) => (
          <View key={item.date} style={s.trendCol}>
            <View style={[s.trendTrack, { height: BAR_HEIGHT }]}>
              <View
                style={[
                  s.trendBar,
                  {
                    height: Math.max(1, (item.dailyTime / maxVal) * BAR_HEIGHT),
                    backgroundColor:
                      item.dailyTime > 0 ? "rgba(16,185,129,0.5)" : "transparent",
                  },
                ]}
              />
            </View>
            {showLabel(idx) && (
              <Text style={s.trendLabel}>{formatDate(item.date)}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ────────────────── Period Book List ──────────────────

function PeriodBookList({ books }: { books: PeriodBookStats[] }) {
  const { t } = useTranslation();

  if (books.length === 0) {
    return (
      <Text style={s.periodBooksEmpty}>
        {t("stats.noBooksInPeriod", "本期间暂无阅读书籍")}
      </Text>
    );
  }

  return (
    <View style={{ gap: 6 }}>
      {books.map((book) => (
        <View key={book.bookId} style={s.bookRow}>
          {/* Cover placeholder */}
          <View style={s.bookCoverPlaceholder}>
            <Text style={s.bookCoverLetter}>{book.title.charAt(0)}</Text>
          </View>
          {/* Info */}
          <View style={s.bookInfo}>
            <View style={s.bookTitleRow}>
              <Text style={s.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={s.bookTime}>{formatTime(book.totalTime)}</Text>
            </View>
            {/* Progress bar */}
            <View style={s.progressRow}>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    { width: `${Math.min(book.progress * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={s.progressPercent}>
                {Math.round(book.progress * 100)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ────────────────── Types ──────────────────

type ChartView = "heatmap" | "bar";
type ChartMode = "week" | "month";

// ────────────────── StatsScreen ──────────────────

export default function StatsScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const saveCurrentSession = useReadingSessionStore((s) => s.saveCurrentSession);

  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<DailyStats[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  // Chart toggle state
  const [chartView, setChartView] = useState<ChartView>("heatmap");
  const [chartMode, setChartMode] = useState<ChartMode>("week");
  const [chartDate, setChartDate] = useState<Date>(() => getWeekStart(new Date()));
  const [chartData, setChartData] = useState<DailyStats[]>([]);
  const [periodBooks, setPeriodBooks] = useState<PeriodBookStats[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await saveCurrentSession();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const [daily, overall, trend] = await Promise.all([
        readingStatsService.getDailyStats(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]),
        readingStatsService.getOverallStats(),
        readingStatsService.getRecentTrend(30),
      ]);
      setHeatmapData(daily);
      setOverallStats(overall);
      setTrendData(trend);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }, [saveCurrentSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load chart data when mode/date changes
  useEffect(() => {
    if (loading) return;
    const loadChart = async () => {
      try {
        let periodStart: Date;
        let periodEnd: Date;

        if (chartMode === "week") {
          periodStart = chartDate;
          periodEnd = getWeekEnd(chartDate);
        } else {
          const year = chartDate.getFullYear();
          const month = chartDate.getMonth();
          periodStart = new Date(year, month, 1);
          periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        }

        const [data, books] = await Promise.all([
          readingStatsService.getDailyStats(
            periodStart.toISOString().split("T")[0],
            periodEnd.toISOString().split("T")[0],
          ),
          readingStatsService.getBookStatsForPeriod(
            periodStart.toISOString().split("T")[0],
            periodEnd.toISOString().split("T")[0],
          ),
        ]);
        setChartData(data);
        setPeriodBooks(books);
      } catch {
        // ignore
      }
    };
    loadChart();
  }, [chartMode, chartDate, loading]);

  const navigatePeriod = useCallback(
    (direction: -1 | 1) => {
      setChartDate((prev) => {
        const d = new Date(prev);
        if (chartMode === "week") {
          d.setDate(d.getDate() + direction * 7);
        } else {
          d.setMonth(d.getMonth() + direction);
        }
        return d;
      });
    },
    [chartMode],
  );

  const switchChartMode = useCallback((mode: ChartMode) => {
    setChartMode(mode);
    if (mode === "week") {
      setChartDate(getWeekStart(new Date()));
    } else {
      const now = new Date();
      setChartDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  }, []);

  const periodLabel = useMemo(() => {
    if (chartMode === "week") {
      const end = getWeekEnd(chartDate);
      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
      return `${fmt(chartDate)} – ${fmt(end)}`;
    }
    return `${chartDate.getFullYear()}年${chartDate.getMonth() + 1}月`;
  }, [chartDate, chartMode]);

  const barChartData = useMemo(() => {
    const dayNames = ["一", "二", "三", "四", "五", "六", "日"];
    if (chartMode === "week") {
      return chartData.map((d, i) => ({
        label: dayNames[i] || d.date.slice(5),
        value: d.totalTime,
      }));
    }
    return chartData.map((d) => ({
      label: String(new Date(d.date).getDate()),
      value: d.totalTime,
    }));
  }, [chartData, chartMode]);

  const booksRead = overallStats?.totalBooks ?? 0;
  const totalTime = overallStats ? formatTime(overallStats.totalReadingTime) : "0m";
  const streak = overallStats?.currentStreak ?? 0;
  const avgDaily = overallStats ? formatTime(overallStats.avgDailyTime) : "0m";

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.mutedForeground} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <ChevronLeftIcon size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t("stats.title", "阅读统计")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Stats cards */}
        <View style={s.statsGrid}>
          <StatCard
            icon={<BookOpenIcon size={16} color={colors.mutedForeground} />}
            title={t("profile.booksRead", "已读")}
            value={String(booksRead)}
            unit={t("profile.booksUnit", "本")}
          />
          <StatCard
            icon={<ClockIcon size={16} color={colors.mutedForeground} />}
            title={t("profile.totalTime", "总时长")}
            value={totalTime}
          />
          <StatCard
            icon={<FlameIcon size={16} color={colors.mutedForeground} />}
            title={t("profile.streak", "连续")}
            value={String(streak)}
            unit={t("profile.daysUnit", "天")}
          />
          <StatCard
            icon={<TrendingUpIcon size={16} color={colors.mutedForeground} />}
            title={t("profile.avgDaily", "日均")}
            value={avgDaily}
          />
        </View>

        {/* Heatmap / Bar Chart card — with toggle */}
        <View style={s.section}>
          <View style={s.sectionCard}>
            <View style={s.chartHeaderRow}>
              <Text style={s.chartHeaderLabel}>
                {t("profile.readingActivity", "阅读活动")}
              </Text>
              <View style={s.toggleRow}>
                <TouchableOpacity
                  style={[s.toggleBtn, chartView === "heatmap" && s.toggleBtnActive]}
                  onPress={() => setChartView("heatmap")}
                >
                  <Text style={[s.toggleBtnText, chartView === "heatmap" && s.toggleBtnTextActive]}>
                    {t("stats.viewHeatmap", "热力图")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, chartView === "bar" && s.toggleBtnActive]}
                  onPress={() => setChartView("bar")}
                >
                  <Text style={[s.toggleBtnText, chartView === "bar" && s.toggleBtnTextActive]}>
                    {t("stats.viewBarChart", "柱状图")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bar chart controls */}
            {chartView === "bar" && (
              <View style={s.barControlsRow}>
                <View style={s.toggleRow}>
                  <TouchableOpacity
                    style={[s.toggleBtn, chartMode === "week" && s.toggleBtnActive]}
                    onPress={() => switchChartMode("week")}
                  >
                    <Text style={[s.toggleBtnText, chartMode === "week" && s.toggleBtnTextActive]}>
                      {t("stats.periodWeek", "周")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.toggleBtn, chartMode === "month" && s.toggleBtnActive]}
                    onPress={() => switchChartMode("month")}
                  >
                    <Text style={[s.toggleBtnText, chartMode === "month" && s.toggleBtnTextActive]}>
                      {t("stats.periodMonth", "月")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={s.periodNav}>
                  <TouchableOpacity onPress={() => navigatePeriod(-1)} style={s.periodNavBtn}>
                    <ChevronLeftIcon size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <Text style={s.periodLabel}>{periodLabel}</Text>
                  <TouchableOpacity onPress={() => navigatePeriod(1)} style={s.periodNavBtn}>
                    <ChevronRightIcon size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Chart content */}
            {chartView === "heatmap" ? (
              <>
                <FullHeatmap dailyStats={heatmapData} />
                <View style={s.heatmapLegend}>
                  <Text style={s.legendText}>{t("common.less", "少")}</Text>
                  {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                    <View
                      key={v}
                      style={[
                        s.legendCell,
                        {
                          backgroundColor:
                            v === 0 ? colors.muted : `rgba(16,185,129,${v * 0.85 + 0.15})`,
                        },
                      ]}
                    />
                  ))}
                  <Text style={s.legendText}>{t("common.more", "多")}</Text>
                </View>
              </>
            ) : (
              <BarChart data={barChartData} />
            )}
          </View>
        </View>

        {/* Trend Chart */}
        <View style={s.section}>
          <View style={s.sectionCard}>
            <Text style={s.sectionCardTitle}>
              {t("stats.trendTitle", "30天阅读趋势")}
            </Text>
            <TrendChart data={trendData} />
          </View>
        </View>

        {/* Period Book List */}
        <View style={s.section}>
          <View style={s.sectionCard}>
            <Text style={s.sectionCardTitle}>
              {t("stats.periodBooks", "期间阅读书籍")}
            </Text>
            <PeriodBookList books={periodBooks} />
          </View>
        </View>

        {/* Longest streak */}
        {overallStats && overallStats.longestStreak > 0 && (
          <View style={s.section}>
            <View style={s.streakCard}>
              <View style={s.streakIconWrap}>
                <FlameIcon size={16} color={colors.amber} />
              </View>
              <View style={s.streakInfo}>
                <Text style={s.streakLabel}>
                  {t("stats.longestStreak", { days: overallStats.longestStreak }) ||
                    `最长连续阅读 ${overallStats.longestStreak} 天`}
                </Text>
                <Text style={s.streakDesc}>
                  {t("stats.longestStreakDesc", "历史最长连续阅读记录")}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.foreground },
  scrollContent: { padding: 16 },

  // Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  statCard: {
    width: "47%",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 14,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statCardTitle: { fontSize: fontSize.xs, color: colors.mutedForeground },
  statCardBody: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  statCardValue: { fontSize: fontSize["2xl"], fontWeight: fontWeight.bold, color: colors.foreground },
  statCardUnit: { fontSize: fontSize.sm, color: colors.mutedForeground },

  // Section
  section: { marginBottom: 12 },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 14,
  },
  sectionCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.mutedForeground,
    marginBottom: 12,
  },

  // Chart header with toggle
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chartHeaderLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.mutedForeground },
  toggleRow: {
    flexDirection: "row",
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  toggleBtnActive: { backgroundColor: colors.background },
  toggleBtnText: { fontSize: 10, fontWeight: fontWeight.medium, color: colors.mutedForeground },
  toggleBtnTextActive: { color: colors.foreground },

  // Bar controls
  barControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  periodNav: { flexDirection: "row", alignItems: "center", gap: 2 },
  periodNavBtn: { padding: 4, borderRadius: radius.sm },
  periodLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.mutedForeground,
    minWidth: 80,
    textAlign: "center",
  },

  // Heatmap legend
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 10,
  },
  legendText: { fontSize: 9, color: colors.mutedForeground },
  legendCell: { width: 10, height: 10, borderRadius: 2 },

  // Bar chart
  barChartWrap: { height: 180 },
  barChartContent: { alignItems: "flex-end", gap: 4, paddingBottom: 4 },
  barCol: { alignItems: "center", width: 28 },
  barTrack: { justifyContent: "flex-end", width: 16 },
  barFill: { width: 16, borderRadius: 4 },
  barLabel: { fontSize: 8, color: colors.mutedForeground, marginTop: 4 },
  barChartEmpty: { height: 120, alignItems: "center", justifyContent: "center" },
  barChartEmptyText: { fontSize: fontSize.xs, color: colors.mutedForeground },

  // Trend chart
  trendContent: { alignItems: "flex-end", gap: 1 },
  trendCol: { alignItems: "center", width: 10 },
  trendTrack: { justifyContent: "flex-end", width: 6 },
  trendBar: { width: 6, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  trendLabel: { fontSize: 7, color: colors.mutedForeground, marginTop: 2 },

  // Period books
  periodBooksEmpty: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingVertical: 16,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
  },
  bookCoverPlaceholder: {
    width: 28,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  bookCoverLetter: { fontSize: 10, color: colors.mutedForeground },
  bookInfo: { flex: 1, gap: 4 },
  bookTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  bookTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.foreground, flex: 1 },
  bookTime: { fontSize: 10, color: colors.mutedForeground },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: colors.emerald },
  progressPercent: { fontSize: 9, color: colors.mutedForeground },

  // Streak
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 12,
  },
  streakIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: "rgba(245,158,11,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakInfo: { gap: 2 },
  streakLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.foreground },
  streakDesc: { fontSize: 10, color: colors.mutedForeground },
});
