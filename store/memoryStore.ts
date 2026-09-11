import { create } from "zustand";

export type MemoryItem = {
    id: string;
    imageUri: string; // demo: URI ảnh local từ thư viện máy (chưa có server lưu trữ thật)
    title: string;
    day?: number;
    month?: number;
    year?: number;
    description?: string;
    createdAt: number; // thời điểm thêm vào, dùng hiển thị "Đã thêm vào ..."
};

type MemoryState = {
    items: MemoryItem[];
    addMemory: (item: Omit<MemoryItem, "id" | "createdAt">) => void;
    updateMemory: (id: string, updates: Omit<MemoryItem, "id" | "createdAt">) => void;
    removeMemory: (id: string) => void;
};

export const useMemoryStore = create<MemoryState>((set) => ({
    items: [],

    addMemory: (item) =>
        set((state) => ({
            items: [...state.items, { ...item, id: Date.now().toString(), createdAt: Date.now() }],
        })),

    updateMemory: (id, updates) =>
        set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

    removeMemory: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));