export type Gender = "male" | "female";

export type Person = {
    id: string;
    fullName: string;
    gender: Gender;
    birthYear?: number;
    deathYear?: number;
    childOfFamilyId?: string; // thuộc gia đình nào với tư cách là con
    spouseInFamilyIds: string[]; // các gia đình mà người này là vợ/chồng
};

export type Family = {
    id: string;
    husbandId?: string;
    wifeId?: string;
    childrenIds: string[]; // theo thứ tự sinh
};