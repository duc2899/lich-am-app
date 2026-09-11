import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useMemoryStore, MemoryItem } from "../store/memoryStore";
import AddMemoryModal from "./AddMemoryModal";
import MemoryDetailModal from "./MemoryDetailModal";
import { useTheme } from "../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 8;
const COLUMNS = 2;
const ITEM_SIZE = (SCREEN_WIDTH - 32 - GRID_GAP) / COLUMNS;

type ViewMode = "grid" | "timeline";

export default function MemoryGalleryView() {
  const { colors } = useTheme();
  const items = useMemoryStore((s) => s.items);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);

  const groupedByYear = useMemo(() => {
    const groups = new Map<string, MemoryItem[]>();
    for (const item of items) {
      const key = item.year ? String(item.year) : "Kỷ niệm khác";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (a === "Kỷ niệm khác") return 1;
      if (b === "Kỷ niệm khác") return -1;
      return Number(b) - Number(a);
    });
    return sortedKeys.map((key) => ({ key, items: groups.get(key)! }));
  }, [items]);

  const handleEdit = (item: MemoryItem) => {
    setSelectedItem(null);
    setEditingItem(item);
  };

  const handleCloseAddEdit = () => {
    setAddOpen(false);
    setEditingItem(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Phòng trưng bày
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Lưu giữ những kỷ niệm và khoảnh khắc đáng nhớ
        </Text>
      </View>

      <View style={styles.toolbarRow}>
        <View
          style={[
            styles.viewToggle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === "grid" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Text
              style={{
                color: viewMode === "grid" ? "#fff" : colors.textSecondary,
              }}
            >
              ▦
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === "timeline" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("timeline")}
          >
            <Text
              style={{
                color: viewMode === "timeline" ? "#fff" : colors.textSecondary,
              }}
            >
              🕐
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setAddOpen(true)}
        >
          <Text style={styles.addBtnText}>+ Thêm hình ảnh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Chưa có hình ảnh nào. Bấm "+ Thêm hình ảnh" để bắt đầu lưu giữ kỷ
            niệm.
          </Text>
        ) : viewMode === "grid" ? (
          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedItem(item)}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.gridImage,
                    { width: ITEM_SIZE, height: ITEM_SIZE * 1.2 },
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          groupedByYear.map((group) => (
            <View key={group.key} style={styles.timelineGroup}>
              <View style={styles.timelineHeaderRow}>
                <Text style={styles.timelineIcon}>🕐</Text>
                <Text style={[styles.timelineYear, { color: colors.text }]}>
                  {group.key}
                </Text>
              </View>
              <View
                style={[
                  styles.timelineDivider,
                  { backgroundColor: colors.accent },
                ]}
              />
              <View style={styles.timelineItemsGrid}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.timelineCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.timelineImage}
                      resizeMode="cover"
                    />
                    <View style={styles.timelineCardBody}>
                      {item.day && item.month && item.year && (
                        <View
                          style={[
                            styles.dateBadge,
                            { backgroundColor: colors.accent + "33" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dateBadgeText,
                              { color: colors.text },
                            ]}
                          >
                            📅 {String(item.day).padStart(2, "0")}/
                            {String(item.month).padStart(2, "0")}/{item.year}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={[styles.timelineTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <AddMemoryModal
        visible={addOpen || editingItem !== null}
        editingItem={editingItem}
        onClose={handleCloseAddEdit}
      />
      <MemoryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12 },
  heading: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },

  toolbarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  viewToggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 13,
    lineHeight: 20,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  gridImage: { borderRadius: 12 },

  timelineGroup: { marginBottom: 20 },
  timelineHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  timelineIcon: { fontSize: 16 },
  timelineYear: { fontSize: 17, fontWeight: "700" },
  timelineDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 12,
    opacity: 0.5,
  },
  timelineItemsGrid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  timelineCard: {
    width: ITEM_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  timelineImage: { width: "100%", height: ITEM_SIZE },
  timelineCardBody: { padding: 8 },
  dateBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  dateBadgeText: { fontSize: 10, fontWeight: "600" },
  timelineTitle: { fontSize: 13, fontWeight: "600" },
});
