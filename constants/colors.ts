export type ThemeColors = {
  background: string; // nền chính của màn hình
  surface: string; // nền của card/box nổi lên trên background
  text: string; // chữ chính
  textSecondary: string; // chữ phụ, mô tả
  border: string; // viền, đường phân cách
  primary: string; // màu nhấn chính (nút, link) - xanh dương
  accent: string; // màu nhấn phụ - vàng đồng (đặc trưng của app)
  danger: string; // đỏ - cảnh báo, xoá
  success: string; // xanh lá - thành công
};

export const LightColors: ThemeColors = {
  background: "#F2F2F7",
  surface: "#FFFFFF",
  text: "#222222",
  textSecondary: "#888888",
  border: "#E5E5E5",
  primary: "#4A90D9",
  accent: "#D9A441",
  danger: "#D9364A",
  success: "#2E8B57",
};

export const DarkColors: ThemeColors = {
  background: "#121212",
  surface: "#1E1E1E",
  text: "#F2F2F2",
  textSecondary: "#A0A0A0",
  border: "#3A3A3C",
  primary: "#5AA0E8", // sáng hơn bản light 1 chút để đủ tương phản trên nền tối
  accent: "#E5C368",
  danger: "#FF6B6B",
  success: "#4CD37D",
};
