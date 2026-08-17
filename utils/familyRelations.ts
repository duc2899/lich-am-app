import { Person, Family } from "../types/family";

export type PersonRelations = {
    father?: Person;
    mother?: Person;
    spouses: Person[];
    children: Person[];
};

export function getPersonRelations(
    personId: string,
    persons: Person[],
    families: Family[]
): PersonRelations {
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));
    const person = personMap.get(personId);

    const relations: PersonRelations = { spouses: [], children: [] };
    if (!person) return relations;

    // Cha mẹ: tra qua gia đình mà người này LÀ CON
    if (person.childOfFamilyId) {
        const parentFamily = familyMap.get(person.childOfFamilyId);
        if (parentFamily) {
            relations.father = parentFamily.husbandId ? personMap.get(parentFamily.husbandId) : undefined;
            relations.mother = parentFamily.wifeId ? personMap.get(parentFamily.wifeId) : undefined;
        }
    }

    // Vợ/chồng + con: tra qua các gia đình mà người này LÀ VỢ/CHỒNG
    for (const famId of person.spouseInFamilyIds) {
        const fam = familyMap.get(famId);
        if (!fam) continue;

        const spouseId = fam.husbandId === personId ? fam.wifeId : fam.husbandId;
        if (spouseId) {
            const spouse = personMap.get(spouseId);
            if (spouse) relations.spouses.push(spouse);
        }

        for (const childId of fam.childrenIds) {
            const child = personMap.get(childId);
            if (child) relations.children.push(child);
        }
    }

    return relations;
}