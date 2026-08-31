import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  label: string;
  icon?: string;
  type?: "nav" | "toggle" | "destructive" | "value" | "info";
  value?: string;
  toggled?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
};

export default function SettingsRow({
  label,
  icon,
  type = "nav",
  value,
  toggled,
  onToggle,
  onPress,
  isLast = false,
}: Props) {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        !isLast && [styles.divider, { borderColor: colors.border }],
      ]}
    >
      <View style={styles.left}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.label,
            { color: colors.text },
            type === "destructive" && {
              color: colors.danger,
              fontWeight: "600",
            },
          ]}
        >
          {label}
        </Text>
      </View>

      {type === "toggle" && (
        <Switch
          value={toggled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary }}
        />
      )}
      {(type === "value" || type === "info") && (
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
      {type === "nav" && (
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      )}
    </View>
  );

  if (type === "toggle" || type === "info") {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  icon: { fontSize: 16, marginRight: 10, width: 20, textAlign: "center" },
  label: { fontSize: 15 },
  value: { fontSize: 14 },
  chevron: { fontSize: 20, fontWeight: "300" },
});
