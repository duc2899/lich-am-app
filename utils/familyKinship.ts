import { Person, Family } from "../types/family";

type AncestorEntry = { depth: number; via?: string };

export type KinshipLookupResult = {
    termAToB: string | undefined;
    termBToA: string | undefined;
    relationshipTypeLabel: string;
    commonAncestorId: string | null;
    distance: number;
};

function buildMaps(persons: Person[], families: Family[]) {
    return {
        personMap: new Map(persons.map((p) => [p.id, p])),
        familyMap: new Map(families.map((f) => [f.id, f])),
    };
}

function parentsOf(
    personId: string,
    personMap: Map<string, Person>,
    familyMap: Map<string, Family>
): { father?: Person; mother?: Person } {
    const person = personMap.get(personId);
    if (!person?.childOfFamilyId) return {};
    const fam = familyMap.get(person.childOfFamilyId);
    if (!fam) return {};
    return {
        father: fam.husbandId ? personMap.get(fam.husbandId) : undefined,
        mother: fam.wifeId ? personMap.get(fam.wifeId) : undefined,
    };
}

function isDirectSpouse(
    aId: string,
    bId: string,
    personMap: Map<string, Person>,
    familyMap: Map<string, Family>
): boolean {
    const a = personMap.get(aId);
    if (!a) return false;
    return a.spouseInFamilyIds.some((famId) => {
        const fam = familyMap.get(famId);
        return !!fam && (fam.husbandId === bId || fam.wifeId === bId);
    });
}

function buildAncestorMap(
    startId: string,
    personMap: Map<string, Person>,
    familyMap: Map<string, Family>
): Map<string, AncestorEntry> {
    const result = new Map<string, AncestorEntry>();
    let frontier: { id: string; via?: string }[] = [{ id: startId }];
    let depth = 0;
    const visited = new Set<string>();

    while (frontier.length > 0) {
        const next: { id: string; via?: string }[] = [];
        for (const { id, via } of frontier) {
            if (visited.has(id)) continue;
            visited.add(id);
            result.set(id, { depth, via });
            const { father, mother } = parentsOf(id, personMap, familyMap);
            if (father) next.push({ id: father.id, via: id });
            if (mother) next.push({ id: mother.id, via: id });
        }
        frontier = next;
        depth++;
    }
    return result;
}

function walkViaChain(map: Map<string, AncestorEntry>, startId: string, steps: number): string {
    let current = startId;
    for (let i = 0; i < steps; i++) {
        const entry = map.get(current);
        if (!entry?.via) break;
        current = entry.via;
    }
    return current;
}

function genderTerm(gender: Person["gender"], male: string, female: string): string {
    return gender === "male" ? male : female;
}

function compareAge(a?: Person, b?: Person): -1 | 0 | 1 {
    if (!a?.birthYear || !b?.birthYear) return 0;
    if (a.birthYear < b.birthYear) return -1;
    if (a.birthYear > b.birthYear) return 1;
    return 0;
}

type BloodResult = { term: string | undefined; commonAncestorId: string | null; M: number; N: number };

function computeBloodKinship(
    meId: string,
    targetId: string,
    personMap: Map<string, Person>,
    familyMap: Map<string, Family>
): BloodResult {
    const notFound: BloodResult = { term: undefined, commonAncestorId: null, M: 0, N: 0 };
    if (meId === targetId) return notFound;

    const target = personMap.get(targetId);
    if (!target) return notFound;

    const meAncestors = buildAncestorMap(meId, personMap, familyMap);
    const targetAncestors = buildAncestorMap(targetId, personMap, familyMap);

    let bestCommon: string | null = null;
    let bestM = Infinity;
    let bestN = Infinity;

    for (const [id, meEntry] of meAncestors) {
        const targetEntry = targetAncestors.get(id);
        if (targetEntry && meEntry.depth + targetEntry.depth < bestM + bestN) {
            bestCommon = id;
            bestM = meEntry.depth;
            bestN = targetEntry.depth;
        }
    }

    if (bestCommon === null) return notFound;

    const M = bestM;
    const N = bestN;

    if (M === 0) {
        if (N === 1) return { term: genderTerm(target.gender, "Con trai", "Con gái"), commonAncestorId: bestCommon, M, N };
        if (N === 2) return { term: genderTerm(target.gender, "Cháu trai", "Cháu gái"), commonAncestorId: bestCommon, M, N };
        if (N === 3) return { term: "Chắt", commonAncestorId: bestCommon, M, N };
        if (N > 3) return { term: `Đời cháu thứ ${N}`, commonAncestorId: bestCommon, M, N };
    }

    if (N === 0) {
        if (M === 1) return { term: genderTerm(target.gender, "Bố", "Mẹ"), commonAncestorId: bestCommon, M, N };
        if (M === 2) return { term: genderTerm(target.gender, "Ông nội", "Bà nội"), commonAncestorId: bestCommon, M, N };
        if (M === 3) return { term: genderTerm(target.gender, "Cụ ông", "Cụ bà"), commonAncestorId: bestCommon, M, N };
        if (M > 3) return { term: `Tổ tiên đời thứ ${M}`, commonAncestorId: bestCommon, M, N };
    }

    const genGap = M - N;

    if (genGap === 0) {
        const meP = personMap.get(meId);
        const order = compareAge(meP, target);
        if (order === 0) return { term: undefined, commonAncestorId: bestCommon, M, N };
        const suffix = M === 1 ? "" : " họ";
        if (order === -1) {
            return { term: genderTerm(target.gender, "Em trai", "Em gái") + suffix, commonAncestorId: bestCommon, M, N };
        }
        return { term: genderTerm(target.gender, "Anh", "Chị") + suffix, commonAncestorId: bestCommon, M, N };
    }

    if (genGap === 1) {
        const myLinkPersonId = walkViaChain(meAncestors, bestCommon, N);
        const myLinkPerson = personMap.get(myLinkPersonId);
        const suffix = M === 2 ? "" : " họ";
        if (target.gender === "female") return { term: "Cô" + suffix, commonAncestorId: bestCommon, M, N };
        const order = compareAge(target, myLinkPerson);
        if (order === 0) return { term: undefined, commonAncestorId: bestCommon, M, N };
        return { term: (order === -1 ? "Bác" : "Chú") + suffix, commonAncestorId: bestCommon, M, N };
    }

    if (genGap === 2) {
        return { term: genderTerm(target.gender, "Ông họ", "Bà họ"), commonAncestorId: bestCommon, M, N };
    }

    if (genGap <= -1) {
        return { term: genderTerm(target.gender, "Cháu trai", "Cháu gái"), commonAncestorId: bestCommon, M, N };
    }

    return { term: undefined, commonAncestorId: bestCommon, M, N };
}

