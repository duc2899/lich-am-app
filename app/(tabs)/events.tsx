import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useEventStore } from "../../store/eventStore";
import AddEventModal from "../../components/AddEventModal";
import { getCategoryByKey } from "../../constants/eventCategories";
import { useTheme } from "../../context/ThemeContext";

export default function EventsScreen() {
  const { colors } = useTheme();
  const events = useEventStore((s) => s.events);
  const removeEvent = useEventStore((s) => s.removeEvent);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Chưa có sự kiện nào. Bấm nút + để thêm.
          </Text>
        }
        renderItem={({ item }) => {
          const cat = getCategoryByKey(item.category);
          const currentYear = new Date().getFullYear();
          const age =
            item.category === "birthday" ? currentYear - item.year : null;

          return (
            <View
              style={[styles.eventCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={styles.iconText}>{cat.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>
                  {item.title}
                  {age !== null && age >= 0 ? ` (${age} tuổi)` : ""}
                </Text>
                <Text
                  style={[styles.eventSub, { color: colors.textSecondary }]}
                >
                  {cat.label} · {item.day}/{item.month}/{item.year} (
                  {item.calendarType === "lunar" ? "Âm lịch" : "Dương lịch"}
                  {item.repeatType === "yearly"
                    ? ", lặp hàng năm"
                    : ", chỉ 1 lần"}
                  )
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeEvent(item.id)}>
                <Text style={[styles.deleteText, { color: colors.danger }]}>
                  Xoá
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setAddOpen(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddEventModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, flexGrow: 1 },
  emptyText: { textAlign: "center", marginTop: 40 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 18 },
  eventTitle: { fontSize: 15, fontWeight: "700" },
  eventSub: { fontSize: 12, marginTop: 4 },
  deleteText: { fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
