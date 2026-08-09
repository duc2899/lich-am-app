/**
 * Danh sách ngày lễ Việt Nam
 * - SOLAR_FESTIVALS: lễ theo dương lịch, key dạng "thang-ngay"
 * - LUNAR_FESTIVALS: lễ theo âm lịch, key dạng "thang-ngay"
 *
 * Muốn thêm/bớt lễ chỉ cần sửa 2 object bên dưới, không cần đụng vào UI.
 */

export const SOLAR_FESTIVALS: Record<string, string> = {
  "1-1": "Tết Dương Lịch",
  "2-14": "Lễ Tình Nhân",
  "3-8": "Quốc Tế Phụ Nữ",
  "4-30": "Giải Phóng Miền Nam",
  "5-1": "Quốc Tế Lao Động",
  "6-1": "Quốc Tế Thiếu Nhi",
  "9-2": "Quốc Khánh",
  "10-20": "Ngày Phụ Nữ Việt Nam",
  "11-20": "Ngày Nhà Giáo Việt Nam",
  "12-24": "Lễ Giáng Sinh (Đêm)",
  "12-25": "Lễ Giáng Sinh",
};

export const LUNAR_FESTIVALS: Record<string, string> = {
  "1-1": "Tết Nguyên Đán",
  "1-15": "Rằm Tháng Giêng",
  "3-3": "Tết Hàn Thực",
  "3-10": "Giỗ Tổ Hùng Vương",
  "4-15": "Lễ Phật Đản",
  "5-5": "Tết Đoan Ngọ",
  "7-15": "Lễ Vu Lan",
  "8-15": "Tết Trung Thu",
  "12-23": "Ông Công Ông Táo",
};

/**
 * Trả về tên lễ dương lịch tại ngày/tháng cho trước, hoặc null nếu không phải ngày lễ.
 */
export function getSolarFestival(month: number, day: number): string | null {
  return SOLAR_FESTIVALS[`${month}-${day}`] ?? null;
}

/**
 * Trả về tên lễ âm lịch tại ngày/tháng cho trước, hoặc null nếu không phải ngày lễ.
 * Không tính lễ nếu rơi vào tháng nhuận (isLeapMonth = true).
 */
export function getLunarFestival(
  month: number,
  day: number,
  isLeapMonth: boolean,
): string | null {
  if (isLeapMonth) return null;
  return LUNAR_FESTIVALS[`${month}-${day}`] ?? null;
}
