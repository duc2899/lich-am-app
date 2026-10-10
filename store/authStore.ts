import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { registerRequest, loginRequest, AuthUser } from "@api/authApi";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

type LoginErrorType = "email_not_found" | "wrong_password" | "other";

type AuthState = {
  token: string | null;
  currentUser: AuthUser | null;
  isHydrated: boolean; // đã đọc xong phiên lưu sẵn trong AsyncStorage lúc mở app chưa

  // Đọc phiên đăng nhập đã lưu (nếu có) ngay lúc mở app -- gọi 1 lần trong app/_layout.tsx
  hydrate: () => Promise<void>;

  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    message?: string;
    errorType?: LoginErrorType;
  }>;

  // KHÔNG gọi lại server -- chỉ dùng Face ID/vân tay để MỞ LẠI phiên đã đăng nhập từ trước
  // (token vẫn còn lưu trong AsyncStorage). Đúng bản chất "mở khoá nhanh", không phải
  // "đăng nhập lại từ đầu bằng sinh trắc học" (điều đó không có ý nghĩa bảo mật thật).
  loginWithBiometric: () => Promise<{ success: boolean; message?: string }>;

  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  currentUser: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (token && userJson) {
        set({ token, currentUser: JSON.parse(userJson) as AuthUser });
      }
    } catch (error) {
      console.log("Lỗi đọc phiên đăng nhập đã lưu:", error);
    } finally {
      set({ isHydrated: true });
    }
  },

  register: async (email, password, name) => {
    const result = await registerRequest(email, password, name);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    set({ token: result.token, currentUser: result.user });
    return { success: true };
  },

  login: async (email, password) => {
    const result = await loginRequest(email, password);
    if (!result.success) {
      let errorType: LoginErrorType = "other";
      if (result.message.includes("chưa được đăng ký"))
        errorType = "email_not_found";
      else if (result.message.includes("Sai mật khẩu"))
        errorType = "wrong_password";
      return { success: false, message: result.message, errorType };
    }

    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    set({ token: result.token, currentUser: result.user });
    return { success: true };
  },

  loginWithBiometric: async () => {
    const { token, currentUser } = get();
    if (!token || !currentUser) {
      return {
        success: false,
        message: "Chưa có phiên đăng nhập nào được lưu trên máy này",
      };
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      return {
        success: false,
        message: "Thiết bị chưa cài đặt Face ID / vân tay",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Xác thực để đăng nhập",
      cancelLabel: "Huỷ",
    });

    return { success: result.success };
  },

  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ token: null, currentUser: null });
  },
}));
