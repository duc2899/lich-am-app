import { Person, Family } from "../types/family";
import { computeTruongLineage } from "./familyLineage";
import { getChiOfYear } from "../constants/lunar";

export type FamilyStatistics = {
    totalMembers: number;
    maleCount: number;
    femaleCount: number;
    daughterInLawCount: number; // con dâu
    sonInLawCount: number; // con rể
    marriedCount: number;
    unmarriedCount: number;
    deceasedCount: number;
    truongCount: number; // con trưởng (toàn bộ chuỗi trưởng qua các đời)
    generationCounts: { generation: number; count: number }[]; // đời 1, 2, 3... -> số người
    zodiacCounts: { chi: string; count: number }[]; // con giáp -> số người, sắp xếp giảm dần
};

/**
 * Xác định 1 người có phải "dâu/rể" hay không: là người KHÔNG sinh ra trong dòng họ
 * (không có childOfFamilyId) NHƯNG có vợ/chồng là người sinh ra trong dòng họ (có childOfFamilyId).
 * Nhờ vậy vợ/chồng của thuỷ tổ (gốc cây) không bị tính nhầm thành "dâu/rể".
 */
function isMarriedIn(person: Person, personMap: Map<string, Person>, familyMap: Map<string, Family>): boolean {
    if (person.childOfFamilyId) return false; // là con cháu ruột trong cây -> không phải dâu/rể

    return person.spouseInFamilyIds.some((famId) => {
        const fam = familyMap.get(famId);
        if (!fam) return false;
        const spouseId = fam.husbandId === person.id ? fam.wifeId : fam.husbandId;
        const spouse = spouseId ? personMap.get(spouseId) : undefined;
        return !!spouse?.childOfFamilyId;
    });
}

/**
 * Tính số đời (thế hệ) của từng người, bắt đầu từ gốc cây = đời 1. Vợ/chồng của 1 người
 * được tính CÙNG đời với người đó (vì 1 "đời" thường tính theo cặp vợ chồng), con cái
 * của họ ở đời kế tiếp. Duyệt theo kiểu BFS từ gốc cây lan toả dần ra.
 */
function computeGenerations(
    rootPersonId: string,
    persons: Person[],
    families: Family[]
): Map<string, number> {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));
    const generation = new Map<string, number>();

    generation.set(rootPersonId, 1);
    const queue: string[] = [rootPersonId];

    while (queue.length > 0) {
        const personId = queue.shift()!;
        const gen = generation.get(personId)!;
        const person = personMap.get(personId);
        if (!person) continue;

        for (const famId of person.spouseInFamilyIds) {
            const fam = familyMap.get(famId);
            if (!fam) continue;

            const spouseId = fam.husbandId === personId ? fam.wifeId : fam.husbandId;
            if (spouseId && !generation.has(spouseId)) {
                generation.set(spouseId, gen);
                queue.push(spouseId);
            }

            for (const childId of fam.childrenIds) {
                if (!generation.has(childId)) {
                    generation.set(childId, gen + 1);
                    queue.push(childId);
                }
            }
        }
    }

    return generation;
}

export function computeFamilyStatistics(
    rootPersonId: string | null,
    persons: Person[],
    families: Family[]
): FamilyStatistics {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));

    const totalMembers = persons.length;
    const maleCount = persons.filter((p) => p.gender === "male").length;
    const femaleCount = persons.filter((p) => p.gender === "female").length;

    let daughterInLawCount = 0;
    let sonInLawCount = 0;
    for (const p of persons) {
        if (isMarriedIn(p, personMap, familyMap)) {
            if (p.gender === "female") daughterInLawCount++;
            else sonInLawCount++;
        }
    }

    const marriedCount = persons.filter((p) => p.spouseInFamilyIds.length > 0).length;
    const unmarriedCount = totalMembers - marriedCount;
    const deceasedCount = persons.filter((p) => !!p.deathYear).length;

    const truongCount = rootPersonId ? computeTruongLineage(rootPersonId, persons, families).length : 0;

    // Phân bố theo thế hệ
    const generationCounts: { generation: number; count: number }[] = [];
    if (rootPersonId) {
        const genMap = computeGenerations(rootPersonId, persons, families);
        const countByGen = new Map<number, number>();
        for (const gen of genMap.values()) {
            countByGen.set(gen, (countByGen.get(gen) ?? 0) + 1);
        }
        const sortedGens = Array.from(countByGen.keys()).sort((a, b) => a - b);
        for (const gen of sortedGens) {
            generationCounts.push({ generation: gen, count: countByGen.get(gen)! });
        }
    }

    // Con giáp -- chỉ tính người có birthYear, dùng công thức Địa Chi theo năm sinh (xấp xỉ,
    // không tính chính xác tuyệt đối cho người sinh trước Tết vì chỉ lưu năm dương, không lưu
    // ngày/tháng sinh chi tiết)
    const chiCountMap = new Map<string, number>();
    for (const p of persons) {
        if (!p.birthYear) continue;
        const chi = getChiOfYear(p.birthYear);
        chiCountMap.set(chi, (chiCountMap.get(chi) ?? 0) + 1);
    }
    const zodiacCounts = Array.from(chiCountMap.entries())
        .map(([chi, count]) => ({ chi, count }))
        .sort((a, b) => b.count - a.count);

    return {
        totalMembers,
        maleCount,
        femaleCount,
        daughterInLawCount,
        sonInLawCount,
        marriedCount,
        unmarriedCount,
        deceasedCount,
        truongCount,
        generationCounts,
        zodiacCounts,
    };
}