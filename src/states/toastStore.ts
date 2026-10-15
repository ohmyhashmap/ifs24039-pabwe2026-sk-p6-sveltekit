import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export const toasts = writable<Toast[]>([]);

let sequence = 0;

export function dismiss(id: number): void {
  toasts.update((list) => list.filter((toast) => toast.id !== id));
}

export function notify(type: ToastType, message: string, duration = 4000): number {
  const id = ++sequence;
  toasts.update((list) => [...list, { id, type, message }]);
  setTimeout(() => dismiss(id), duration);
  return id;
}
