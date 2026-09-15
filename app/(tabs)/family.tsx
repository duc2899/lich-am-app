import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FamilyTreeView from "../../components/FamilyTreeView";
import PersonDetailModal from "../../components/PersonDetailModal";
import AddChildModal from "../../components/AddChildModal";
import AddSpouseModal from "../../components/AddSpouseModal";
import EditPersonModal from "../../components/EditPersonModal";
import FamilyLegend from "../../components/FamilyLegend";
import FamilyStartScreen from "../../components/FamilyStartScreen";
import {
  buildDisplayTree,
  collectExpandableFamilyIds,
  pruneCollapsedFamilies,
} from "../../utils/familyTreeBuilder";
import {
  getPersonRelations,
  PersonRelations,
} from "../../utils/familyRelations";
import { computeTruongLineage } from "../../utils/familyLineage";
import { useFamilyStore } from "../../store/familyStore";
import { useToastStore } from "../../store/toastStore";
import { Person } from "../../types/family";
import FamilyStatisticsView from "../../components/FamilyStatisticsView";
import SubTabBar from "../../components/SubTabBar";
import { computeFamilyStatistics } from "../../utils/familyStatistics";
import MemoryGalleryView from "../../components/MemoryGalleryView";
import KinshipLookupView from "../../components/KinshipLookupView";

import { useTheme } from "../../context/ThemeContext";

export default function FamilyScreen() {
  const { colors } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<
    "stats" | "diagram" | "gallery" | "kinship"
  >("diagram");
  const [collapsedFamilyIds, setCollapsedFamilyIds] = useState<Set<string>>(
    new Set(),
  );
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

  const statistics = useMemo(
    () => computeFamilyStatistics(rootPersonId, persons, families),
    [persons, families, rootPersonId],
  );

  const fullRootNode = useMemo(
    () =>
      rootPersonId ? buildDisplayTree(rootPersonId, persons, families) : null,
    [persons, families, rootPersonId],
  );

  const expandableFamilyIds = useMemo(
    () =>
      fullRootNode
        ? collectExpandableFamilyIds(fullRootNode)
        : new Set<string>(),
    [fullRootNode],
  );

  const rootNode = useMemo(
    () =>
      fullRootNode
        ? pruneCollapsedFamilies(fullRootNode, collapsedFamilyIds)
        : null,
    [fullRootNode, collapsedFamilyIds],
  );

  const handleToggleCollapse = (familyId: string) => {
    setCollapsedFamilyIds((prev) => {
      const next = new Set(prev);
      if (next.has(familyId)) next.delete(familyId);
      else next.add(familyId);
      return next;
    });
  };
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SubTabBar
        tabs={[
          { key: "stats", label: "Thống kê", icon: "📊" },
          { key: "diagram", label: "Sơ đồ", icon: "🌳" },
          { key: "gallery", label: "Trưng bày", icon: "🖼️" },
          { key: "kinship", label: "Mối quan hệ", icon: "👨‍👩‍👧‍👦" },
        ]}
        activeKey={activeSubTab}
        onChange={(key) =>
          setActiveSubTab(key as "stats" | "diagram" | "gallery" | "kinship")
        }
      />

      {activeSubTab === "stats" ? (
        <FamilyStatisticsView stats={statistics} />
      ) : activeSubTab === "gallery" ? (
        <MemoryGalleryView />
      ) : activeSubTab === "kinship" ? (
        <KinshipLookupView persons={persons} families={families} />
      ) : (
        <>
          <FamilyTreeView
            root={rootNode}
            persons={persons}
            onPersonPress={handlePersonPress}
            truongIds={truongIds}
            mePersonId={mePersonId}
            expandableFamilyIds={expandableFamilyIds}
            collapsedFamilyIds={collapsedFamilyIds}
            onToggleCollapse={handleToggleCollapse}
          />
          <FamilyLegend />
          <Text style={styles.hint}>Chụm 2 ngón tay để zoom</Text>
        </>
      )}

      <PersonDetailModal
        person={selectedPerson}
        persons={persons}
        families={families}
        rootPersonId={rootPersonId}
        truongIds={truongIds}
        mePersonId={mePersonId}
        onClose={() => setSelectedPerson(null)}
        onNavigateToPerson={handlePersonPress}
        onAddSpouse={handleAddSpouseFromDetail}
        onAddChild={(familyId) => {
          setSelectedPerson(null);
          setAddChildFamilyId(familyId);
        }}
        onEdit={handleEditFromDetail}
        onDelete={handleDelete}
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
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
