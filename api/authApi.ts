import { API_BASE_URL } from "@api/apiConfig";

export type AuthUser = { id: string; email: string; name: string };

export type AuthApiResult =
  | { success: true; token: string; user: AuthUser }
  | { success: false; message: string };

async function postJson(path: string, body: object): Promise<AuthApiResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Có lỗi xảy ra, vui lòng thử lại",
      };
    }

    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    console.log(`Lỗi gọi ${path}:`, error);
    return {
      success: false,
      message:
        "Không kết nối được server. Kiểm tra mạng và IP trong apiConfig.ts.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function registerRequest(
  email: string,
  password: string,
  name?: string,
): Promise<AuthApiResult> {
  return postJson("/api/auth/register", { email, password, name });
}

export function loginRequest(
  email: string,
  password: string,
): Promise<AuthApiResult> {
  return postJson("/api/auth/login", { email, password });
}
