export type EventCategoryKey =
  | "birthday"
  | "death_anniversary"
  | "anniversary"
  | "family_gathering"
  | "holiday"
  | "work"
  | "other";

export type EventCategory = {
  key: EventCategoryKey;
  label: string;
  icon: string;
};

export const EVENT_CATEGORIES: EventCategory[] = [
  { key: "birthday", label: "Sinh nhật", icon: "🎂" },
  { key: "death_anniversary", label: "Ngày giỗ", icon: "🕯️" },
  { key: "anniversary", label: "Kỷ niệm", icon: "💍" },
  { key: "family_gathering", label: "Họp mặt", icon: "👨‍👩‍👧‍👦" },
  { key: "holiday", label: "Lễ Tết", icon: "🎉" },
  { key: "work", label: "Công việc", icon: "💼" },
  { key: "other", label: "Khác", icon: "📌" },
];

export function getCategoryByKey(key: EventCategoryKey): EventCategory {
  return (
    EVENT_CATEGORIES.find((c) => c.key === key) ??
    EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]
  );
}
