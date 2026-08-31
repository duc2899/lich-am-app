import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {title && (
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  title: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
