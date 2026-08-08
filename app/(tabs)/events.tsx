import { View, Text, StyleSheet } from "react-native";

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ngày giỗ / Sinh nhật</Text>
      <Text>Danh sách sự kiện sẽ hiển thị ở đây</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
});
