import { View, Text, StyleSheet, TextInput } from "react-native";
import { useTheme } from "@context/ThemeContext";

type Props = {
  day: string;
  month: string;
  year: string;
  onChangeDay: (v: string) => void;
  onChangeMonth: (v: string) => void;
  onChangeYear: (v: string) => void;
  label?: string;
  yearRequired?: boolean;
  hasError?: boolean;
  hint?: string;
};

export default function DateInputFields({
  day,
  month,
  year,
  onChangeDay,
  onChangeMonth,
  onChangeYear,
  label,
  yearRequired = false,
  hasError = false,
  hint,
}: Props) {
  const { colors } = useTheme();
  const borderColor = hasError ? colors.danger : colors.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label} {yearRequired ? "*" : "(không bắt buộc)"}
        </Text>
      )}
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="Ngày"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={day}
          onChangeText={onChangeDay}
        />
        <TextInput
          style={[
            styles.input,
            {
              borderColor,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="Tháng"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={month}
          onChangeText={onChangeMonth}
        />
        <TextInput
          style={[
            styles.input,
            {
              borderColor,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="Năm"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={year}
          onChangeText={onChangeYear}
        />
      </View>
      {hint && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    fontSize: 14,
  },
  hint: { fontSize: 11, fontStyle: "italic", marginTop: 6 },
});
