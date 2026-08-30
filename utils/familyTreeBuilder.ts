import { Person, Family } from "../types/family";

// 1 nhánh hôn nhân trong trường hợp 1 người có từ 2 vợ/chồng trở lên
export type Marriage = {
  familyId: string;
  spouse?: Person; // có thể chưa rõ (Family thiếu husbandId/wifeId)
  children: DisplayNode[];
};

export type DisplayNode = {
  id: string;
  husband?: Person;
  wife?: Person;
  singlePerson?: Person;
  // Chỉ có giá trị khi 1 người có >= 2 cuộc hôn nhân -> hiển thị rẽ nhánh thay vì cặp đơn
  multiMarriage?: {
    anchor: Person;
    marriages: Marriage[];
  };
  children: DisplayNode[]; // dùng cho husband/wife hoặc singlePerson; multiMarriage tự chứa children riêng trong từng marriage
};

export function buildDisplayTree(
  rootPersonId: string,
  persons: Person[],
  families: Family[],
): DisplayNode | null {
  const personMap = new Map(persons.map((p) => [p.id, p]));
  const familyMap = new Map(families.map((f) => [f.id, f]));

  function buildPersonNode(personId: string): DisplayNode | null {
    const person = personMap.get(personId);
    if (!person) return null;

    if (person.spouseInFamilyIds.length === 0) {
      return { id: person.id, singlePerson: person, children: [] };
    }

    if (person.spouseInFamilyIds.length === 1) {
      return buildFromFamily(person.spouseInFamilyIds[0]);
    }

    // Từ 2 cuộc hôn nhân trở lên -> rẽ nhánh
    const marriages: Marriage[] = [];
    for (const famId of person.spouseInFamilyIds) {
      const fam = familyMap.get(famId);
      if (!fam) continue;
      const spouseId = fam.husbandId === person.id ? fam.wifeId : fam.husbandId;
      const spouse = spouseId ? personMap.get(spouseId) : undefined;
      const children = fam.childrenIds
        .map((cid) => buildPersonNode(cid))
        .filter((n): n is DisplayNode => n !== null);
      marriages.push({ familyId: fam.id, spouse, children });
    }

    return {
      id: person.id,
      multiMarriage: { anchor: person, marriages },
      children: [],
    };
  }

  function buildFromFamily(familyId: string): DisplayNode | null {
    const family = familyMap.get(familyId);
    if (!family) return null;

    const husband = family.husbandId
      ? personMap.get(family.husbandId)
      : undefined;
    const wife = family.wifeId ? personMap.get(family.wifeId) : undefined;

    const children = family.childrenIds
      .map((cid) => buildPersonNode(cid))
      .filter((n): n is DisplayNode => n !== null);

    return { id: family.id, husband, wife, children };
  }

  // Gốc cây giờ là 1 NGƯỜI (không phải 1 Family cố định) -> tự xử lý đúng cả 3 trường hợp
  // (chưa có vợ/chồng, có 1, hay có nhiều) ngay tại chính gốc, không cần ép phải có Family từ đầu.
  return buildPersonNode(rootPersonId);
}

/**
 * Trả về danh sách con để dùng cho d3-hierarchy: gộp phẳng con của tất cả các nhánh hôn nhân
 * nếu là node multiMarriage, còn lại dùng children bình thường.
 */
export function getNodeChildren(node: DisplayNode): DisplayNode[] {
  if (node.multiMarriage) {
    return node.multiMarriage.marriages.flatMap((m) => m.children);
  }
  return node.children;
}
