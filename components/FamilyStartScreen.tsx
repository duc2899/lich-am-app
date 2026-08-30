import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useFamilyStore } from "../store/familyStore";
import { useToastStore } from "../store/toastStore";
import { Gender } from "../types/family";
import ToggleButton from "./ToggleButton";

export default function FamilyStartScreen() {
  const createRootPerson = useFamilyStore((s) => s.createRootPerson);
  const showToast = useToastStore((s) => s.showToast);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!birthYear.trim()) {
      setError("Vui lòng nhập năm sinh");
      return;
    }
    const y = Number(birthYear);
    if (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear()) {
      setError("Năm sinh không hợp lệ");
      return;
    }

    createRootPerson({ fullName: fullName.trim(), gender, birthYear: y });
    showToast(`Đã tạo "${fullName.trim()}" làm người đầu tiên`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.icon}>🌳</Text>
        <Text style={styles.heading}>Bắt đầu xây gia phả</Text>
        <Text style={styles.subtitle}>
          Nhập người đầu tiên trong dòng họ (thường là ông/bà tổ) để bắt đầu.
          Sau đó bạn có thể thêm vợ/chồng, con cái từ người này.
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
          />
          <ToggleButton
            active={gender === "female"}
            label="Nữ ♀"
            onPress={() => setGender("female")}
          />
        </View>

        <Text style={styles.label}>Năm sinh *</Text>
        <TextInput
          style={styles.input}
          placeholder="vd: 1945"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          value={birthYear}
          onChangeText={(v) => {
            setBirthYear(v);
            setError("");
          }}
        />

        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Bắt đầu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  icon: { fontSize: 48, textAlign: "center", marginBottom: 12 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },
  label: { fontSize: 13, color: "#666", marginBottom: 8, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  errorText: {
    fontSize: 12,
    color: "#D9364A",
    marginBottom: 12,
    textAlign: "center",
  },
  startBtn: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
