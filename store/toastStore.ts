import { create } from "zustand";

export type ToastType = "success" | "warning" | "error";

type ToastState = {
  message: string | null;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "success",
  showToast: (message, type = "success") => set({ message, type }),
  hideToast: () => set({ message: null }),
}));
