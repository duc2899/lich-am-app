import { create } from "zustand";

/**
 * LƯU Ý QUAN TRỌNG: đây là hệ thống auth GIẢ LẬP, chạy hoàn toàn local (Zustand, chỉ ở RAM).
 * Không có backend/server thật, không mã hoá mật khẩu, dữ liệu mất khi tắt app.
 * Mục đích: dựng đúng luồng UI/UX (đăng ký, đăng nhập, phân biệt lỗi email/mật khẩu) để
 * test được ngay. Khi làm thật, cần thay bằng backend thật (Firebase Auth, Supabase, API riêng...)
 * và không bao giờ lưu mật khẩu dạng thường như thế này.
 */

type MockUser = {
  email: string;
  password: string;
  name: string;
  emailVerified: boolean;
  marketingOptIn: boolean;
};
type CurrentUser = { email: string; name: string; emailVerified: boolean };

type LoginError = "email_not_found" | "wrong_password";

type AuthState = {
  users: MockUser[];
  currentUser: CurrentUser | null;
  lastAuthenticatedEmail: string | null;
  // Chỉ cần email + password -- tối thiểu hoá field để giảm friction lúc đăng ký.
  // Tên hiển thị tạm suy ra từ email, có thể cho sửa sau trong màn hồ sơ.
  register: (
    email: string,
    password: string,
    marketingOptIn: boolean,
  ) => { success: boolean; error?: string };
  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: LoginError };
  loginWithBiometric: () => { success: boolean };
  logout: () => void;
  verifyEmail: () => void; // giả lập bấm vào link xác minh trong email
};

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  currentUser: null,
  lastAuthenticatedEmail: null,

  register: (email, password, marketingOptIn) => {
    const exists = get().users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (exists) return { success: false, error: "Email này đã được đăng ký" };

    const name = email.split("@")[0];
    const newUser: MockUser = {
      email,
      password,
      name,
      emailVerified: false,
      marketingOptIn,
    };
    set((state) => ({
      users: [...state.users, newUser],
      currentUser: { email, name, emailVerified: false },
      lastAuthenticatedEmail: email,
    }));
    return { success: true };
  },

  login: (email, password) => {
    const user = get().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) return { success: false, error: "email_not_found" };
    if (user.password !== password)
      return { success: false, error: "wrong_password" };

    set({
      currentUser: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      lastAuthenticatedEmail: user.email,
    });
    return { success: true };
  },

  // Sinh trắc học thay thế mật khẩu -- chỉ dùng được nếu trước đó đã đăng nhập bằng mật khẩu
  // thành công ít nhất 1 lần trong phiên hiện tại (lastAuthenticatedEmail được ghi nhớ).
  loginWithBiometric: () => {
    const email = get().lastAuthenticatedEmail;
    if (!email) return { success: false };
    const user = get().users.find((u) => u.email === email);
    if (!user) return { success: false };

    set({
      currentUser: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
    return { success: true };
  },

  verifyEmail: () => {
    const email = get().currentUser?.email;
    if (!email) return;
    set((state) => ({
      users: state.users.map((u) =>
        u.email === email ? { ...u, emailVerified: true } : u,
      ),
      currentUser: state.currentUser
        ? { ...state.currentUser, emailVerified: true }
        : null,
    }));
  },

  logout: () => set({ currentUser: null }),
}));
