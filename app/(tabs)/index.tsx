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
import { useEventStore } from "../../store/eventStore";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// DayInfo được import từ components/DayDetailModal.tsx (dùng chung type, tránh định nghĩa trùng)

export default function CalendarScreen() {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Tháng {month} - {year}
          </Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>Hôm nay</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekDayText}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}
        {days.map((day) => {
          const hasFestival = day.festivals.length > 0;
          const hasEvent = day.matchedEvents.length > 0;
          return (
            <TouchableOpacity
              key={day.date}
              style={[styles.dayCell, day.isToday && styles.todayCell]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  day.isToday && styles.todayText,
                  hasFestival && !day.isToday && styles.festivalDayText,
                ]}
              >
                {day.date}
              </Text>
              <Text
                style={[
                  styles.lunarText,
                  day.isToday && styles.todayText,
                  day.isLeapMonth && day.lunarDay === 1 && styles.leapText,
                ]}
              >
                {renderLunarLabel(day)}
              </Text>
              <View style={styles.dotRow}>
                {hasFestival && <View style={styles.festivalDot} />}
                {hasEvent && <View style={styles.eventDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.festivalDot} />
          <Text style={styles.legendText}>Ngày lễ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.eventDot} />
          <Text style={styles.legendText}>Có sự kiện</Text>
        </View>
      </View>

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
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  todayBtn: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#EAF2FB",
    borderRadius: 12,
  },
  todayBtnText: { fontSize: 12, color: "#4A90D9", fontWeight: "600" },
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
  leapText: { color: "#E07A00", fontWeight: "700" },
  todayText: { color: "#fff" },
  festivalDayText: { color: "#D9364A", fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  festivalDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9364A",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#F5B400",
  },
  legendRow: {
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 5 },
  legendText: { fontSize: 12, color: "#666" },
});
