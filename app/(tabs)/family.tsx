import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FamilyTreeView from "../../components/FamilyTreeView";
import PersonDetailModal from "../../components/PersonDetailModal";
import AddChildModal from "../../components/AddChildModal";
import AddSpouseModal from "../../components/AddSpouseModal";
import EditPersonModal from "../../components/EditPersonModal";
import FamilyLegend from "../../components/FamilyLegend";
import FamilyStartScreen from "../../components/FamilyStartScreen";
import { buildDisplayTree } from "../../utils/familyTreeBuilder";
import {
  getPersonRelations,
  PersonRelations,
} from "../../utils/familyRelations";
import { computeTruongLineage } from "../../utils/familyLineage";
import { useFamilyStore } from "../../store/familyStore";
import { useToastStore } from "../../store/toastStore";
import { Person } from "../../types/family";

export default function FamilyScreen() {
  const persons = useFamilyStore((s) => s.persons);
  const families = useFamilyStore((s) => s.families);
  const rootPersonId = useFamilyStore((s) => s.rootPersonId);
  const mePersonId = useFamilyStore((s) => s.mePersonId);
  const setMePersonId = useFamilyStore((s) => s.setMePersonId);
  const deletePerson = useFamilyStore((s) => s.deletePerson);
  const showToast = useToastStore((s) => s.showToast);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRelations, setSelectedRelations] =
    useState<PersonRelations | null>(null);
  const [addChildFamilyId, setAddChildFamilyId] = useState<string | null>(null);
  const [addSpousePerson, setAddSpousePerson] = useState<Person | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const rootNode = useMemo(
    () =>
      rootPersonId ? buildDisplayTree(rootPersonId, persons, families) : null,
    [persons, families, rootPersonId],
  );

  const truongIds = useMemo(
    () =>
      new Set(
        rootPersonId
          ? computeTruongLineage(rootPersonId, persons, families)
          : [],
      ),
    [persons, families, rootPersonId],
  );

  // Chưa có dữ liệu -> hiện màn hình bắt đầu để tự nhập người đầu tiên
  if (!rootPersonId || !rootNode) {
    return <FamilyStartScreen />;
  }

  const handlePersonPress = (personId: string) => {
    const person = persons.find((p) => p.id === personId);
    if (!person) return;
    setSelectedPerson(person);
    setSelectedRelations(getPersonRelations(personId, persons, families));
  };

  const handleAddChildPress = (familyId: string) => {
    setAddChildFamilyId(familyId);
  };

  const handleAddSpouseFromDetail = () => {
    // Lưu lại người đang xem trước khi đóng modal chi tiết, tránh mất data (bài học từ lỗi tương tự ở AddEventModal)
    setAddSpousePerson(selectedPerson);
    setSelectedPerson(null);
  };

  const handleEditFromDetail = () => {
    setEditPerson(selectedPerson);
    setSelectedPerson(null);
  };

  const handleToggleMe = () => {
    if (!selectedPerson) return;
    const willBeMe = mePersonId !== selectedPerson.id;
    setMePersonId(willBeMe ? selectedPerson.id : null);
    showToast(
      willBeMe
        ? `Đã đánh dấu "${selectedPerson.fullName}" là bạn`
        : "Đã bỏ đánh dấu",
    );
  };

  const handleDelete = () => {
    if (!selectedPerson) return;
    const hasChildren =
      selectedRelations && selectedRelations.children.length > 0;
    const nameToDelete = selectedPerson.fullName;
    Alert.alert(
      "Xoá người này?",
      `Xoá "${selectedPerson.fullName}" khỏi gia phả. Hành động này không thể hoàn tác.` +
        (hasChildren
          ? " ⚠️ Người này đang có con — TOÀN BỘ con, cháu, chắt... của họ cũng sẽ bị xoá theo."
          : ""),
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            deletePerson(selectedPerson.id);
            setSelectedPerson(null);
            showToast(`Đã xoá "${nameToDelete}"`);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FamilyTreeView
        root={rootNode}
        onPersonPress={handlePersonPress}
        onAddChildPress={handleAddChildPress}
        truongIds={truongIds}
        mePersonId={mePersonId}
      />
      <FamilyLegend />
      <Text style={styles.hint}>
        Chụm 2 ngón tay để zoom · Bấm + trên dây nối để thêm con
      </Text>

      <PersonDetailModal
        person={selectedPerson}
        relations={selectedRelations}
        onClose={() => setSelectedPerson(null)}
        onAddSpouse={handleAddSpouseFromDetail}
        onEdit={handleEditFromDetail}
        onDelete={handleDelete}
        isTruong={selectedPerson ? truongIds.has(selectedPerson.id) : false}
        isMe={selectedPerson ? mePersonId === selectedPerson.id : false}
        onToggleMe={handleToggleMe}
      />

      <AddChildModal
        visible={addChildFamilyId !== null}
        familyId={addChildFamilyId}
        onClose={() => setAddChildFamilyId(null)}
      />

      <AddSpouseModal
        visible={addSpousePerson !== null}
        person={addSpousePerson}
        onClose={() => setAddSpousePerson(null)}
      />

      <EditPersonModal
        visible={editPerson !== null}
        person={editPerson}
        onClose={() => setEditPerson(null)}
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
    fontSize: 11,
    color: "#999",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
