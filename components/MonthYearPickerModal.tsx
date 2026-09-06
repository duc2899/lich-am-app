import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  month: number;
  year: number;
  onClose: () => void;
  onSelect: (month: number, year: number) => void;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const YEARS = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i,
);
const ITEM_HEIGHT = 44;

export default function MonthYearPickerModal({
  visible,
  month,
  year,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  const monthListRef = useRef<FlatList>(null);
  const yearListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!visible) return;
    setSelectedMonth(month);
    setSelectedYear(year);

    // Cuộn sẵn tới đúng tháng/năm đang xem khi vừa mở modal, đỡ phải tự cuộn tìm
    const timer = setTimeout(() => {
      monthListRef.current?.scrollToIndex({
        index: month - 1,
        animated: false,
        viewPosition: 0.5,
      });
      const yearIndex = YEARS.indexOf(year);
      if (yearIndex >= 0) {
        yearListRef.current?.scrollToIndex({
          index: yearIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [visible, month, year]);

  const handleDone = () => {
    onSelect(selectedMonth, selectedYear);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.heading, { color: colors.text }]}>
            Chọn tháng / năm
          </Text>

          <View style={styles.columnsRow}>
            <FlatList
              ref={monthListRef}
              data={MONTHS}
              keyExtractor={(m) => String(m)}
              style={styles.column}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item === selectedMonth && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedMonth(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: colors.text },
                      item === selectedMonth && styles.itemTextActive,
                    ]}
                  >
                    Tháng {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <FlatList
              ref={yearListRef}
              data={YEARS}
              keyExtractor={(y) => String(y)}
              style={styles.column}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item === selectedYear && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedYear(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: colors.text },
                      item === selectedYear && styles.itemTextActive,
                    ]}
                  >
                    Năm {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text
                style={[styles.cancelText, { color: colors.textSecondary }]}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={handleDone}
            >
              <Text style={styles.doneText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
    height: 420,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  columnsRow: { flex: 1, flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  itemText: { fontSize: 15 },
  itemTextActive: { color: "#fff", fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontWeight: "600" },
  doneBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  doneText: { color: "#fff", fontWeight: "700" },
});
