import { QUOTES, QuoteItem } from "../constants/quotes";

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Trả về câu cố định của 1 ngày cụ thể (mặc định là hôm nay).
 * Dựa theo số thứ tự ngày trong năm chia lấy dư theo tổng số câu -- vì vậy
 * cùng 1 ngày sẽ luôn ra cùng 1 câu (không đổi mỗi lần mở app), nhưng sẽ khác
 * nhau giữa các ngày, và tự lặp lại vòng khi hết danh sách.
 */
export function getQuoteOfTheDay(date: Date = new Date()): QuoteItem {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index];
}
