import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMemoryStore, MemoryItem } from "../store/memoryStore";
import { useToastStore } from "../store/toastStore";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  editingItem?: MemoryItem | null;
  onClose: () => void;
};

export default function AddMemoryModal({
  visible,
  editingItem,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const addMemory = useMemoryStore((s) => s.addMemory);
  const updateMemory = useMemoryStore((s) => s.updateMemory);
  const showToast = useToastStore((s) => s.showToast);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!editingItem;

  useEffect(() => {
    if (!visible) return;
    if (editingItem) {
      setImageUri(editingItem.imageUri);
      setTitle(editingItem.title);
      setDay(editingItem.day ? String(editingItem.day) : "");
      setMonth(editingItem.month ? String(editingItem.month) : "");
      setYear(editingItem.year ? String(editingItem.year) : "");
      setDescription(editingItem.description ?? "");
    } else {
      setImageUri(null);
      setTitle("");
      setDay("");
      setMonth("");
      setYear("");
      setDescription("");
    }
    setError("");
  }, [visible, editingItem]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Cần cấp quyền truy cập thư viện ảnh", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!imageUri) {
      setError("Vui lòng chọn 1 ảnh");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }

    const data = {
      imageUri,
      title: title.trim(),
      day: day.trim() ? Number(day) : undefined,
      month: month.trim() ? Number(month) : undefined,
      year: year.trim() ? Number(year) : undefined,
      description: description.trim() || undefined,
    };

    if (isEditing && editingItem) {
      updateMemory(editingItem.id, data);
      showToast("Đã cập nhật");
    } else {
      addMemory(data);
      showToast("Đã thêm vào phòng trưng bày");
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.heading, { color: colors.text }]}>
                {isEditing ? "Sửa kỷ niệm" : "Thêm vào phòng trưng bày"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.imagePicker,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={handlePickImage}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text
                      style={[
                        styles.uploadText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Chạm để chọn ảnh từ thư viện
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Tiêu đề ảnh / Sự kiện *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="Ví dụ: Lễ mừng thọ ông nội"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  setError("");
                }}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Ngày diễn ra (không bắt buộc)
              </Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  placeholder="Ngày"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={day}
                  onChangeText={setDay}
                />
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  placeholder="Tháng"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={month}
                  onChangeText={setMonth}
                />
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  placeholder="Năm"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={year}
                  onChangeText={setYear}
                />
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nội dung kỷ niệm
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="Kể lại câu chuyện đằng sau bức ảnh..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {!!error && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {error}
                </Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text
                    style={[styles.cancelText, { color: colors.textSecondary }]}
                  >
                    Huỷ bỏ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>
                    {isEditing ? "Lưu thay đổi" : "Lưu hình ảnh"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "88%",
  },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  imagePicker: {
    height: 160,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  previewImage: { width: "100%", height: "100%" },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadText: { fontSize: 13 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  dateRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 90,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, marginBottom: 8 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "700" },
});
