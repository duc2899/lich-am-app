import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import FamilyTreeView from "../../components/FamilyTreeView";
import PersonDetailModal from "../../components/PersonDetailModal";
import { buildDisplayTree } from "../../utils/familyTreeBuilder";
import {
  getPersonRelations,
  PersonRelations,
} from "../../utils/familyRelations";
import {
  SAMPLE_PERSONS,
  SAMPLE_FAMILIES,
  ROOT_FAMILY_ID,
} from "../../constants/familySampleData";
import { Person } from "../../types/family";

export default function FamilyScreen() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRelations, setSelectedRelations] =
    useState<PersonRelations | null>(null);

  const rootNode = useMemo(
    () => buildDisplayTree(ROOT_FAMILY_ID, SAMPLE_PERSONS, SAMPLE_FAMILIES),
    [],
  );

  if (!rootNode) {
    return (
      <View style={styles.center}>
        <Text>Chưa có dữ liệu gia phả</Text>
      </View>
    );
  }

  const handlePersonPress = (personId: string) => {
    const person = SAMPLE_PERSONS.find((p) => p.id === personId);
    if (!person) return;
    setSelectedPerson(person);
    setSelectedRelations(
      getPersonRelations(personId, SAMPLE_PERSONS, SAMPLE_FAMILIES),
    );
  };

  return (
    <View style={styles.container}>
      <FamilyTreeView root={rootNode} onPersonPress={handlePersonPress} />
      <Text style={styles.hint}>Chụm 2 ngón tay để zoom, kéo để di chuyển</Text>

      <PersonDetailModal
        person={selectedPerson}
        relations={selectedRelations}
        onClose={() => setSelectedPerson(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    fontSize: 12,
    color: "#999",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
