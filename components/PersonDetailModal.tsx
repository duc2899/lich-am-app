import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Person } from "../types/family";
import { PersonRelations } from "../utils/familyRelations";

type Props = {
  person: Person | null;
  relations: PersonRelations | null;
  onClose: () => void;
};

export default function PersonDetailModal({
  person,
  relations,
  onClose,
}: Props) {
  const currentYear = new Date().getFullYear();
  const isDeceased = !!person?.deathYear;

  return (
    <Modal
      visible={person !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {person && (
            <>
              <View style={styles.header}>
                <Text style={styles.genderIcon}>
                  {" "}
                  {person.gender === "male" ? "♂" : "♀"}{" "}
                </Text>
                <Text style={styles.name}> {person.fullName} </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}> Giới tính: </Text>
                <Text style={styles.value}>
                  {" "}
                  {person.gender === "male" ? "Nam" : "Nữ"}{" "}
                </Text>
              </View>

              {person.birthYear && (
                <View style={styles.row}>
                  <Text style={styles.label}> Năm sinh: </Text>
                  <Text style={styles.value}> {person.birthYear} </Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={styles.label}> Tình trạng: </Text>
                {isDeceased ? (
                  <Text style={[styles.value, styles.deceasedText]}>
                    Đã mất{person.deathYear ? ` (${person.deathYear})` : ""}
                    {person.birthYear && person.deathYear
                      ? ` · Hưởng thọ ${person.deathYear - person.birthYear} tuổi`
                      : ""}
                  </Text>
                ) : (
                  <Text style={styles.value}>
                    Còn sống
                    {person.birthYear
                      ? ` · ${currentYear - person.birthYear} tuổi`
                      : ""}
                  </Text>
                )}
              </View>

              {relations && (relations.father || relations.mother) && (
                <View style={styles.row}>
                  <Text style={styles.label}> Cha mẹ: </Text>
                  <Text style={styles.value}>
                    {[relations.father?.fullName, relations.mother?.fullName]
                      .filter(Boolean)
                      .join(" & ")}
                  </Text>
                </View>
              )}

              {relations && relations.spouses.length > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {person.gender === "male" ? "Vợ: " : "Chồng: "}
                  </Text>
                  <Text style={styles.value}>
                    {" "}
                    {relations.spouses.map((s) => s.fullName).join(", ")}{" "}
                  </Text>
                </View>
              )}

              {relations && relations.children.length > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {" "}
                    Con({relations.children.length}):{" "}
                  </Text>
                  <Text style={styles.value}>
                    {" "}
                    {relations.children.map((c) => c.fullName).join(", ")}{" "}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}> Đóng </Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  genderIcon: {
    fontSize: 20,
    marginRight: 8,
    color: "#4A90D9",
    fontWeight: "700",
  },
  name: { fontSize: 18, fontWeight: "700", color: "#222", flexShrink: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  label: { fontSize: 13, color: "#888", fontWeight: "600" },
  value: { fontSize: 13, color: "#222", fontWeight: "500", flexShrink: 1 },
  deceasedText: { color: "#999" },
  closeBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4A90D9",
    borderRadius: 8,
  },
  closeBtnText: { color: "#fff", fontWeight: "600" },
});
