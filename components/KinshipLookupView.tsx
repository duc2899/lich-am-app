import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { Person, Family } from "../types/family";
import { lookupKinship } from "../utils/familyKinship";
import { useTheme } from "../context/ThemeContext";

type Props = {
  persons: Person[];
  families: Family[];
};

function PersonPickerModal({
  visible,
  persons,
  onSelect,
  onClose,
}: {
  visible: boolean;
  persons: Person[];
  onSelect: (personId: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return persons;
    return persons.filter((p) => p.fullName.toLowerCase().includes(q));
  }, [query, persons]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable
          style={[styles.pickerCard, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <TextInput
            style={[
              styles.pickerInput,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Tìm theo tên..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 320 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => {
                  onSelect(item.id);
                  setQuery("");
                  onClose();
                }}
              >
                <View
                  style={[
                    styles.pickerAvatar,
                    {
                      backgroundColor:
                        item.gender === "male" ? "#4A90D9" : "#D96BA0",
                    },
                  ]}
                >
                  <Text style={styles.pickerAvatarText}>
                    {item.fullName.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.pickerName, { color: colors.text }]}>
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberSlot({
  label,
  person,
  onPress,
}: {
  label: string;
  person: Person | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.slotLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          styles.slotBox,
          { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
        ]}
        onPress={onPress}
      >
        {person ? (
          <>
            <View
              style={[
                styles.slotAvatar,
                {
                  backgroundColor:
                    person.gender === "male" ? "#4A90D9" : "#D96BA0",
                },
              ]}
            >
              <Text style={styles.slotAvatarText}>
                {person.fullName.charAt(0)}
              </Text>
            </View>
            <Text
              style={[styles.slotName, { color: colors.text }]}
              numberOfLines={1}
            >
              {person.fullName}
            </Text>
          </>
        ) : (
          <Text
            style={[styles.slotPlaceholder, { color: colors.textSecondary }]}
          >
            Chạm để chọn
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function KinshipLookupView({ persons, families }: Props) {
  const { colors } = useTheme();
  const [personAId, setPersonAId] = useState<string | null>(null);
  const [personBId, setPersonBId] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"A" | "B" | null>(null);

  const personA = persons.find((p) => p.id === personAId) ?? null;
  const personB = persons.find((p) => p.id === personBId) ?? null;

  const result = useMemo(() => {
    if (!personAId || !personBId || personAId === personBId) return null;
    return lookupKinship(personAId, personBId, persons, families);
  }, [personAId, personBId, persons, families]);

  const handleSwap = () => {
    setPersonAId(personBId);
    setPersonBId(personAId);
  };

  const commonAncestorName = result?.commonAncestorId
    ? persons.find((p) => p.id === result.commonAncestorId)?.fullName
    : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: colors.text }]}>
        Tra cứu danh xưng
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Chọn hai thành viên để tự động tính cách gọi theo quan hệ gia phả
      </Text>

      <View style={[styles.selectorCard, { backgroundColor: colors.surface }]}>
        <View style={styles.selectorRow}>
          <MemberSlot
            label="Thành viên A"
            person={personA}
            onPress={() => setPickerTarget("A")}
          />
          <TouchableOpacity
            style={[
              styles.swapBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={handleSwap}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>⇄</Text>
          </TouchableOpacity>
          <MemberSlot
            label="Thành viên B"
            person={personB}
            onPress={() => setPickerTarget("B")}
          />
        </View>
      </View>

      {personAId && personBId && personAId === personBId && (
        <Text style={[styles.warningText, { color: colors.danger }]}>
          Vui lòng chọn 2 người khác nhau
        </Text>
      )}

      {result && (
        <>
          <View
            style={[
              styles.typeBox,
              {
                backgroundColor: colors.accent + "22",
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[styles.typeText, { color: colors.text }]}>
              ✨ Quan hệ {result.relationshipTypeLabel}
              {commonAncestorName
                ? ` (Tổ tiên chung: ${commonAncestorName})`
                : ""}
            </Text>
          </View>

          <View style={styles.termsRow}>
            <View
              style={[styles.termCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.termLabel, { color: colors.textSecondary }]}>
                {personA?.fullName} gọi {personB?.fullName} là
              </Text>
              <Text style={[styles.termValue, { color: colors.accent }]}>
                {result.termAToB ?? "Không xác định"}
              </Text>
            </View>
            <View
              style={[styles.termCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.termLabel, { color: colors.textSecondary }]}>
                {personB?.fullName} gọi {personA?.fullName} là
              </Text>
              <Text style={[styles.termValue, { color: colors.accent }]}>
                {result.termBToA ?? "Không xác định"}
              </Text>
            </View>
          </View>

          {result.commonAncestorId && (
            <View style={[styles.pathBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.pathTitle, { color: colors.textSecondary }]}>
                🔗 Phân tích con đường quan hệ
              </Text>
              <View style={styles.pathRow}>
                <View
                  style={[
                    styles.pathIndex,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.pathIndexText}>1</Text>
                </View>
                <Text style={[styles.pathText, { color: colors.text }]}>
                  {personA?.fullName} cách {personB?.fullName} {result.distance}{" "}
                  đời.
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      <PersonPickerModal
        visible={pickerTarget !== null}
        persons={persons}
        onSelect={(id) =>
          pickerTarget === "A" ? setPersonAId(id) : setPersonBId(id)
        }
        onClose={() => setPickerTarget(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },

  selectorCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  selectorRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  slotLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  slotBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 52,
  },
  slotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  slotAvatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  slotName: { fontSize: 13, fontWeight: "700", flexShrink: 1 },
  slotPlaceholder: { fontSize: 12 },
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  warningText: { fontSize: 12, marginBottom: 12, textAlign: "center" },

  typeBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  typeText: { fontSize: 13, fontWeight: "700" },

  termsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  termCard: { flex: 1, borderRadius: 12, padding: 14 },
  termLabel: { fontSize: 11, marginBottom: 6 },
  termValue: { fontSize: 17, fontWeight: "700" },

  pathBox: { borderRadius: 12, padding: 14 },
  pathTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10 },
  pathRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pathIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pathIndexText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  pathText: { fontSize: 13, flex: 1 },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  pickerCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    maxHeight: "65%",
  },
  pickerInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
  },
  pickerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerAvatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  pickerName: { fontSize: 14, fontWeight: "600" },
});
