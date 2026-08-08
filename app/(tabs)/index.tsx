import { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Solar } from "lunar-javascript";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

type DayInfo = {
  date: number;
  lunarDay: number;
  lunarMonth: number;
  isToday: boolean;
};

export default function CalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const days: DayInfo[] = useMemo(() => {
    const total = getDaysInMonth(year, month);
    const result: DayInfo[] = [];
    for (let d = 1; d <= total; d++) {
      const solar = Solar.fromYmd(year, month, d);
      const lunar = solar.getLunar();
      result.push({
        date: d,
        lunarDay: lunar.getDay(),
        lunarMonth: lunar.getMonth(),
        isToday:
          d === today.getDate() &&
          month === today.getMonth() + 1 &&
          year === today.getFullYear(),
      });
    }
    return result;
  }, [year, month]);

  const firstDayOffset = getFirstDayOfWeek(year, month);

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tháng {month} - {year}</Text>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekDayText}>{wd}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}
        {days.map((day) => (
          <View
            key={day.date}
            style={[styles.dayCell, day.isToday && styles.todayCell]}
          >
            <Text style={[styles.dayText, day.isToday && styles.todayText]}>
              {day.date}
            </Text>
            <Text style={[styles.lunarText, day.isToday && styles.todayText]}>
              {day.lunarDay === 1 ? `${day.lunarDay}/${day.lunarMonth}` : day.lunarDay}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 24, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  weekRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },
  todayCell: {
    backgroundColor: "#4A90D9",
    borderRadius: 8,
  },
  dayText: { fontSize: 16, fontWeight: "500" },
  lunarText: { fontSize: 11, color: "#999", marginTop: 2 },
  todayText: { color: "#fff" },
});