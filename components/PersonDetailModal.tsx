import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { useMemo } from "react";
import { Person, Family } from "../types/family";
import { computePersonDetailInfo } from "../utils/personDetailInfo";
import { useTheme } from "../context/ThemeContext";

type Props = {
  person: Person | null;
  persons: Person[];
  families: Family[];
  rootPersonId: string | null;
  truongIds: Set<string>;
  mePersonId: string | null;
  onClose: () => void;
  onNavigateToPerson: (personId: string) => void;
  onAddSpouse: () => void;
  onAddChild: (familyId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleMe: () => void;
};

function RelationRow({
  person,
  subLabel,
  onPress,
}: {
  person: Person;
  subLabel?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.relationRow} onPress={onPress}>
      <View
        style={[
          styles.avatarSmall,
          { backgroundColor: person.gender === "male" ? "#4A90D9" : "#D96BA0" },
        ]}
      >
        <Text style={styles.avatarSmallText}>{person.fullName.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.relationName, { color: colors.text }]}>
          {person.fullName}
        </Text>
        {subLabel && (
          <Text style={[styles.relationSub, { color: colors.accent }]}>
            {subLabel}
          </Text>
        )}
      </View>
      <Text style={[styles.relationChevron, { color: colors.textSecondary }]}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

export default function PersonDetailModal({
  person,
  persons,
  families,
  rootPersonId,
  truongIds,
  mePersonId,
  onClose,
  onNavigateToPerson,
  onAddSpouse,
  onAddChild,
  onEdit,
  onDelete,
  onToggleMe,
}: Props) {
  const { colors } = useTheme();

  const info = useMemo(
    () =>
      person
        ? computePersonDetailInfo(person.id, persons, families, rootPersonId)
        : null,
    [person, persons, families, rootPersonId],
  );

  if (!person || !info) return null;

  const isTruong = truongIds.has(person.id);
  const isMe = mePersonId === person.id;
  const {
    relations,
    generation,
    age,
    isDeceased,
    zodiacChi,
    westernZodiac,
    lunarDateLabel,
    sonCount,
    daughterCount,
    inLaws,
    spouseFamilyPairs,
  } = info;

  const birthDateLabel =
    person.birthDay && person.birthMonth && person.birthYear
      ? `${String(person.birthDay).padStart(2, "0")}/${String(person.birthMonth).padStart(2, "0")}/${person.birthYear}`
      : person.birthYear
        ? String(person.birthYear)
        : null;

  const deathDateLabel =
    person.deathDay && person.deathMonth && person.deathYear
      ? `${String(person.deathDay).padStart(2, "0")}/${String(person.deathMonth).padStart(2, "0")}/${person.deathYear}`
      : person.deathYear
        ? String(person.deathYear)
        : null;

  const handleNavigate = (targetId: string) => {
    onNavigateToPerson(targetId);
  };

  return (
    <Modal
      visible={person !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: colors.accent }]}
              onPress={onEdit}
            >
              <Text style={styles.editBtnText}>✏️ Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.closeIconBtn,
                { backgroundColor: colors.background },
              ]}
              onPress={onClose}
            >
              <Text
                style={[styles.closeIconText, { color: colors.textSecondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerBlock}>
              <View style={styles.avatarWrap}>
                {person.photoUri ? (
                  <Image
                    source={{ uri: person.photoUri }}
                    style={styles.avatarLarge}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarLarge,
                      styles.avatarPlaceholder,
                      {
                        backgroundColor:
                          person.gender === "male"
                            ? colors.male
                            : colors.female,
                      },
                    ]}
                  >
                    <Text style={styles.avatarLargeText}>
                      {person.fullName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.genderBadge,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.genderBadgeText,
                      {
                        color:
                          person.gender === "male"
                            ? colors.male
                            : colors.female,
                      },
                    ]}
                  >
                    {person.gender === "male" ? "♂" : "♀"}
                  </Text>
                </View>
              </View>

              <Text style={[styles.name, { color: colors.text }]}>
                {person.fullName}
              </Text>

              <View style={styles.badgeRow}>
                {isTruong && (
                  <View
                    style={[styles.badge, { backgroundColor: "#F5B40022" }]}
                  >
                    <Text style={[styles.badgeText, { color: "#B8860B" }]}>
                      👑 Con trưởng
                    </Text>
                  </View>
                )}
                {generation !== null && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.success + "22" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.success }]}>
                      Đời thứ {generation}
                    </Text>
                  </View>
                )}
                {isMe && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      Tôi
                    </Text>
                  </View>
                )}
                {isDeceased && (
                  <View
                    style={[styles.badge, { backgroundColor: colors.border }]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      🕯️ Đã mất
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {(birthDateLabel || age !== null) && (
              <View style={styles.infoCardsRow}>
                {birthDateLabel && (
                  <View
                    style={[
                      styles.infoCard,
                      { backgroundColor: colors.background, flex: 1.4 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.infoCardLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      🎂 Sinh
                    </Text>
                    {(zodiacChi || westernZodiac) && (
                      <View style={styles.miniBadgeRow}>
                        {zodiacChi && (
                          <View
                            style={[
                              styles.miniBadge,
                              { backgroundColor: colors.danger + "22" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                { color: colors.danger },
                              ]}
                            >
                              Tuổi {zodiacChi}
                            </Text>
                          </View>
                        )}
                        {westernZodiac && (
                          <View
                            style={[
                              styles.miniBadge,
                              { backgroundColor: colors.primary + "22" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                { color: colors.primary },
                              ]}
                            >
                              {westernZodiac}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    <Text
                      style={[styles.infoCardValue, { color: colors.text }]}
                    >
                      {birthDateLabel}
                    </Text>
                    {lunarDateLabel && (
                      <Text
                        style={[
                          styles.infoCardSub,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {lunarDateLabel}
                      </Text>
                    )}
                  </View>
                )}
                {age !== null && (
                  <View
                    style={[
                      styles.infoCard,
                      { backgroundColor: colors.accent + "1A", flex: 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.infoCardLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {isDeceased ? "Hưởng thọ" : "Tuổi"}
                    </Text>
                    <Text style={[styles.ageValue, { color: colors.text }]}>
                      {age} tuổi
                    </Text>
                    {deathDateLabel && (
                      <Text
                        style={[
                          styles.infoCardSub,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Mất {deathDateLabel}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {relations.children.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  👶 Hậu duệ
                </Text>
                <View style={styles.infoCardsRow}>
                  <View
                    style={[
                      styles.infoCard,
                      { backgroundColor: colors.background, flex: 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.infoCardLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Con ruột
                    </Text>
                    <Text
                      style={[styles.infoCardValue, { color: colors.text }]}
                    >
                      {relations.children.length}
                    </Text>
                    <Text
                      style={[
                        styles.infoCardSub,
                        { color: colors.textSecondary },
                      ]}
                    >
                      <Text style={{ color: colors.text }}>♂</Text> {sonCount}{" "}
                      <Text style={{ color: colors.text }}>♀</Text>{" "}
                      {daughterCount}
                    </Text>
                  </View>
                  {inLaws.length > 0 && (
                    <View
                      style={[
                        styles.infoCard,
                        { backgroundColor: colors.background, flex: 1 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.infoCardLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Dâu / Rể
                      </Text>
                      <Text
                        style={[styles.infoCardValue, { color: colors.text }]}
                      >
                        {inLaws.length}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {person.note && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  📝 Ghi chú
                </Text>
                <View
                  style={[
                    styles.noteBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={[styles.noteText, { color: colors.text }]}>
                    {person.note}
                  </Text>
                </View>
              </View>
            )}

            {(person.phone || person.occupation || person.currentAddress) && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🔒 Thông tin liên hệ
                </Text>
                {person.phone && (
                  <View
                    style={[
                      styles.contactRow,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.contactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      📞 Số điện thoại
                    </Text>
                    <Text style={[styles.contactValue, { color: colors.text }]}>
                      {person.phone}
                    </Text>
                  </View>
                )}
                {person.occupation && (
                  <View
                    style={[
                      styles.contactRow,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.contactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      💼 Nghề nghiệp
                    </Text>
                    <Text style={[styles.contactValue, { color: colors.text }]}>
                      {person.occupation}
                    </Text>
                  </View>
                )}
                {person.currentAddress && (
                  <View
                    style={[
                      styles.contactRow,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.contactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      📍 Nơi ở hiện tại
                    </Text>
                    <Text style={[styles.contactValue, { color: colors.text }]}>
                      {person.currentAddress}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                👪 Gia đình
              </Text>

              {(relations.father || relations.mother) && (
                <>
                  <Text
                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                  >
                    Bố / Mẹ
                  </Text>
                  {relations.father && (
                    <RelationRow
                      person={relations.father}
                      onPress={() => handleNavigate(relations.father!.id)}
                    />
                  )}
                  {relations.mother && (
                    <RelationRow
                      person={relations.mother}
                      onPress={() => handleNavigate(relations.mother!.id)}
                    />
                  )}
                </>
              )}

              {spouseFamilyPairs.length > 0 && (
                <>
                  <Text
                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                  >
                    Vợ / Chồng
                  </Text>
                  {spouseFamilyPairs.map(({ spouse, familyId }) => (
                    <View key={spouse.id} style={styles.spouseRowWrap}>
                      <View style={{ flex: 1 }}>
                        <RelationRow
                          person={spouse}
                          onPress={() => handleNavigate(spouse.id)}
                        />
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.addChildInlineBtn,
                          { backgroundColor: colors.background },
                        ]}
                        onPress={() => onAddChild(familyId)}
                      >
                        <Text
                          style={[
                            styles.addChildInlineText,
                            { color: colors.primary },
                          ]}
                        >
                          + Con
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {relations.children.length > 0 && (
                <>
                  <Text
                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                  >
                    Con cái
                  </Text>
                  {relations.children.map((c) => (
                    <RelationRow
                      key={c.id}
                      person={c}
                      onPress={() => handleNavigate(c.id)}
                    />
                  ))}
                </>
              )}

              {inLaws.length > 0 && (
                <>
                  <Text
                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                  >
                    Con dâu / Con rể
                  </Text>
                  {inLaws.map((inLaw) => (
                    <RelationRow
                      key={inLaw.person.id}
                      person={inLaw.person}
                      subLabel={inLaw.label}
                      onPress={() => handleNavigate(inLaw.person.id)}
                    />
                  ))}
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.addSpouseBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={onAddSpouse}
              >
                <Text style={[styles.addSpouseBtnText, { color: colors.text }]}>
                  {spouseFamilyPairs.length > 0
                    ? "+ Thêm vợ/chồng khác"
                    : "+ Thêm vợ/chồng"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[
                  styles.meBtn,
                  { backgroundColor: colors.background },
                  isMe && { backgroundColor: colors.success },
                ]}
                onPress={onToggleMe}
              >
                <Text
                  style={[
                    styles.meBtnText,
                    { color: colors.text },
                    isMe && { color: "#fff" },
                  ]}
                >
                  {isMe ? "✓ Đây là tôi" : "Đánh dấu đây là tôi"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  { backgroundColor: colors.danger + "1A" },
                ]}
                onPress={onDelete}
              >
                <Text style={[styles.deleteBtnText, { color: colors.danger }]}>
                  🗑️ Xoá người này
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    padding: 16,
  },
  card: { borderRadius: 18, padding: 16, maxHeight: "88%" },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  editBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIconText: { fontSize: 14, fontWeight: "700" },

  headerBlock: { alignItems: "center", marginBottom: 16, marginTop: 4 },
  avatarWrap: { position: "relative", marginBottom: 10 },
  avatarLarge: { width: 76, height: 76, borderRadius: 38 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarLargeText: { color: "#fff", fontSize: 30, fontWeight: "700" },
  genderBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  genderBadgeText: { fontSize: 12, fontWeight: "700" },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  infoCardsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  infoCard: { borderRadius: 12, padding: 12 },
  infoCardLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  infoCardValue: { fontSize: 16, fontWeight: "700" },
  infoCardSub: { fontSize: 11, marginTop: 2 },
  ageValue: { fontSize: 20, fontWeight: "700" },
  miniBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  miniBadgeText: { fontSize: 10, fontWeight: "700" },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },

  noteBox: { borderRadius: 10, padding: 12 },
  noteText: { fontSize: 13, lineHeight: 19 },

  contactRow: { borderRadius: 10, padding: 10, marginBottom: 8 },
  contactLabel: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
  contactValue: { fontSize: 13, fontWeight: "600" },

  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 6,
  },
  relationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: 10,
  },
  spouseRowWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  addChildInlineBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addChildInlineText: { fontSize: 11, fontWeight: "700" },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmallText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  relationName: { fontSize: 13, fontWeight: "600" },
  relationSub: { fontSize: 11, marginTop: 1 },
  relationChevron: { fontSize: 18 },

  addSpouseBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addSpouseBtnText: { fontWeight: "700", fontSize: 13 },

  bottomActions: { gap: 8, marginTop: 4 },
  meBtn: { paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  meBtnText: { fontWeight: "600", fontSize: 13 },
  deleteBtn: { paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  deleteBtnText: { fontWeight: "700", fontSize: 13 },
});
