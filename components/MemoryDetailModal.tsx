import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MemoryItem, useMemoryStore } from "../store/memoryStore";
import { useToastStore } from "../store/toastStore";
import { useTheme } from "../context/ThemeContext";

type Props = {
  item: MemoryItem | null;
  onClose: () => void;
  onEdit: (item: MemoryItem) => void;
};

export default function MemoryDetailModal({ item, onClose, onEdit }: Props) {
  const { colors } = useTheme();
  const removeMemory = useMemoryStore((s) => s.removeMemory);
  const showToast = useToastStore((s) => s.showToast);

  if (!item) return null;

  const handleDelete = () => {
    Alert.alert(
      "Xoá ảnh này?",
      `"${item.title}" sẽ bị xoá khỏi phòng trưng bày. Không thể hoàn tác.`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            removeMemory(item.id);
            showToast("Đã xoá ảnh");
            onClose();
          },
        },
      ],
    );
  };

  const dateLabel =
    item.day && item.month && item.year
      ? `${String(item.day).padStart(2, "0")}/${String(item.month).padStart(2, "0")}/${item.year}`
      : null;

  const addedLabel = new Date(item.createdAt).toLocaleDateString("vi-VN");

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.infoBox}>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            {dateLabel && (
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                📅 {dateLabel}
              </Text>
            )}
            <Text
              style={[
                styles.description,
                {
                  color: item.description ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {item.description || "Không có nội dung mô tả."}
            </Text>
          </View>

          <View style={[styles.footer, { borderColor: colors.border }]}>
            <Text style={[styles.addedText, { color: colors.textSecondary }]}>
              Đã thêm vào {addedLabel}
            </Text>
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => onEdit(item)}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Sửa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.danger + "22" },
                ]}
                onPress={handleDelete}
              >
                <Text style={[styles.actionText, { color: colors.danger }]}>
                  Xoá
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  card: { borderRadius: 16, overflow: "hidden", maxHeight: "85%" },
  image: { width: "100%", height: 320 },
  infoBox: { padding: 16 },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  date: { fontSize: 13, marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addedText: { fontSize: 12 },
  footerActions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  actionText: { fontSize: 13, fontWeight: "600" },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
