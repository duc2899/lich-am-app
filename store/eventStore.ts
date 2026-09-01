import { create } from "zustand";
import { EventCategoryKey } from "../constants/eventCategories";
import {
  scheduleSolarEventNotification,
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
};

type EventState = {
  events: EventItem[];
  addEvent: (event: Omit<EventItem, "id" | "notificationId">) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  clearAllEvents: () => void;
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],

  addEvent: async (event) => {
    const id = Date.now().toString();
    const newEvent: EventItem = { ...event, id };

    // Demo: chỉ đặt thông báo thật cho sự kiện dương lịch (xem utils/eventNotifications.ts)
    const notificationId = await scheduleSolarEventNotification(newEvent);
    if (notificationId) newEvent.notificationId = notificationId;

    set((state) => ({ events: [...state.events, newEvent] }));
  },

  removeEvent: async (id) => {
    const event = get().events.find((e) => e.id === id);
    if (event?.notificationId) {
      await cancelEventNotification(event.notificationId);
    }
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
  },

  clearAllEvents: () => set({ events: [] }),
}));
