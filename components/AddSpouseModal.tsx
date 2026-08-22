import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFamilyStore } from "../store/familyStore";
import { Gender, Person } from "../types/family";
import ToggleButton from "./ToggleButton";

type Props = {
  visible: boolean;
  person: Person | null;
  onClose: () => void;
};

export default function AddSpouseModal({ visible, person, onClose }: Props) {
  const addSpouse = useFamilyStore((s) => s.addSpouse);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && person) {
      setFullName("");
      setGender(person.gender === "male" ? "female" : "male"); // mặc định ngược giới tính người hiện tại
      setBirthYear("");
      setError("");
    }
  }, [visible, person]);

  const handleSave = () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    const y = Number(birthYear);
    if (
      birthYear.trim() &&
      (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear())
    ) {
      setError("Năm sinh không hợp lệ");
      return;
    }
    if (!person) return;

    addSpouse(person.id, {
      fullName: fullName.trim(),
      gender,
      birthYear: birthYear.trim() ? y : undefined,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.heading}>
              Thêm vợ/chồng cho {person?.fullName ?? ""}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                setError("");
              }}
            />

            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.toggleRow}>
              <ToggleButton
                active={gender === "male"}
                label="Nam ♂"
                onPress={() => setGender("male")}
                color="#4A90D9"
              />
              <ToggleButton
                active={gender === "female"}
                color="#D96BA0"
                label="Nữ ♀"
                onPress={() => setGender("female")}
              />
            </View>

            <Text style={styles.label}>Năm sinh (không bắt buộc)</Text>
            <TextInput
              style={styles.input}
              placeholder="vd: 1975"
              keyboardType="number-pad"
              placeholderTextColor="#999"
              value={birthYear}
              onChangeText={(v) => {
                setBirthYear(v);
                setError("");
              }}
            />

            {error !== "" && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  heading: { fontSize: 17, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },
  label: { fontSize: 13, color: "#666", marginBottom: 8, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  toggleBtnActive: { backgroundColor: "#4A90D9" },
  errorText: { fontSize: 12, color: "#D9364A", marginBottom: 12 },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: "#888", fontWeight: "600" },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4A90D9",
    borderRadius: 8,
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
