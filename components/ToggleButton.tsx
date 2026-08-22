import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  color?: string; // màu nền khi active, mặc định xanh dương
};

export default function ToggleButton({
  active,
  label,
  onPress,
  color = "#4A90D9",
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.toggleBtn, active && { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  toggleText: { fontSize: 13, color: "#666" },
  toggleTextActive: { color: "#fff", fontWeight: "600" },
});
