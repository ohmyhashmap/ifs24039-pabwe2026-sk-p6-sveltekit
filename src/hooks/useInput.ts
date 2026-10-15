import { writable, type Writable } from "svelte/store";

export interface UseInput {
  value: Writable<string>;
  onInput: (event: Event) => void;
  set: (next: string) => void;
  reset: () => void;
}

/** Hook sederhana untuk mengelola nilai input formulir sebagai store. */
export function useInput(initial = ""): UseInput {
  const value = writable(initial);
  return {
    value,
    onInput: (event) => value.set((event.target as HTMLInputElement).value),
    set: (next) => value.set(next),
    reset: () => value.set(initial),
  };
}
