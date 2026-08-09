import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import {
  getYearCanChi,
  getMonthCanChi,
  getDayCanChi,
  getWeekdayName,
} from "../constants/lunar";
import { getCategoryByKey } from "../constants/eventCategories";
import { EventItem } from "../store/eventStore";

export type DayInfo = {
  date: number;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  jd: number;
  isLeapMonth: boolean;
  isToday: boolean;
  festivals: string[];
  matchedEvents: EventItem[];
};

type Props = {
  day: DayInfo | null;
  month: number;
  year: number;
  onClose: () => void;
  onAddEvent: () => void;
};

export default function DayDetailModal({
  day,
  month,
  year,
  onClose,
  onAddEvent,
}: Props) {
  return (
    <Modal
      visible={day !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {day && (
            <>
              <View style={styles.row}>
                <Text style={styles.icon}>✦</Text>
                <Text style={styles.label}>Ngày Dương Lịch: </Text>
                <Text style={styles.valueOrange}>
                  {day.date}-{month}-{year}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.icon}>✦</Text>
                <Text style={styles.label}>Ngày Âm Lịch: </Text>
                <Text style={styles.valueGreen}>
                  {day.lunarDay}-{day.lunarMonth}
                  {day.isLeapMonth ? " (nhuận)" : ""}-{day.lunarYear}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.icon}>✦</Text>
                <Text style={styles.label}>Ngày trong tuần: </Text>
                <Text style={styles.valueBold}>
                  {getWeekdayName(day.date, month, year)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.icon}>✦</Text>
                <Text style={styles.label}>Ngày </Text>
                <Text style={styles.valueBold}>{getDayCanChi(day.jd)}</Text>
                <Text style={styles.label}> tháng </Text>
                <Text style={styles.valueBold}>
                  {getMonthCanChi(day.lunarMonth, day.lunarYear)}
                </Text>
                <Text style={styles.label}> năm </Text>
                <Text style={styles.valueBold}>
                  {getYearCanChi(day.lunarYear)}
                </Text>
              </View>

              {day.festivals.length > 0 && (
                <View style={styles.festivalBox}>
                  <Text style={styles.festivalText}>
                    🎉 {day.festivals.join(", ")}
                  </Text>
                </View>
              )}

              {day.matchedEvents.length > 0 && (
                <View style={styles.eventsBox}>
                  {day.matchedEvents.map((ev) => {
                    const cat = getCategoryByKey(ev.category);
                    return (
                      <View key={ev.id} style={styles.eventRow}>
                        <Text style={styles.eventIcon}>{cat.icon}</Text>
                        <Text style={styles.eventTitleText}>{ev.title}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.addBtn} onPress={onAddEvent}>
                  <Text style={styles.addBtnText}>+ Thêm sự kiện</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
  },
  icon: { color: "#2E8B57", marginRight: 6, fontSize: 14 },
  label: { fontSize: 14, color: "#333" },
  valueOrange: { fontSize: 14, color: "#E07A00", fontWeight: "700" },
  valueGreen: { fontSize: 14, color: "#2E8B57", fontWeight: "700" },
  valueBold: { fontSize: 14, color: "#222", fontWeight: "700" },
  festivalBox: {
    marginTop: 4,
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#FFF4E5",
    borderRadius: 8,
  },
  festivalText: { fontSize: 13, color: "#8A4B00", fontWeight: "600" },
  eventsBox: {
    marginTop: 4,
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#FFF9E5",
    borderRadius: 8,
  },
  eventRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  eventIcon: { fontSize: 16, marginRight: 8 },
  eventTitleText: { fontSize: 13, color: "#7A6A00", fontWeight: "600" },
  actionRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#2E8B57",
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4A90D9",
    borderRadius: 8,
  },
  closeBtnText: { color: "#fff", fontWeight: "600" },
});
