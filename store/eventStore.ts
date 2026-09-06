import { create } from "zustand";
import { EventCategoryKey } from "../constants/eventCategories";
import {
  scheduleSolarEventNotification,
  scheduleLunarEventNotification,
  cancelEventNotification,
} from "../utils/eventNotifications";

export type CalendarType = "solar" | "lunar";
export type RepeatType = "yearly" | "once";

export type EventItem = {
  id: string;
  title: string;
  category: EventCategoryKey;
  calendarType: CalendarType;
  day: number;
  month: number;
  year: number; // năm gốc (vd năm sinh) - dùng để tính "X tuổi" sau này
  repeatType: RepeatType;
  note?: string;
  notificationId?: string; // id thông báo local đã đặt (nếu có) -- dùng để huỷ khi xoá sự kiện
  // Chỉ dùng cho sự kiện ÂM LỊCH: thời điểm (ms) sự kiện thật sẽ diễn ra mà notificationId
  // hiện tại đang nhắm tới. Vì âm lịch không lặp lại được như dương lịch, cần biết mốc này
  // để phát hiện khi nào đã qua và cần tính lại + đặt lịch cho lần kế tiếp.
  notificationTargetTimestamp?: number;
};

type AddEventResult = { notificationScheduledAt: number | null };

type EventState = {
  events: EventItem[];
  addEvent: (
    event: Omit<EventItem, "id" | "notificationId" | "notificationTargetTimestamp">
  ) => Promise<AddEventResult>;
  removeEvent: (id: string) => Promise<void>;
  clearAllEvents: () => void;
  resyncLunarNotifications: () => Promise<void>;
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],

  addEvent: async (event) => {
    const id = Date.now().toString();
    const newEvent: EventItem = { ...event, id };
    let notificationScheduledAt: number | null = null;

    if (event.calendarType === "solar") {
      const notificationId = await scheduleSolarEventNotification(newEvent);
      if (notificationId) {
        newEvent.notificationId = notificationId;
        // Dương lịch lặp hàng năm không có "1 mốc thời gian cụ thể" duy nhất (lặp mãi),
        // nên chỉ báo chung là đã đặt thành công, không kèm mốc thời gian chính xác.
        notificationScheduledAt = -1; // -1 = đã đặt nhưng không có mốc thời gian cụ thể (lặp lại)
      }
    } else {
      const result = await scheduleLunarEventNotification(newEvent);
      if (result) {
        newEvent.notificationId = result.notificationId;
        newEvent.notificationTargetTimestamp = result.targetTimestamp;
        notificationScheduledAt = result.targetTimestamp;
      }
    }

    set((state) => ({ events: [...state.events, newEvent] }));
    return { notificationScheduledAt };
  },

  removeEvent: async (id) => {
    const event = get().events.find((e) => e.id === id);
    if (event?.notificationId) {
      await cancelEventNotification(event.notificationId);
    }
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
  },

  clearAllEvents: () => set({ events: [] }),

  /**
   * Chạy mỗi khi mở app (xem app/_layout.tsx): rà qua toàn bộ sự kiện ÂM LỊCH lặp hàng năm,
   * nếu lần diễn ra mà thông báo hiện tại đang nhắm tới đã QUA rồi (đã bắn xong hoặc bỏ lỡ),
   * tự tính lại cho lần kế tiếp và đặt lịch mới. Sự kiện dương lịch không cần việc này vì
   * đã dùng trigger lặp lại hàng năm có sẵn của hệ thống, tự động mãi mãi không cần can thiệp.
   */
  resyncLunarNotifications: async () => {
    const events = get().events;
    const updated: EventItem[] = [];
    let hasChange = false;

    for (const event of events) {
      const needsResync =
        event.calendarType === "lunar" &&
        event.repeatType === "yearly" &&
        (!event.notificationTargetTimestamp || event.notificationTargetTimestamp <= Date.now());

      if (!needsResync) {
        updated.push(event);
        continue;
      }

      if (event.notificationId) {
        await cancelEventNotification(event.notificationId);
      }
      const result = await scheduleLunarEventNotification(event);
      updated.push({
        ...event,
        notificationId: result?.notificationId,
        notificationTargetTimestamp: result?.targetTimestamp,
      });
      hasChange = true;
    }

    if (hasChange) {
      set({ events: updated });
    }
  },
}));