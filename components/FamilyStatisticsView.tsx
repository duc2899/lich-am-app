import { ScrollView, View, Text, StyleSheet } from "react-native";
import { FamilyStatistics } from "../utils/familyStatistics";
import { useTheme } from "../context/ThemeContext";

type StatCard = {
  icon: string;
  iconBg: string;
  value: number;
  label: string;
  percent: number;
  barColor: string;
};

type Props = {
  stats: FamilyStatistics;
};

export default function FamilyStatisticsView({ stats }: Props) {
  const { colors } = useTheme();
  const total = stats.totalMembers || 1; // tránh chia 0

  const pct = (n: number) => Math.round((n / total) * 100);

  const cards: StatCard[] = [
    {
      icon: "👪",
      iconBg: "#E5E5E5",
      value: stats.totalMembers,
      label: "Tổng thành viên",
      percent: 100,
      barColor: "#999",
    },
    {
      icon: "♂",
      iconBg: "#DCEBFB",
      value: stats.maleCount,
      label: "Nam",
      percent: pct(stats.maleCount),
      barColor: "#4A90D9",
    },
    {
      icon: "♀",
      iconBg: "#FBE3EC",
      value: stats.femaleCount,
      label: "Nữ",
      percent: pct(stats.femaleCount),
      barColor: "#D96BA0",
    },
    {
      icon: "👰",
      iconBg: "#FBE3EC",
      value: stats.daughterInLawCount,
      label: "Con dâu",
      percent: pct(stats.daughterInLawCount),
      barColor: "#D96BA0",
    },
    {
      icon: "🤵",
      iconBg: "#DCEBFB",
      value: stats.sonInLawCount,
      label: "Con rể",
      percent: pct(stats.sonInLawCount),
      barColor: "#4A90D9",
    },
    {
      icon: "❤️",
      iconBg: "#FBE3EC",
      value: stats.marriedCount,
      label: "Đã kết hôn",
      percent: pct(stats.marriedCount),
      barColor: "#D9364A",
    },
    {
      icon: "💔",
      iconBg: "#E5E5E5",
      value: stats.unmarriedCount,
      label: "Chưa kết hôn",
      percent: pct(stats.unmarriedCount),
      barColor: "#B0B0B0",
    },
    {
      icon: "🕯️",
      iconBg: "#E5E5E5",
      value: stats.deceasedCount,
      label: "Đã mất",
      percent: pct(stats.deceasedCount),
      barColor: "#888",
    },
    {
      icon: "👑",
      iconBg: "#FFF4D6",
      value: stats.truongCount,
      label: "Con trưởng",
      percent: pct(stats.truongCount),
      barColor: "#F5B400",
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: colors.text }]}>
        Thống kê gia phả
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tổng quan số liệu về các thành viên trong dòng họ
      </Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <View
            key={c.label}
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: c.iconBg }]}>
                <Text style={styles.iconText}>{c.icon}</Text>
              </View>
              <Text
                style={[styles.percentText, { color: colors.textSecondary }]}
              >
                {c.percent}%
              </Text>
            </View>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {c.value}
            </Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              {c.label}
            </Text>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${c.percent}%`, backgroundColor: c.barColor },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          👑 Phân bố theo thế hệ
        </Text>
        {stats.generationCounts.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Chưa có dữ liệu
          </Text>
        ) : (
          (() => {
            const maxCount = Math.max(
              ...stats.generationCounts.map((g) => g.count),
            );
            return stats.generationCounts.map((g) => (
              <View key={g.generation} style={styles.genRow}>
                <Text
                  style={[styles.genLabel, { color: colors.textSecondary }]}
                >
                  Đời thứ {g.generation}
                </Text>
                <View
                  style={[
                    styles.genBarTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.genBarFill,
                      {
                        width: `${(g.count / maxCount) * 100}%`,
                        backgroundColor: "#F5B400",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.genCount, { color: colors.text }]}>
                  {g.count}
                </Text>
              </View>
            ));
          })()
        )}
        <Text style={[styles.footnote, { color: colors.textSecondary }]}>
          * Chỉ tính các thành viên đã được gán số thế hệ
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          👪 Tỉ lệ giới tính
        </Text>
        <View style={styles.genderBarTrack}>
          <View
            style={[
              styles.genderBarSegment,
              { flex: stats.maleCount || 0.001, backgroundColor: "#4A90D9" },
            ]}
          />
          <View
            style={[
              styles.genderBarSegment,
              { flex: stats.femaleCount || 0.001, backgroundColor: "#D96BA0" },
            ]}
          />
        </View>
        <View style={styles.genderLegendRow}>
          <View style={styles.genderLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#4A90D9" }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Nam — {stats.maleCount} người ({pct(stats.maleCount)}%)
            </Text>
          </View>
          <View style={styles.genderLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#D96BA0" }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Nữ — {stats.femaleCount} người ({pct(stats.femaleCount)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🐉 Con giáp
        </Text>
        {stats.zodiacCounts.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Chưa có dữ liệu
          </Text>
        ) : (
          (() => {
            const maxCount = stats.zodiacCounts[0].count;
            return stats.zodiacCounts.map((z) => (
              <View key={z.chi} style={styles.genRow}>
                <Text
                  style={[styles.zodiacLabel, { color: colors.textSecondary }]}
                >
                  {z.chi}
                </Text>
                <View
                  style={[
                    styles.genBarTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.genBarFill,
                      {
                        width: `${(z.count / maxCount) * 100}%`,
                        backgroundColor: "#E07A00",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.genCount, { color: colors.text }]}>
                  {z.count}
                </Text>
              </View>
            ));
          })()
        )}
        <Text style={[styles.footnote, { color: colors.textSecondary }]}>
          * Dự đoán dựa trên năm sinh (dương lịch), có thể lệch với người sinh
          trước Tết
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "31.5%",
    borderRadius: 14,
    padding: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 14 },
  percentText: { fontSize: 11, fontWeight: "600" },
  cardValue: { fontSize: 20, fontWeight: "700" },
  cardLabel: { fontSize: 11, marginTop: 2, marginBottom: 8 },
  barTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },

  section: { borderRadius: 14, padding: 16, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  genRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  genLabel: { width: 70, fontSize: 12 },
  zodiacLabel: { width: 50, fontSize: 12 },
  genBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  genBarFill: { height: "100%", borderRadius: 4 },
  genCount: { width: 24, fontSize: 12, fontWeight: "600", textAlign: "right" },
  footnote: { fontSize: 11, fontStyle: "italic", marginTop: 4 },
  emptyText: { fontSize: 13, textAlign: "center", paddingVertical: 12 },

  genderBarTrack: {
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 14,
  },
  genderBarSegment: { height: "100%" },
  genderLegendRow: { gap: 8 },
  genderLegendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, fontWeight: "500" },
});
