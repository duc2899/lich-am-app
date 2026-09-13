import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  color?: string; // màu nền khi active, mặc định lấy theo theme.primary
  disabled?: boolean;
};

export default function ToggleButton({ active, label, onPress, color, disabled }: Props) {
  const { colors } = useTheme();
  const activeColor = color ?? colors.primary;

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.toggleBtn,
        { backgroundColor: colors.background },
        active && { backgroundColor: activeColor },
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.toggleText,
          { color: colors.textSecondary },
          active && styles.toggleTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  toggleText: { fontSize: 13 },
  toggleTextActive: { color: "#fff", fontWeight: "600" },
});
