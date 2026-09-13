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
import DateInputFields from "./DateInputFields";
import { validateDateParts, parseDateParts } from "../utils/dateValidation";
import { useTheme } from "../context/ThemeContext";

export default function FamilyStartScreen() {
  const { colors } = useTheme();
  const createRootPerson = useFamilyStore((s) => s.createRootPerson);
  const showToast = useToastStore((s) => s.showToast);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    const dateError = validateDateParts(birthDay, birthMonth, birthYear, {
      yearRequired: true,
      fieldLabel: "sinh",
    });
    if (dateError) {
      setError(dateError);
      return;
    }

    const { day, month, year } = parseDateParts(
      birthDay,
      birthMonth,
      birthYear,
    );
    createRootPerson({
      fullName: fullName.trim(),
      gender,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
    });
    showToast(`Đã tạo "${fullName.trim()}" làm người đầu tiên`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={styles.icon}>🌳</Text>
        <Text style={[styles.heading, { color: colors.text }]}>
          Bắt đầu xây gia phả
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Nhập người đầu tiên trong dòng họ (thường là ông/bà tổ) để bắt đầu.
          Sau đó bạn có thể thêm vợ/chồng, con cái từ người này.
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
          placeholder="Họ và tên"
          placeholderTextColor={colors.textSecondary}
          value={fullName}
          onChangeText={(v) => {
            setFullName(v);
            setError("");
          }}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Giới tính
        </Text>
        <View style={styles.toggleRow}>
          <ToggleButton
            color={colors.male}
            active={gender === "male"}
            label="Nam ♂"
            onPress={() => setGender("male")}
          />
          <ToggleButton
            color={colors.female}
            active={gender === "female"}
            label="Nữ ♀"
            onPress={() => setGender("female")}
          />
        </View>

        <DateInputFields
          label="Ngày sinh"
          yearRequired
          day={birthDay}
          month={birthMonth}
          year={birthYear}
          onChangeDay={(v) => {
            setBirthDay(v);
            setError("");
          }}
          onChangeMonth={(v) => {
            setBirthMonth(v);
            setError("");
          }}
          onChangeYear={(v) => {
            setBirthYear(v);
            setError("");
          }}
          hasError={!!error}
        />

        {error !== "" && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={handleStart}
        >
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
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  label: { fontSize: 13, marginBottom: 8, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  errorText: { fontSize: 12, marginBottom: 12, textAlign: "center" },
  startBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
