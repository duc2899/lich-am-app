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
  ScrollView,
} from "react-native";
import { useEventStore, CalendarType, RepeatType } from "../store/eventStore";
import { solarToLunar, lunarToSolar } from "../constants/lunar";
import {
  EVENT_CATEGORIES,
  EventCategoryKey,
} from "../constants/eventCategories";
import ToggleButton from "./ToggleButton";
import { useTheme } from "../context/ThemeContext";

type DateParts = { day: number; month: number; year: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  // Ngày dương/âm gợi ý sẵn (vd khi bấm từ 1 ngày trên lịch). Bỏ trống -> mặc định hôm nay.
  initialSolar?: DateParts;
  initialLunar?: DateParts;
};

export default function AddEventModal({
  visible,
  onClose,
  initialSolar,
  initialLunar,
}: Props) {
  const { colors } = useTheme();
  const addEvent = useEventStore((s) => s.addEvent);
  const today = new Date();
  const fallbackSolar: DateParts = {
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  };

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategoryKey>("other");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [repeatType, setRepeatType] = useState<RepeatType>("yearly");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    day?: string;
    month?: string;
    year?: string;
  }>({});

  // Mỗi lần mở modal -> reset form, điền sẵn ngày dương (mặc định)
  useEffect(() => {
    if (visible) {
      const d = initialSolar ?? fallbackSolar;
      setTitle("");
      setCategory("other");
      setCalendarType("solar");
      setRepeatType("yearly");
      setDay(String(d.day));
      setMonth(String(d.month));
      setYear(String(d.year));
      setErrors({});
    }
  }, [visible]);

  const handleToggleCalendarType = (type: CalendarType) => {
    if (type === calendarType) return; // đang ở đúng loại rồi, không cần đổi gì

    const currentDay = Number(day);
    const currentMonth = Number(month);
    const currentYear = Number(year);

    if (currentDay && currentMonth && currentYear) {
      // Có số hợp lệ trong form -> tự quy đổi 2 chiều dựa trên chính giá trị đang hiển thị
      if (type === "lunar") {
        // Đang là dương -> đổi sang âm
        const lunar = solarToLunar(currentDay, currentMonth, currentYear);
        setDay(String(lunar.day));
        setMonth(String(lunar.month));
        setYear(String(lunar.year));
      } else {
        // Đang là âm -> đổi sang dương
        const solar = lunarToSolar(
          currentDay,
          currentMonth,
          currentYear,
          false,
        );
        setDay(String(solar.day));
        setMonth(String(solar.month));
        setYear(String(solar.year));
      }
    } else {
      // Form đang trống/không hợp lệ -> dùng giá trị prefill nếu có, không thì hôm nay
      const d =
        type === "lunar" ? initialLunar : (initialSolar ?? fallbackSolar);
      if (d) {
        setDay(String(d.day));
        setMonth(String(d.month));
        setYear(String(d.year));
      }
    }
    setCalendarType(type);
  };

  const CURRENT_YEAR = today.getFullYear();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Vui lòng nhập tên sự kiện";
    } else if (title.trim().length > 50) {
      newErrors.title = "Tên sự kiện tối đa 50 ký tự";
    }

    const d = Number(day);
    const m = Number(month);
    const y = Number(year);
    const maxDay = calendarType === "lunar" ? 30 : 31; // âm lịch tối đa 30 ngày/tháng

    if (!day.trim() || !Number.isInteger(d)) {
      newErrors.day = "Ngày không hợp lệ";
    } else if (d < 1 || d > maxDay) {
      newErrors.day = `Ngày phải từ 1 đến ${maxDay}`;
    }

    if (!month.trim() || !Number.isInteger(m)) {
      newErrors.month = "Tháng không hợp lệ";
    } else if (m < 1 || m > 12) {
      newErrors.month = "Tháng phải từ 1 đến 12";
    }

    if (!year.trim() || !Number.isInteger(y)) {
      newErrors.year = "Năm không hợp lệ";
    } else if (y < 1900 || y > CURRENT_YEAR + 100) {
      newErrors.year = `Năm phải từ 1900 đến ${CURRENT_YEAR + 100}`;
    }

    // Chỉ check ngày dương thực sự tồn tại (vd 31/4 không có) khi đã qua hết các check cơ bản ở trên
    if (
      calendarType === "solar" &&
      !newErrors.day &&
      !newErrors.month &&
      !newErrors.year
    ) {
      const daysInThatMonth = new Date(y, m, 0).getDate();
      if (d > daysInThatMonth) {
        newErrors.day = `Tháng ${m} năm ${y} không có ngày ${d}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await addEvent({
      title: title.trim(),
      category,
      calendarType,
      day: Number(day),
      month: Number(month),
      year: Number(year),
      repeatType,
    });
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
              Thêm sự kiện
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
                errors.title && { borderColor: colors.danger },
              ]}
              placeholder="Tên sự kiện (vd: Sinh nhật mẹ)"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                if (errors.title)
                  setErrors((e) => ({ ...e, title: undefined }));
              }}
            />
            {errors.title && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.title}
              </Text>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Loại sự kiện
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {EVENT_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.background },
                    category === c.key && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setCategory(c.key)}
                >
                  <Text style={styles.categoryIcon}>{c.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: colors.textSecondary },
                      category === c.key && styles.categoryLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Loại lịch
            </Text>
            <View style={styles.toggleRow}>
              <ToggleButton
                active={calendarType === "solar"}
                label="Dương lịch"
                onPress={() => handleToggleCalendarType("solar")}
              />
              <ToggleButton
                active={calendarType === "lunar"}
                label="Âm lịch"
                onPress={() => handleToggleCalendarType("lunar")}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Lặp lại
            </Text>
            <View style={styles.toggleRow}>
              <ToggleButton
                active={repeatType === "yearly"}
                label="Hàng năm"
                onPress={() => setRepeatType("yearly")}
              />
              <ToggleButton
                active={repeatType === "once"}
                label="Chỉ 1 lần"
                onPress={() => setRepeatType("once")}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Ngày / Tháng / Năm ({calendarType === "lunar" ? "âm" : "dương"})
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
                  errors.day && { borderColor: colors.danger },
                ]}
                keyboardType="number-pad"
                value={day}
                onChangeText={(v) => {
                  setDay(v);
                  if (errors.day) setErrors((e) => ({ ...e, day: undefined }));
                }}
              />
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                  errors.month && { borderColor: colors.danger },
                ]}
                keyboardType="number-pad"
                value={month}
                onChangeText={(v) => {
                  setMonth(v);
                  if (errors.month)
                    setErrors((e) => ({ ...e, month: undefined }));
                }}
              />
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                  errors.year && { borderColor: colors.danger },
                ]}
                keyboardType="number-pad"
                value={year}
                onChangeText={(v) => {
                  setYear(v);
                  if (errors.year)
                    setErrors((e) => ({ ...e, year: undefined }));
                }}
              />
            </View>
            {(errors.day || errors.month || errors.year) && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.day || errors.month || errors.year}
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
    marginBottom: 4,
    fontSize: 14,
  },
  errorText: { fontSize: 12, marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: "600" },
  categoryScroll: { marginBottom: 16 },
  categoryScrollContent: { gap: 10, paddingRight: 4 },
  categoryChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 70,
  },
  categoryIcon: { fontSize: 22, marginBottom: 4 },
  categoryLabel: { fontSize: 11, fontWeight: "600" },
  categoryLabelActive: { color: "#fff" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dateRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
  },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "700" },
});
