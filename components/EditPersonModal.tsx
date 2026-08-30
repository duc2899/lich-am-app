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
import { useToastStore } from "../store/toastStore";
import { Gender, Person } from "../types/family";
import ToggleButton from "./ToggleButton";

type Props = {
  visible: boolean;
  person: Person | null;
  onClose: () => void;
};

export default function EditPersonModal({ visible, person, onClose }: Props) {
  const editPerson = useFamilyStore((s) => s.editPerson);
  const showToast = useToastStore((s) => s.showToast);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);
  const [error, setError] = useState("");

  // Prefill lại data mỗi khi mở modal cho 1 người khác nhau
  useEffect(() => {
    if (visible && person) {
      setFullName(person.fullName);
      setGender(person.gender);
      setBirthYear(person.birthYear ? String(person.birthYear) : "");
      setDeathYear(person.deathYear ? String(person.deathYear) : "");
      setIsDeceased(!!person.deathYear);
      setError("");
    }
  }, [visible, person]);

  const currentYear = new Date().getFullYear();

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    const by = Number(birthYear);
    if (
      birthYear.trim() &&
      (!Number.isInteger(by) || by < 1900 || by > currentYear)
    ) {
      setError("Năm sinh không hợp lệ");
      return false;
    }
    if (isDeceased) {
      const dy = Number(deathYear);
      if (
        !deathYear.trim() ||
        !Number.isInteger(dy) ||
        dy < 1900 ||
        dy > currentYear
      ) {
        setError("Năm mất không hợp lệ");
        return false;
      }
      if (birthYear.trim() && dy < by) {
        setError("Năm mất phải sau năm sinh");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSave = () => {
    if (!validate() || !person) return;

    editPerson(person.id, {
      fullName: fullName.trim(),
      gender,
      birthYear: birthYear.trim() ? Number(birthYear) : undefined,
      deathYear: isDeceased && deathYear.trim() ? Number(deathYear) : undefined,
    });
    showToast("Đã cập nhật thông tin");
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
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.heading}>Sửa thông tin</Text>

            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
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
              />
              <ToggleButton
                active={gender === "female"}
                label="Nữ ♀"
                onPress={() => setGender("female")}
              />
            </View>

            <Text style={styles.label}>Năm sinh (không bắt buộc)</Text>
            <TextInput
              style={styles.input}
              placeholder="vd: 1975"
              keyboardType="number-pad"
              value={birthYear}
              onChangeText={(v) => {
                setBirthYear(v);
                setError("");
              }}
            />

            <Text style={styles.label}>Tình trạng</Text>
            <View style={styles.toggleRow}>
              <ToggleButton
                active={!isDeceased}
                label="Còn sống"
                onPress={() => setIsDeceased(false)}
              />
              <ToggleButton
                active={isDeceased}
                label="Đã mất"
                onPress={() => setIsDeceased(true)}
                color="#888"
              />
            </View>

            {isDeceased && (
              <>
                <Text style={styles.label}>Năm mất</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vd: 2020"
                  keyboardType="number-pad"
                  value={deathYear}
                  onChangeText={(v) => {
                    setDeathYear(v);
                    setError("");
                  }}
                />
              </>
            )}

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
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
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
