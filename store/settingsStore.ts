import { create } from "zustand";

type SettingsState = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
};

// LƯU Ý: toggle này hiện chỉ lưu trạng thái UI, CHƯA nối với logic gửi thông báo thật
// (chưa dùng expo-notifications để lên lịch nhắc). Cần triển khai riêng khi làm tính năng nhắc lịch.
export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
}));
