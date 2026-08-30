import { Person, Family } from "../types/family";

// Cấu trúc mẫu 3 thế hệ, có rẽ nhánh:
// Đời 1: Nguyễn Văn Ông + Trần Thị Bà -> 2 con (Cha, Cô)
// Đời 2: Nguyễn Văn Cha lấy Lê Thị Mẹ (vợ 1, 3 con) + Đặng Thị Hai (vợ 2, 1 con) -> test multiMarriage
//        Nguyễn Thị Cô lấy Phạm Văn Chồng -> 1 con
// Đời 3: các cháu (chưa có gia đình riêng)

export const SAMPLE_PERSONS: Person[] = [
  {
    id: "p1",
    fullName: "Nguyễn Văn Ông",
    gender: "male",
    birthYear: 1945,
    spouseInFamilyIds: ["f1"],
  },
  {
    id: "p2",
    fullName: "Trần Thị Bà",
    gender: "female",
    birthYear: 1948,
    spouseInFamilyIds: ["f1"],
  },

  {
    id: "p3",
    fullName: "Nguyễn Văn Cha",
    gender: "male",
    birthYear: 1970,
    childOfFamilyId: "f1",
    spouseInFamilyIds: ["f2", "f4"],
  },
  {
    id: "p4",
    fullName: "Nguyễn Thị Cô",
    gender: "female",
    birthYear: 1973,
    childOfFamilyId: "f1",
    spouseInFamilyIds: ["f3"],
  },

  {
    id: "p5",
    fullName: "Lê Thị Mẹ",
    gender: "female",
    birthYear: 1972,
    spouseInFamilyIds: ["f2"],
  },
  {
    id: "p6",
    fullName: "Phạm Văn Chồng",
    gender: "male",
    birthYear: 1971,
    spouseInFamilyIds: ["f3"],
  },

  {
    id: "p7",
    fullName: "Nguyễn Văn Tôi",
    gender: "male",
    birthYear: 1999,
    childOfFamilyId: "f2",
    spouseInFamilyIds: [],
  },
  {
    id: "p8",
    fullName: "Nguyễn Thị Em",
    gender: "female",
    birthYear: 1996,
    childOfFamilyId: "f2",
    spouseInFamilyIds: [],
  },
  {
    id: "p9",
    fullName: "Phạm Văn Con",
    gender: "male",
    birthYear: 2000,
    childOfFamilyId: "f3",
    spouseInFamilyIds: [],
  },
  {
    id: "p10",
    fullName: "Nguyễn Văn Út",
    gender: "male",
    birthYear: 2002,
    childOfFamilyId: "f2",
    spouseInFamilyIds: [],
  },

  // Vợ 2 của Nguyễn Văn Cha + con riêng
  {
    id: "p11",
    fullName: "Đặng Thị Hai",
    gender: "female",
    birthYear: 1978,
    spouseInFamilyIds: ["f4"],
  },
  {
    id: "p12",
    fullName: "Nguyễn Văn Ba",
    gender: "male",
    birthYear: 2005,
    childOfFamilyId: "f4",
    spouseInFamilyIds: [],
  },
];

export const SAMPLE_FAMILIES: Family[] = [
  { id: "f1", husbandId: "p1", wifeId: "p2", childrenIds: ["p3", "p4"] },
  { id: "f2", husbandId: "p3", wifeId: "p5", childrenIds: ["p8", "p7", "p10"] }, // p8 (gái, con đầu) -> p7 (trai, con thứ 2 = trưởng) -> p10 (trai, con thứ 3)
  { id: "f3", husbandId: "p6", wifeId: "p4", childrenIds: ["p9"] },
  { id: "f4", husbandId: "p3", wifeId: "p11", childrenIds: ["p12"] }, // gia đình thứ 2 của Nguyễn Văn Cha
];

export const ROOT_FAMILY_ID = "f1";