export function computeKinshipTerm(
    meId: string,
    targetId: string,
    persons: Person[],
    families: Family[]
): string | undefined {
    const { personMap, familyMap } = buildMaps(persons, families);

    if (isDirectSpouse(meId, targetId, personMap, familyMap)) {
        const target = personMap.get(targetId)!;
        return genderTerm(target.gender, "Chồng", "Vợ");
    }

    const blood = computeBloodKinship(meId, targetId, personMap, familyMap);
    if (blood.term) return blood.term;

    const target = personMap.get(targetId);
    if (target) {
        for (const famId of target.spouseInFamilyIds) {
            const fam = familyMap.get(famId);
            if (!fam) continue;
            const partnerId = fam.husbandId === targetId ? fam.wifeId : fam.husbandId;
            if (!partnerId || partnerId === meId) continue;

            const partnerBlood = computeBloodKinship(meId, partnerId, personMap, familyMap);
            if (!partnerBlood.term) continue;

            if (partnerBlood.term === "Con trai" || partnerBlood.term === "Con gái") {
                return genderTerm(target.gender, "Con rể", "Con dâu");
            }
            if (partnerBlood.term.startsWith("Anh") || partnerBlood.term.startsWith("Em trai")) {
                return genderTerm(target.gender, "Em rể", "Chị dâu");
            }
            if (partnerBlood.term.startsWith("Chị") || partnerBlood.term.startsWith("Em gái")) {
                return genderTerm(target.gender, "Anh rể", "Em dâu");
            }
        }
    }

    // Chiều ngược lại: CHÍNH MÌNH là người dâu/rể (married-in), xưng hô với bố/mẹ của vợ/chồng mình
    const me = personMap.get(meId);
    if (me) {
        for (const famId of me.spouseInFamilyIds) {
            const fam = familyMap.get(famId);
            if (!fam) continue;
            const myPartnerId = fam.husbandId === meId ? fam.wifeId : fam.husbandId;
            if (!myPartnerId) continue;

            const partnerToTarget = computeBloodKinship(myPartnerId, targetId, personMap, familyMap);
            if (partnerToTarget.term === "Bố" || partnerToTarget.term === "Mẹ") {
                // target là bố/mẹ của vợ/chồng mình -> tôi là con dâu thì gọi "Bố chồng/Mẹ chồng",
                // là con rể thì gọi "Bố vợ/Mẹ vợ" (dựa theo giới tính của người vợ/chồng mình, tức myPartner)
                const myPartner = personMap.get(myPartnerId);
                const isMySpouseFemale = myPartner?.gender === "female";
                if (partnerToTarget.term === "Bố") return isMySpouseFemale ? "Bố vợ" : "Bố chồng";
                return isMySpouseFemale ? "Mẹ vợ" : "Mẹ chồng";
            }
        }
    }

    return undefined;
}

export function lookupKinship(
    aId: string,
    bId: string,
    persons: Person[],
    families: Family[]
): KinshipLookupResult {
    const { personMap, familyMap } = buildMaps(persons, families);

    if (isDirectSpouse(aId, bId, personMap, familyMap)) {
        return {
            termAToB: computeKinshipTerm(aId, bId, persons, families),
            termBToA: computeKinshipTerm(bId, aId, persons, families),
            relationshipTypeLabel: "Quan hệ hôn nhân",
            commonAncestorId: null,
            distance: 0,
        };
    }

    const blood = computeBloodKinship(aId, bId, personMap, familyMap);
    const termAToB = computeKinshipTerm(aId, bId, persons, families);
    const termBToA = computeKinshipTerm(bId, aId, persons, families);

    if (blood.commonAncestorId === null) {
        const hasAnyTerm = termAToB || termBToA;
        return {
            termAToB,
            termBToA,
            relationshipTypeLabel: hasAnyTerm ? "Quan hệ qua hôn nhân (dâu/rể)" : "Không tìm thấy quan hệ trong gia phả",
            commonAncestorId: null,
            distance: 0,
        };
    }

    const isDirectLineage = blood.M === 0 || blood.N === 0;

    return {
        termAToB,
        termBToA,
        relationshipTypeLabel: isDirectLineage ? "Trực hệ" : "Cùng huyết thống (họ hàng ngang/lệch vai)",
        commonAncestorId: blood.commonAncestorId,
        distance: blood.M + blood.N,
    };
}