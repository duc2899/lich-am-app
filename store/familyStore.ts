import { create } from "zustand";
import { Person, Family, Gender } from "../types/family";

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
  rootPersonId: string | null;
  mePersonId: string | null;
  createRootPerson: (data: NewPersonInput) => void;
  addChildToFamily: (familyId: string, data: NewPersonInput) => void;
  addSpouse: (personId: string, data: NewPersonInput) => void;
  editPerson: (personId: string, data: EditPersonInput) => void;
  setMePersonId: (personId: string | null) => void;
  deletePerson: (personId: string) => void;
  clearAll: () => void;
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  persons: [],
  families: [],
  rootPersonId: null,
  mePersonId: null,

  createRootPerson: (data) => {
    const newPerson: Person = {
      id: generateId("p"),
      fullName: data.fullName,
      gender: data.gender,
      birthYear: data.birthYear,
      spouseInFamilyIds: [],
    };
    set({
      persons: [newPerson],
      families: [],
      rootPersonId: newPerson.id,
      mePersonId: null,
    });
  },

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
        f.id === familyId
          ? { ...f, childrenIds: [...f.childrenIds, newPerson.id] }
          : f,
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
          p.id === personId
            ? { ...p, spouseInFamilyIds: [...p.spouseInFamilyIds, newFamilyId] }
            : p,
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
          : p,
      ),
    }));
  },

  setMePersonId: (personId) => {
    set({ mePersonId: personId });
  },

  deletePerson: (personId) => {
    set((state) => {
      const personMap = new Map(state.persons.map((p) => [p.id, p]));
      const familyMap = new Map(state.families.map((f) => [f.id, f]));

      // Gom toàn bộ id cần xoá: người này + mọi con/cháu/chắt... qua mọi cuộc hôn nhân của họ
      const idsToDelete = new Set<string>();
      function collectDescendants(id: string) {
        if (idsToDelete.has(id)) return;
        idsToDelete.add(id);
        const person = personMap.get(id);
        if (!person) return;
        for (const famId of person.spouseInFamilyIds) {
          const fam = familyMap.get(famId);
          if (!fam) continue;
          for (const childId of fam.childrenIds) {
            collectDescendants(childId);
          }
        }
      }
      collectDescendants(personId);

      const persons = state.persons.filter((p) => !idsToDelete.has(p.id));

      const families = state.families
        .map((f) => ({
          ...f,
          husbandId:
            f.husbandId && idsToDelete.has(f.husbandId)
              ? undefined
              : f.husbandId,
          wifeId: f.wifeId && idsToDelete.has(f.wifeId) ? undefined : f.wifeId,
          childrenIds: f.childrenIds.filter((cid) => !idsToDelete.has(cid)),
        }))
        // Bỏ hẳn "hôn nhân" nào không còn ý nghĩa: chỉ còn 1 vế (thiếu vợ hoặc chồng) VÀ không có con nào.
        // Nhờ vậy nếu 1 người có 2 vợ mà xoá đi 1 vợ (gia đình đó hết vợ, hết con) -> hôn nhân đó
        // biến mất hẳn khỏi spouseInFamilyIds của người chồng, tự động rớt về hiển thị 1 vợ bình thường
        // thay vì tiếp tục vẽ rẽ nhánh cho 1 nhánh rỗng.
        .filter((f) => f.childrenIds.length > 0 || (f.husbandId && f.wifeId));

      // Dọn tham chiếu family đã bị xoá khỏi những người còn sống sót (an toàn dữ liệu)
      const survivingFamilyIds = new Set(families.map((f) => f.id));
      const cleanedPersons = persons.map((p) => ({
        ...p,
        spouseInFamilyIds: p.spouseInFamilyIds.filter((fid) =>
          survivingFamilyIds.has(fid),
        ),
        childOfFamilyId:
          p.childOfFamilyId && survivingFamilyIds.has(p.childOfFamilyId)
            ? p.childOfFamilyId
            : undefined,
      }));

      return {
        persons: cleanedPersons,
        families,
        mePersonId:
          state.mePersonId && idsToDelete.has(state.mePersonId)
            ? null
            : state.mePersonId,
        rootPersonId:
          state.rootPersonId && idsToDelete.has(state.rootPersonId)
            ? null
            : state.rootPersonId,
      };
    });
  },

  clearAll: () => {
    set({ persons: [], families: [], rootPersonId: null, mePersonId: null });
  },
}));
