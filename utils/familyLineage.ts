import { Person, Family } from "../types/family";

/**
 * Tính chuỗi "trưởng" của dòng họ: bắt đầu từ con trai đầu tiên (theo thứ tự childrenIds,
 * không nhất thiết là con đầu lòng) của gia đình gốc, rồi tiếp tục truyền xuống
 * con trai đầu tiên của người đó, cứ thế qua từng đời.
 *
 * Dừng lại nếu 1 đời nào đó không có con trai (không có ai để truyền tiếp).
 *
 * Trả về mảng id người theo đúng thứ tự đời (đời 2 -> đời 3 -> ...).
 * Đời 1 (cặp gốc) không tính là "trưởng" vì đó là điểm xuất phát, chưa có ai truyền cho.
 */
export function computeTruongLineage(
    rootFamilyId: string,
    persons: Person[],
    families: Family[]
): string[] {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));

    const lineage: string[] = [];
    let currentFamilyId: string | undefined = rootFamilyId;

    while (currentFamilyId) {
        const family = familyMap.get(currentFamilyId);
        if (!family) break;

        const eldestSon = family.childrenIds
            .map((id) => personMap.get(id))
            .find((p) => p && p.gender === "male");

        if (!eldestSon) break; // không có con trai -> chuỗi trưởng dừng ở đây

        lineage.push(eldestSon.id);
        currentFamilyId = eldestSon.spouseInFamilyIds[0]; // đi tiếp xuống gia đình riêng của người này (nếu có)
    }

    return lineage;
}