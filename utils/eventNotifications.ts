import * as Notifications from "expo-notifications";
import type { EventItem } from "../store/eventStore";
import { getCategoryByKey } from "../constants/eventCategories";

const REMINDER_DAYS_BEFORE = 3;
const NOTIFY_HOUR = 9; // 9h sáng
const NOTIFY_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true, // hiện dạng banner khi app đang mở (thay cho shouldShowAlert cũ)
    shouldShowList: true, // hiện trong danh sách/trung tâm thông báo của hệ điều hành
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.status === "granted";
}

/**
 * Đặt lịch thông báo báo trước 3 ngày cho 1 sự kiện DƯƠNG LỊCH.
 * - "yearly": dùng trigger lặp lại hàng năm theo tháng/ngày có sẵn của expo-notifications
 *   (không cần tự tính lại mỗi năm, hệ thống tự lo).
 * - "once": tính đúng 1 lần theo ngày/tháng/năm cụ thể; nếu ngày báo đã qua thì bỏ qua.
 *
 * DEMO: chỉ hỗ trợ sự kiện dương lịch. Sự kiện âm lịch cần tính lại ngày dương mỗi năm
 * (do lệch ngày theo từng năm), sẽ làm ở bước sau.
 */
export async function scheduleSolarEventNotification(
  event: EventItem,
): Promise<string | null> {
  if (event.calendarType !== "solar") return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const categoryLabel = getCategoryByKey(event.category).label;

  // Lùi lại 3 ngày để tính ra ngày/tháng cần báo (dùng năm giả định chỉ để tính toán,
  // JS Date tự xử lý đúng khi lùi qua đầu tháng/đầu năm).
  const base = new Date(2001, event.month - 1, event.day);
  base.setDate(base.getDate() - REMINDER_DAYS_BEFORE);
  const notifyMonth = base.getMonth() + 1;
  const notifyDay = base.getDate();

  if (event.repeatType === "yearly") {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Sắp tới: ${event.title}`,
        body: `Còn ${REMINDER_DAYS_BEFORE} ngày nữa là đến ${event.day}/${event.month} (${categoryLabel})`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        month: notifyMonth,
        day: notifyDay,
        hour: NOTIFY_HOUR,
        minute: NOTIFY_MINUTE,
        repeats: true,
      },
    });
    return id;
  }

  // repeatType === "once"
  const eventDate = new Date(
    event.year,
    event.month - 1,
    event.day,
    NOTIFY_HOUR,
    NOTIFY_MINUTE,
  );
  const notifyDate = new Date(eventDate);
  notifyDate.setDate(notifyDate.getDate() - REMINDER_DAYS_BEFORE);

  if (notifyDate.getTime() <= Date.now()) {
    return null; // ngày báo đã qua -> không đặt nữa
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Sắp tới: ${event.title}`,
      body: `Còn ${REMINDER_DAYS_BEFORE} ngày nữa là đến ${event.day}/${event.month}/${event.year} (${categoryLabel})`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyDate,
    },
  });
  return id;
}

export async function cancelEventNotification(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Thông báo có thể đã tự bắn xong và không còn tồn tại -- bỏ qua lỗi này
  }
}

export async function cancelAllEventNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * CHỈ DÙNG ĐỂ TEST: bắn 1 thông báo sau đúng `seconds` giây, không liên quan sự kiện thật nào.
 * Giúp kiểm tra nhanh xem quyền + pipeline thông báo có hoạt động không, khỏi phải đợi
 * thật 3 ngày hay chỉnh ngày giờ máy.
 */
export async function scheduleTestNotification(
  seconds: number = 10,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Test thông báo",
      body: `Thông báo thử nghiệm, bắn sau ${seconds} giây kể từ lúc bấm.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
  return id;
}
