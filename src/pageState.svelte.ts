import { untrack } from "svelte";
import { writable } from "svelte/store";

export const mockPageState = $state({
  url: new URL("http://localhost:3000/"),
  params: {} as Record<string, string>,
  route: { id: "/" },
  status: 200,
  error: null as any,
  data: {} as Record<string, any>,
  form: undefined as any,
});

export const mockPageStore = writable({ ...mockPageState });

export function updateMockPage(data: Partial<typeof mockPageState>) {
  untrack(() => Object.assign(mockPageState, data));
  mockPageStore.set({ ...mockPageState });
}
