import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Person } from "../types/family";
import { PersonRelations } from "../utils/familyRelations";
import { useTheme } from "../context/ThemeContext";

type Props = {
  person: Person | null;
  relations: PersonRelations | null;
  onClose: () => void;
  onAddSpouse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isTruong: boolean;
  isMe: boolean;
  onToggleMe: () => void;
};

export default function PersonDetailModal({
  person,
  relations,
  onClose,
  onAddSpouse,
  onEdit,
  onDelete,
  isTruong,
  isMe,
  onToggleMe,
}: Props) {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const isDeceased = !!person?.deathYear;

  return (
    <Modal
      visible={person !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Pressable style={[styles.overlay]} onPress={onClose}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {person && (
              <>
                <View style={styles.header}>
                  <Text style={[styles.genderIcon, { color: colors.primary }]}>
                    {person.gender === "male" ? "♂" : "♀"}
                  </Text>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {isTruong ? "👑 " : ""}
                    {person.fullName}
                    {isMe ? "  (Tôi)" : ""}
                  </Text>
                  <TouchableOpacity style={styles.editIconBtn} onPress={onEdit}>
                    <Text style={styles.editIconText}>✏️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Giới tính:{" "}
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {person.gender === "male" ? "Nam" : "Nữ"}
                  </Text>
                </View>

                {person.birthYear && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Năm sinh: </Text>
                    <Text style={[styles.value, { color: colors.text }]}>{person.birthYear}</Text>
                  </View>
                )}

                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.text }]}>Tình trạng: </Text>
                  {isDeceased ? (
                    <Text style={[styles.value, styles.deceasedText]}>
                      Đã mất{person.deathYear ? ` (${person.deathYear})` : ""}
                      {person.birthYear && person.deathYear
                        ? ` · Hưởng thọ ${person.deathYear - person.birthYear} tuổi`
                        : ""}
                    </Text>
                  ) : (
                    <Text style={[styles.value, { color: colors.text }]}>
                      Còn sống
                      {person.birthYear
                        ? ` · ${currentYear - person.birthYear} tuổi`
                        : ""}
                    </Text>
                  )}
                </View>

                {relations && (relations.father || relations.mother) && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Cha mẹ: </Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {[relations.father?.fullName, relations.mother?.fullName]
                        .filter(Boolean)
                        .join(" & ")}
                    </Text>
                  </View>
                )}

                {relations && relations.spouses.length > 0 && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {person.gender === "male" ? "Vợ: " : "Chồng: "}
                    </Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {relations.spouses.map((s) => s.fullName).join(", ")}
                    </Text>
                  </View>
                )}

                {relations && relations.children.length > 0 && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Con ({relations.children.length}):{" "}
                    </Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {relations.children.map((c) => c.fullName).join(", ")}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.addSpouseBtn, { backgroundColor: colors.primary }]}
                  onPress={onAddSpouse}
                >
                  <Text style={[styles.addSpouseBtnText]}>
                    {relations && relations.spouses.length > 0
                      ? "+ Thêm vợ/chồng khác"
                      : "+ Thêm vợ/chồng"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.meBtn, { backgroundColor: isMe ? colors.success : colors.textSecondary }]}
                  onPress={onToggleMe}
                >
                  <Text
                    style={[styles.meBtnText, { color: colors.text }]}
                  >
                    {isMe ? "✓ Đây là tôi" : "Đánh dấu đây là tôi"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                  <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.surface }]} onPress={onDelete}>
                    <Text style={styles.deleteBtnText}>Xoá</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
                    <Text style={styles.closeBtnText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  genderIcon: {
    fontSize: 20,
    marginRight: 8,
    color: "#4A90D9",
    fontWeight: "700",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
    flex: 1,
  },
  editIconBtn: { padding: 4, marginLeft: 8 },
  editIconText: { fontSize: 16 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "500", flexShrink: 1 },
  deceasedText: { color: "#999" },
  addSpouseBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addSpouseBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  meBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  meBtnText: { fontWeight: "600", fontSize: 13 },
  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: { color: "#D9364A", fontWeight: "700", fontSize: 13 },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: { color: "#fff", fontWeight: "600" },
});
