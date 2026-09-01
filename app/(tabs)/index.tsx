import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { solarToLunar } from "../../constants/lunar";
import { getSolarFestival, getLunarFestival } from "../../constants/festivals";
import DayDetailModal, { DayInfo } from "../../components/DayDetailModal";
import AddEventModal from "../../components/AddEventModal";
import DailyQuoteCard from "../../components/DailyQuoteCard";
import { useEventStore } from "../../store/eventStore";
import { useTheme } from "../../context/ThemeContext";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// DayInfo được import từ components/DayDetailModal.tsx (dùng chung type, tránh định nghĩa trùng)

export default function CalendarScreen() {
  const { colors } = useTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [eventPrefillDay, setEventPrefillDay] = useState<DayInfo | null>(null);
  const events = useEventStore((s) => s.events);

  const days: DayInfo[] = useMemo(() => {
    const total = getDaysInMonth(year, month);
    const result: DayInfo[] = [];
    for (let d = 1; d <= total; d++) {
      const lunar = solarToLunar(d, month, year);
      const isLeapMonth = lunar.leap;
      const lunarMonth = lunar.month;

      // Tra cứu lễ VN từ file config riêng
      const festivals: string[] = [];
      const solarFestival = getSolarFestival(month, d);
      if (solarFestival) festivals.push(solarFestival);
      const lunarFestival = getLunarFestival(
        lunarMonth,
        lunar.day,
        isLeapMonth,
      );
      if (lunarFestival) festivals.push(lunarFestival);

      // Lọc sự kiện đã lưu khớp với ngày này (xét cả loại lịch dương/âm và có lặp hàng năm hay không)
      const matchedEvents = events.filter((ev) => {
        if (ev.calendarType === "solar") {
          const dayMatch = ev.day === d && ev.month === month;
          return ev.repeatType === "yearly"
            ? dayMatch
            : dayMatch && ev.year === year;
        } else {
          const dayMatch = ev.day === lunar.day && ev.month === lunarMonth;
          return ev.repeatType === "yearly"
            ? dayMatch
            : dayMatch && ev.year === lunar.year;
        }
      });

      result.push({
        date: d,
        lunarDay: lunar.day,
        lunarMonth,
        lunarYear: lunar.year,
        jd: lunar.jd,
        isLeapMonth,
        isToday:
          d === today.getDate() &&
          month === today.getMonth() + 1 &&
          year === today.getFullYear(),
        festivals,
        matchedEvents,
      });
    }
    return result;
  }, [year, month, events]);

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

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const renderLunarLabel = (day: DayInfo) => {
    // Mùng 1 -> hiện rõ tháng âm, có đánh dấu nhuận
    if (day.lunarDay === 1) {
      return `1/${day.lunarMonth}${day.isLeapMonth ? " (N)" : ""}`;
    }
    return `${day.lunarDay}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn}>
          <Text style={[styles.navText, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tháng {month} - {year}
          </Text>
          <TouchableOpacity
            onPress={goToToday}
            style={[styles.todayBtn, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.todayBtnText, { color: colors.primary }]}>
              Hôm nay
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn}>
          <Text style={[styles.navText, { color: colors.text }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.weekRow, { borderColor: colors.border }]}>
        {WEEKDAYS.map((wd) => (
          <Text
            key={wd}
            style={[styles.weekDayText, { color: colors.textSecondary }]}
          >
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={[styles.dayCell, { borderColor: colors.border }]}
          />
        ))}
        {days.map((day) => {
          const hasFestival = day.festivals.length > 0;
          const hasEvent = day.matchedEvents.length > 0;
          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCell,
                { borderColor: colors.border },
                day.isToday && {
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                },
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: colors.text },
                  day.isToday && { color: "#fff" },
                  hasFestival &&
                    !day.isToday && { color: colors.danger, fontWeight: "700" },
                ]}
              >
                {day.date}
              </Text>
              <Text
                style={[
                  styles.lunarText,
                  { color: colors.textSecondary },
                  day.isToday && { color: "#fff" },
                  day.isLeapMonth &&
                    day.lunarDay === 1 && {
                      color: colors.accent,
                      fontWeight: "700",
                    },
                ]}
              >
                {renderLunarLabel(day)}
              </Text>
              <View style={styles.dotRow}>
                {hasFestival && (
                  <View
                    style={[
                      styles.festivalDot,
                      { backgroundColor: colors.danger },
                    ]}
                  />
                )}
                {hasEvent && (
                  <View
                    style={[styles.eventDot, { backgroundColor: "#F5B400" }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.festivalDot, { backgroundColor: colors.danger }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Ngày lễ
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.eventDot, { backgroundColor: "#F5B400" }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Có sự kiện
          </Text>
        </View>
      </View>

      <DailyQuoteCard />

      <DayDetailModal
        day={selectedDay}
        month={month}
        year={year}
        onClose={() => setSelectedDay(null)}
        onAddEvent={() => {
          setEventPrefillDay(selectedDay);
          setSelectedDay(null);
          setAddEventOpen(true);
        }}
      />

      <AddEventModal
        visible={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        initialSolar={
          eventPrefillDay
            ? { day: eventPrefillDay.date, month, year }
            : undefined
        }
        initialLunar={
          eventPrefillDay
            ? {
                day: eventPrefillDay.lunarDay,
                month: eventPrefillDay.lunarMonth,
                year: eventPrefillDay.lunarYear,
              }
            : undefined
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 24, fontWeight: "600" },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  todayBtn: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBtnText: { fontSize: 12, fontWeight: "600" },
  weekRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
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
  },
  dayText: { fontSize: 16, fontWeight: "500" },
  lunarText: { fontSize: 11, marginTop: 2 },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  festivalDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  legendRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { fontSize: 12 },
});
