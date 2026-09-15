export function getWesternZodiacSign(day: number, month: number): string {
    const md = month * 100 + day;

    if (md >= 321 && md <= 419) return "Bạch Dương";
    if (md >= 420 && md <= 520) return "Kim Ngưu";
    if (md >= 521 && md <= 620) return "Song Tử";
    if (md >= 621 && md <= 722) return "Cự Giải";
    if (md >= 723 && md <= 822) return "Sư Tử";
    if (md >= 823 && md <= 922) return "Xử Nữ";
    if (md >= 923 && md <= 1022) return "Thiên Bình";
    if (md >= 1023 && md <= 1121) return "Bọ Cạp";
    if (md >= 1122 && md <= 1221) return "Nhân Mã";
    if (md >= 1222 || md <= 119) return "Ma Kết";
    if (md >= 120 && md <= 218) return "Bảo Bình";
    return "Song Ngư";
}