import { API_BASE_URL } from "@api/apiConfig";

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkServerConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/health`, 5000);

    if (!response.ok) {
      return {
        success: false,
        message: `Server phản hồi lỗi: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, message: data.message ?? "Kết nối thành công" };
  } catch (error) {
    console.log("checkServerConnection lỗi thật:", error);
    return {
      success: false,
      message:
        "Không kết nối được server. Kiểm tra: đã sửa đúng IP trong apiConfig.ts chưa, điện thoại và máy tính có cùng WiFi không, server đã chạy chưa.",
    };
  }
}
