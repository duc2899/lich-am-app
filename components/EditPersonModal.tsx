import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFamilyStore } from "../store/familyStore";
import { useToastStore } from "../store/toastStore";
import { Gender, Person } from "../types/family";
import ToggleButton from "./ToggleButton";
import DateInputFields from "./DateInputFields";
import { validateDateParts } from "../utils/dateValidation";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  person: Person | null;
  onClose: () => void;
};

export default function EditPersonModal({ visible, person, onClose }: Props) {
  const { colors } = useTheme();
  const editPerson = useFamilyStore((s) => s.editPerson);
  const showToast = useToastStore((s) => s.showToast);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathDay, setDeathDay] = useState("");
  const [deathMonth, setDeathMonth] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && person) {
      setFullName(person.fullName);
      setGender(person.gender);
      setPhotoUri(person.photoUri);
      setBirthDay(person.birthDay ? String(person.birthDay) : "");
      setBirthMonth(person.birthMonth ? String(person.birthMonth) : "");
      setBirthYear(person.birthYear ? String(person.birthYear) : "");
      setDeathDay(person.deathDay ? String(person.deathDay) : "");
      setDeathMonth(person.deathMonth ? String(person.deathMonth) : "");
      setDeathYear(person.deathYear ? String(person.deathYear) : "");
      setIsDeceased(!!person.deathYear);
      setPhone(person.phone ?? "");
      setOccupation(person.occupation ?? "");
      setCurrentAddress(person.currentAddress ?? "");
      setNote(person.note ?? "");
      setError("");
    }
  }, [visible, person]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Cần cấp quyền truy cập thư viện ảnh", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    const birthError = validateDateParts(birthDay, birthMonth, birthYear, {
      fieldLabel: "sinh",
    });
    if (birthError) {
      setError(birthError);
      return false;
    }
    if (isDeceased) {
      const deathError = validateDateParts(deathDay, deathMonth, deathYear, {
        yearRequired: true,
        fieldLabel: "mất",
      });
      if (deathError) {
        setError(deathError);
        return false;
      }
      if (birthYear.trim() && Number(deathYear) < Number(birthYear)) {
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
      photoUri,
      birthDay: birthDay.trim() ? Number(birthDay) : undefined,
      birthMonth: birthMonth.trim() ? Number(birthMonth) : undefined,
      birthYear: birthYear.trim() ? Number(birthYear) : undefined,
      deathDay: isDeceased && deathDay.trim() ? Number(deathDay) : undefined,
      deathMonth:
        isDeceased && deathMonth.trim() ? Number(deathMonth) : undefined,
      deathYear: isDeceased && deathYear.trim() ? Number(deathYear) : undefined,
      phone: phone.trim() || undefined,
      occupation: occupation.trim() || undefined,
      currentAddress: currentAddress.trim() || undefined,
      note: note.trim() || undefined,
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
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.heading, { color: colors.text }]}>
                Sửa thông tin
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
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
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
                      Chạm để chọn ảnh đại diện
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {photoUri && (
                <TouchableOpacity
                  onPress={() => setPhotoUri(undefined)}
                  style={styles.removePhotoBtn}
                >
                  <Text
                    style={[styles.removePhotoText, { color: colors.danger }]}
                  >
                    Xoá ảnh
                  </Text>
                </TouchableOpacity>
              )}

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

              <DateInputFields
                label="Ngày sinh"
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
                hint="Có thêm Ngày + Tháng thì mới quy đổi chính xác được ra âm lịch"
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Tình trạng
              </Text>
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
                <DateInputFields
                  label="Ngày mất"
                  yearRequired
                  day={deathDay}
                  month={deathMonth}
                  year={deathYear}
                  onChangeDay={(v) => {
                    setDeathDay(v);
                    setError("");
                  }}
                  onChangeMonth={(v) => {
                    setDeathMonth(v);
                    setError("");
                  }}
                  onChangeYear={(v) => {
                    setDeathYear(v);
                    setError("");
                  }}
                  hasError={!!error}
                />
              )}

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Thông tin liên hệ
              </Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Số điện thoại
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
                placeholder="09xx xxx xxx"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nghề nghiệp
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
                placeholder="vd: Kỹ sư xây dựng"
                placeholderTextColor={colors.textSecondary}
                value={occupation}
                onChangeText={setOccupation}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nơi ở hiện tại
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
                placeholder="vd: Hà Đông, Hà Nội"
                placeholderTextColor={colors.textSecondary}
                value={currentAddress}
                onChangeText={setCurrentAddress}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Ghi chú
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
                placeholder="Vài dòng ghi chú, tiểu sử ngắn..."
                placeholderTextColor={colors.textSecondary}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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
    maxHeight: "90%",
  },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  imagePicker: {
    height: 130,
    width: 130,
    alignSelf: "center",
    borderRadius: 65,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  previewImage: { width: "100%", height: "100%" },
  uploadIcon: { fontSize: 26, marginBottom: 6 },
  uploadText: { fontSize: 11, textAlign: "center", paddingHorizontal: 8 },
  removePhotoBtn: { alignSelf: "center", marginBottom: 16 },
  removePhotoText: { fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  label: { fontSize: 13, marginBottom: 8, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, marginBottom: 12 },
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
