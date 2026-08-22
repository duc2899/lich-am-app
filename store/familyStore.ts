import { create } from "zustand";
import { Person, Family, Gender } from "../types/family";
import { SAMPLE_PERSONS, SAMPLE_FAMILIES, ROOT_FAMILY_ID } from "../constants/familySampleData";

function generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

type NewPersonInput = {
    fullName: string;
    gender: Gender;
    birthYear?: number;
};

type EditPersonInput = {
    fullName: string;
    gender: Gender;
    birthYear?: number;
    deathYear?: number;
};

type FamilyState = {
    persons: Person[];
    families: Family[];
    rootFamilyId: string;
    addChildToFamily: (familyId: string, data: NewPersonInput) => void;
    addSpouse: (personId: string, data: NewPersonInput) => void;
    editPerson: (personId: string, data: EditPersonInput) => void;
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
    persons: SAMPLE_PERSONS,
    families: SAMPLE_FAMILIES,
    rootFamilyId: ROOT_FAMILY_ID,

    addChildToFamily: (familyId, data) => {
        const newPerson: Person = {
            id: generateId("p"),
            fullName: data.fullName,
            gender: data.gender,
            birthYear: data.birthYear,
            childOfFamilyId: familyId,
            spouseInFamilyIds: [],
        };
        set((state) => ({
            persons: [...state.persons, newPerson],
            families: state.families.map((f) =>
                f.id === familyId ? { ...f, childrenIds: [...f.childrenIds, newPerson.id] } : f
            ),
        }));
    },

    addSpouse: (personId, data) => {
        const person = get().persons.find((p) => p.id === personId);
        if (!person) return;

        const newFamilyId = generateId("f");
        const newSpouse: Person = {
            id: generateId("p"),
            fullName: data.fullName,
            gender: data.gender,
            birthYear: data.birthYear,
            spouseInFamilyIds: [newFamilyId],
        };
        const newFamily: Family = {
            id: newFamilyId,
            husbandId: person.gender === "male" ? person.id : newSpouse.id,
            wifeId: person.gender === "female" ? person.id : newSpouse.id,
            childrenIds: [],
        };

        set((state) => ({
            persons: [
                ...state.persons.map((p) =>
                    p.id === personId ? { ...p, spouseInFamilyIds: [...p.spouseInFamilyIds, newFamilyId] } : p
                ),
                newSpouse,
            ],
            families: [...state.families, newFamily],
        }));
    },

    editPerson: (personId, data) => {
        set((state) => ({
            persons: state.persons.map((p) =>
                p.id === personId
                    ? {
                        ...p,
                        fullName: data.fullName,
                        gender: data.gender,
                        birthYear: data.birthYear,
                        deathYear: data.deathYear,
                    }
                    : p
            ),
        }));
    },
}));