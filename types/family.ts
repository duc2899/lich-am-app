export type Gender = "male" | "female";

export type Person = {
    id: string;
    fullName: string;
    gender: Gender;
    photoUri?: string; // ảnh đại diện (URI local từ thư viện máy, chưa có server lưu trữ thật)
    birthYear?: number;
    birthDay?: number; // không bắt buộc -- có thêm ngày/tháng thì mới quy đổi chính xác ra âm lịch
    birthMonth?: number;
    deathYear?: number;
    deathDay?: number;
    deathMonth?: number;
    childOfFamilyId?: string; // thuộc gia đình nào với tư cách là con
    spouseInFamilyIds: string[]; // các gia đình mà người này là vợ/chồng
    phone?: string;
    occupation?: string;
    currentAddress?: string;
    note?: string; // ghi chú/tiểu sử ngắn
};

export type Family = {
    id: string;
    husbandId?: string;
    wifeId?: string;
    childrenIds: string[]; // theo thứ tự sinh
};