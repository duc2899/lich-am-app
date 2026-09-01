import { View, Text, StyleSheet } from "react-native";
import { getQuoteOfTheDay } from "../utils/dailyQuote";
import { useTheme } from "../context/ThemeContext";

export default function DailyQuoteCard() {
  const { colors } = useTheme();
  const quote = getQuoteOfTheDay();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={styles.icon}>💬</Text>
      <Text style={[styles.text, { color: colors.text }]}>"{quote.text}"</Text>
      <Text style={[styles.category, { color: colors.textSecondary }]}>
        —{" "}
        {quote.category === "tucngu"
          ? "Tục ngữ Việt Nam"
          : "Lời khuyên hôm nay"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: { fontSize: 16, marginBottom: 6 },
  text: { fontSize: 14, fontStyle: "italic", lineHeight: 21 },
  category: { fontSize: 11, marginTop: 8, textAlign: "right" },
});
