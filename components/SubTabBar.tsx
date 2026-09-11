import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Tab = { key: string; label: string; icon?: string };

type Props = {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
};

export default function SubTabBar({ tabs, activeKey, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && { backgroundColor: colors.primary }]}
            onPress={() => onChange(tab.key)}
          >
            <Text
              style={[
                styles.label,
                { color: active ? "#fff" : colors.textSecondary },
              ]}
            >
              {tab.icon ? `${tab.icon} ` : ""}
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 50,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  label: { fontSize: 13, fontWeight: "600" },
});
