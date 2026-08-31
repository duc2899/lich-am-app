import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  color?: string; // màu nền khi active, mặc định lấy theo theme.primary
};

export default function ToggleButton({ active, label, onPress, color }: Props) {
  const { colors } = useTheme();
  const activeColor = color ?? colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.toggleBtn,
        { backgroundColor: colors.background },
        active && { backgroundColor: activeColor },
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
