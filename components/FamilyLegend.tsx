import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function FamilyLegend() {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={styles.crownIcon}>👑</Text>
        <Text style={[styles.label, { color: colors.text }]}>Trưởng</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#4A90D9" }]} />
        <Text style={[styles.label, { color: colors.text }]}>Nam</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#D96BA0" }]} />
        <Text style={[styles.label, { color: colors.text }]}>Nữ</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#999" }]} />
        <Text style={[styles.label, { color: colors.text }]}>Đã mất</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#2E8B57" }]} />
        <Text style={[styles.label, { color: colors.text }]}>Tôi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 70,
    left: 12,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  crownIcon: {
    fontSize: 12,
    marginRight: 6,
    width: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
