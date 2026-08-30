import { View, Text, StyleSheet } from "react-native";

export default function FamilyLegend() {
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={styles.crownIcon}>👑</Text>
        <Text style={styles.label}>Trưởng</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#4A90D9" }]} />
        <Text style={styles.label}>Nam</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#D96BA0" }]} />
        <Text style={styles.label}>Nữ</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#999" }]} />
        <Text style={styles.label}>Đã mất</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#2E8B57" }]} />
        <Text style={styles.label}>Tôi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
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
    color: "#444",
    fontWeight: "500",
  },
});
