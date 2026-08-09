import { create } from "zustand";
import { EventCategoryKey } from "../constants/eventCategories";

export type CalendarType = "solar" | "lunar";
export type RepeatType = "yearly" | "once" | "none";

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
};

type EventState = {
  events: EventItem[];
  addEvent: (event: Omit<EventItem, "id">) => void;
  removeEvent: (id: string) => void;
};

export const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: Date.now().toString() }],
    })),
  removeEvent: (id) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
}));
