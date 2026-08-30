import { Person, Family } from "../types/family";

/**
 * Tính chuỗi "trưởng" của dòng họ: người tạo cây gốc (đời 1) MẶC ĐỊNH là trưởng.
 * Từ đó, con trai LỚN TUỔI NHẤT (so theo birthYear, không phải theo thứ tự thêm vào)
 * tiếp tục là trưởng đời 2, rồi con trai lớn tuổi nhất của người đó là trưởng đời 3, cứ thế.
 *
 * Nếu 1 người có từ 2 vợ/chồng trở lên: xét lần lượt từng cuộc hôn nhân theo đúng
 * thứ tự đã thêm (mặc định vợ/chồng đầu tiên được ưu tiên trước), dùng cuộc hôn nhân
 * ĐẦU TIÊN có con trai để tiếp tục chuỗi trưởng. Đây là quy ước đơn giản hoá, có thể
 * cần điều chỉnh nếu phong tục gia đình cụ thể khác đi.
 *
 * Con trai nào thiếu năm sinh sẽ bị xếp sau cùng (không đủ căn cứ để coi là lớn tuổi nhất).
 *
 * Dừng lại nếu không tìm được con trai nào ở bất kỳ cuộc hôn nhân nào của người hiện tại.
 *
 * Trả về mảng id người theo đúng thứ tự đời (đời 1 -> đời 2 -> ...).
 */
export function computeTruongLineage(
  rootPersonId: string,
  persons: Person[],
  families: Family[],
): string[] {
  const personMap = new Map(persons.map((p) => [p.id, p]));
  const familyMap = new Map(families.map((f) => [f.id, f]));

  function findEldestSon(familyIds: string[]): Person | undefined {
    for (const famId of familyIds) {
      const fam = familyMap.get(famId);
      if (!fam) continue;

      const sons = fam.childrenIds
        .map((id) => personMap.get(id))
        .filter((p): p is Person => !!p && p.gender === "male");

      if (sons.length === 0) continue;

      // So sánh năm sinh để tìm đúng người lớn tuổi nhất (năm sinh nhỏ nhất).
      // Ai thiếu năm sinh bị đẩy xuống cuối (Infinity) để tránh nhận nhầm làm trưởng.
      const eldest = sons.reduce((a, b) => {
        const ay = a.birthYear ?? Infinity;
        const by = b.birthYear ?? Infinity;
        return by < ay ? b : a;
      });

      return eldest;
    }
    return undefined;
  }

  const rootPerson = personMap.get(rootPersonId);
  if (!rootPerson) return [];

  // Người tạo gốc cây luôn được tính là trưởng (đời 1)
  const lineage: string[] = [rootPersonId];
  let currentFamilyIds: string[] = rootPerson.spouseInFamilyIds;

  while (true) {
    const eldestSon = findEldestSon(currentFamilyIds);
    if (!eldestSon) break;

    lineage.push(eldestSon.id);

    if (eldestSon.spouseInFamilyIds.length === 0) break;
    currentFamilyIds = eldestSon.spouseInFamilyIds;
  }

  return lineage;
}
