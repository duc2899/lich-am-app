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

export default function EventsScreen() {
  const events = useEventStore((s) => s.events);
  const removeEvent = useEventStore((s) => s.removeEvent);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có sự kiện nào. Bấm nút + để thêm.
          </Text>
        }
        renderItem={({ item }) => {
          const cat = getCategoryByKey(item.category);
          const currentYear = new Date().getFullYear();
          const age =
            item.category === "birthday" ? currentYear - item.year : null;

          return (
            <View style={styles.eventCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{cat.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>
                  {item.title}
                  {age !== null && age >= 0 ? ` (${age} tuổi)` : ""}
                </Text>
                <Text style={styles.eventSub}>
                  {cat.label} · {item.day}/{item.month}/{item.year} (
                  {item.calendarType === "lunar" ? "Âm lịch" : "Dương lịch"}
                  {item.repeatType === "yearly"
                    ? ", lặp hàng năm"
                    : ", chỉ 1 lần"}
                  )
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeEvent(item.id)}>
                <Text style={styles.deleteText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAddOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddEventModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { padding: 16, flexGrow: 1 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF2FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 18 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#222" },
  eventSub: { fontSize: 12, color: "#888", marginTop: 4 },
  deleteText: { color: "#D9364A", fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A90D9",
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
