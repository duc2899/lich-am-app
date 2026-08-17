import { Person, Family } from "../types/family";

// Node hiển thị: hoặc là 1 cặp vợ chồng (family), hoặc 1 người chưa lập gia đình (leaf)
export type DisplayNode = {
    id: string;
    husband?: Person;
    wife?: Person;
    singlePerson?: Person;
    children: DisplayNode[];
};

export function buildDisplayTree(
    rootFamilyId: string,
    persons: Person[],
    families: Family[]
): DisplayNode | null {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));

    function buildFromFamily(familyId: string): DisplayNode | null {
        const family = familyMap.get(familyId);
        if (!family) return null;

        const husband = family.husbandId ? personMap.get(family.husbandId) : undefined;
        const wife = family.wifeId ? personMap.get(family.wifeId) : undefined;

        const children: DisplayNode[] = family.childrenIds
            .map((childId) => {
                const child = personMap.get(childId);
                if (!child) return null;

                // Nếu con đã có gia đình riêng (đã lập gia đình) -> hiển thị như 1 cặp vợ chồng mới, đệ quy tiếp
                if (child.spouseInFamilyIds.length > 0) {
                    return buildFromFamily(child.spouseInFamilyIds[0]);
                }
                // Chưa có gia đình riêng -> hiển thị như 1 node đơn (chưa rẽ nhánh tiếp)
                return { id: child.id, singlePerson: child, children: [] } as DisplayNode;
            })
            .filter((n): n is DisplayNode => n !== null);

        return { id: family.id, husband, wife, children };
    }

    return buildFromFamily(rootFamilyId);
}