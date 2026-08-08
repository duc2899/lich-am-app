import { View, Text, StyleSheet } from "react-native";

export default function FamilyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gia phả</Text>
      <Text>Sơ đồ cây gia phả sẽ hiển thị ở đây</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
});
