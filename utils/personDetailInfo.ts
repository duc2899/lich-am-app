import { Person, Family } from "../types/family";
import { getPersonRelations, PersonRelations } from "./familyRelations";
import { computeGenerations } from "./familyStatistics";
import { getChiOfYear, solarToLunar } from "../constants/lunar";
import { getWesternZodiacSign } from "./zodiacSign";

export type InLawInfo = {
    person: Person;
    label: string; // "Con dâu (vợ của Nguyễn Văn A)" hoặc "Con rể (chồng của ...)"
};

export type PersonDetailInfo = {
    relations: PersonRelations;
    generation: number | null;
    age: number | null; // tuổi hiện tại (nếu còn sống) hoặc hưởng thọ (nếu đã mất)
    isDeceased: boolean;
    zodiacChi: string | null; // con giáp, chỉ có nếu có birthYear
    westernZodiac: string | null; // cung hoàng đạo, chỉ có nếu có đủ birthDay+birthMonth
    lunarDateLabel: string | null; // "24/02 âm lịch", chỉ có nếu có đủ birthDay+birthMonth+birthYear
    sonCount: number;
    daughterCount: number;
    inLaws: InLawInfo[]; // dâu/rể của CON của người này
    // Ghép sẵn từng vợ/chồng với đúng family id của cuộc hôn nhân đó -- cần để biết
    // "Thêm con" nên thêm vào gia đình nào khi 1 người có nhiều vợ/chồng.
    spouseFamilyPairs: { spouse: Person; familyId: string }[];
};

export function computePersonDetailInfo(
    personId: string,
    persons: Person[],
    families: Family[],
    rootPersonId: string | null
): PersonDetailInfo {
    const person = persons.find((p) => p.id === personId);
    const relations = getPersonRelations(personId, persons, families);

    const currentYear = new Date().getFullYear();
    let age: number | null = null;
    if (person?.birthYear) {
        age = person.deathYear ? person.deathYear - person.birthYear : currentYear - person.birthYear;
    }

    let generation: number | null = null;
    if (rootPersonId) {
        const genMap = computeGenerations(rootPersonId, persons, families);
        generation = genMap.get(personId) ?? null;
    }

    const zodiacChi = person?.birthYear ? getChiOfYear(person.birthYear) : null;
    const westernZodiac =
        person?.birthDay && person?.birthMonth ? getWesternZodiacSign(person.birthDay, person.birthMonth) : null;

    let lunarDateLabel: string | null = null;
    if (person?.birthDay && person?.birthMonth && person?.birthYear) {
        const lunar = solarToLunar(person.birthDay, person.birthMonth, person.birthYear);
        lunarDateLabel = `${String(lunar.day).padStart(2, "0")}/${String(lunar.month).padStart(2, "0")} âm lịch${lunar.leap ? " (nhuận)" : ""
            }`;
    }

    const sonCount = relations.children.filter((c) => c.gender === "male").length;
    const daughterCount = relations.children.filter((c) => c.gender === "female").length;

    // Dâu/rể của con: với mỗi con, tìm vợ/chồng của con đó (nếu có)
    const personMap = new Map(persons.map((p) => [p.id, p]));
    const familyMap = new Map(families.map((f) => [f.id, f]));
    const inLaws: InLawInfo[] = [];
    for (const child of relations.children) {
        for (const famId of child.spouseInFamilyIds) {
            const fam = familyMap.get(famId);
            if (!fam) continue;
            const spouseId = fam.husbandId === child.id ? fam.wifeId : fam.husbandId;
            const spouse = spouseId ? personMap.get(spouseId) : undefined;
            if (spouse) {
                const relationWord = spouse.gender === "female" ? "Con dâu" : "Con rể";
                const marriedToWord = spouse.gender === "female" ? "vợ của" : "chồng của";
                inLaws.push({ person: spouse, label: `${relationWord} (${marriedToWord} ${child.fullName})` });
            }
        }
    }

    // Ghép mỗi vợ/chồng với đúng family id của cuộc hôn nhân đó
    const spouseFamilyPairs: { spouse: Person; familyId: string }[] = [];
    if (person) {
        for (const famId of person.spouseInFamilyIds) {
            const fam = familyMap.get(famId);
            if (!fam) continue;
            const spouseId = fam.husbandId === person.id ? fam.wifeId : fam.husbandId;
            const spouse = spouseId ? personMap.get(spouseId) : undefined;
            if (spouse) spouseFamilyPairs.push({ spouse, familyId: famId });
        }
    }

    return {
        relations,
        generation,
        age,
        isDeceased: !!person?.deathYear,
        zodiacChi,
        westernZodiac,
        lunarDateLabel,
        sonCount,
        daughterCount,
        inLaws,
        spouseFamilyPairs,
    };
}