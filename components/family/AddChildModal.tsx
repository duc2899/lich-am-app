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
import { useFamilyStore } from "@store/familyStore";
import { useToastStore } from "@store/toastStore";
import { Gender } from "@/types/family";
import ToggleButton from "@components/shared/ToggleButton";
import DateInputFields from "@components/shared/DateInputFields";
import { validateDateParts, parseDateParts } from "@utils/dateValidation";
import { useTheme } from "@context/ThemeContext";

type Props = {
  visible: boolean;
  familyId: string | null;
  onClose: () => void;
};

export default function AddChildModal({ visible, familyId, onClose }: Props) {
  const { colors } = useTheme();
  const addChildToFamily = useFamilyStore((s) => s.addChildToFamily);
  const showToast = useToastStore((s) => s.showToast);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [isAdopted, setIsAdopted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setFullName("");
      setGender("male");
      setBirthDay("");
      setBirthMonth("");
      setBirthYear("");
      setIsAdopted(false);
      setError("");
    }
  }, [visible]);

  const handleSave = () => {
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
    if (!familyId) return;

    const { day, month, year } = parseDateParts(
      birthDay,
      birthMonth,
      birthYear,
    );
    addChildToFamily(familyId, {
      fullName: fullName.trim(),
      gender,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
      isAdopted,
    });
    showToast(`Đã thêm "${fullName.trim()}" làm con`);
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
            <Text style={[styles.heading, { color: colors.text }]}>
              Thêm con
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

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Quan hệ
            </Text>
            <View style={styles.toggleRow}>
              <ToggleButton
                active={!isAdopted}
                label="Con ruột"
                onPress={() => setIsAdopted(false)}
              />
              <ToggleButton
                active={isAdopted}
                label="Con nuôi"
                onPress={() => setIsAdopted(true)}
                color="#888"
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

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text
                  style={[styles.cancelText, { color: colors.textSecondary }]}
                >
                  Huỷ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
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
  card: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  label: { fontSize: 13, marginBottom: 8, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  errorText: { fontSize: 12, marginBottom: 12 },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "700" },
});
