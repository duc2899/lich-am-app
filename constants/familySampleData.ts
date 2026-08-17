import { Person, Family } from "../types/family";

// Cấu trúc mẫu 3 thế hệ, có rẽ nhánh:
// Đời 1: Nguyễn Văn Ông + Trần Thị Bà -> 2 con (Cha, Cô)
// Đời 2: Nguyễn Văn Cha lấy Lê Thị Mẹ -> 2 con | Nguyễn Thị Cô lấy Phạm Văn Chồng -> 1 con
// Đời 3: các cháu (chưa có gia đình riêng)

export const SAMPLE_PERSONS: Person[] = [
    { id: "p1", fullName: "Nguyễn Văn Ông", gender: "male", birthYear: 1945, deathYear: 2020, spouseInFamilyIds: ["f1"] },
    { id: "p2", fullName: "Trần Thị Bà", gender: "female", birthYear: 1948, spouseInFamilyIds: ["f1"] },

    { id: "p3", fullName: "Nguyễn Văn Cha", gender: "male", birthYear: 1970, childOfFamilyId: "f1", spouseInFamilyIds: ["f2"] },
    { id: "p4", fullName: "Nguyễn Thị Cô", gender: "female", birthYear: 1973, childOfFamilyId: "f1", spouseInFamilyIds: ["f3"] },

    { id: "p5", fullName: "Lê Thị Mẹ", gender: "female", birthYear: 1972, spouseInFamilyIds: ["f2"] },
    { id: "p6", fullName: "Phạm Văn Chồng", gender: "male", birthYear: 1971, spouseInFamilyIds: ["f3"] },

    { id: "p7", fullName: "Nguyễn Văn Tôi", gender: "male", birthYear: 1998, childOfFamilyId: "f2", spouseInFamilyIds: [] },
    { id: "p8", fullName: "Nguyễn Thị Em", gender: "female", birthYear: 2001, childOfFamilyId: "f2", spouseInFamilyIds: [] },
    { id: "p9", fullName: "Phạm Văn Con", gender: "male", birthYear: 2000, childOfFamilyId: "f3", spouseInFamilyIds: [] },
];

export const SAMPLE_FAMILIES: Family[] = [
    { id: "f1", husbandId: "p1", wifeId: "p2", childrenIds: ["p3", "p4"] },
    { id: "f2", husbandId: "p3", wifeId: "p5", childrenIds: ["p7", "p8"] },
    { id: "f3", husbandId: "p6", wifeId: "p4", childrenIds: ["p9"] },
];

export const ROOT_FAMILY_ID = "f1";