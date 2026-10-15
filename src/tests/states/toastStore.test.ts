import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dismiss, notify, toasts } from "../../states/toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toasts.set([]);
  });
  afterEach(() => vi.useRealTimers());

  it("menambahkan toast dan menghapusnya otomatis", () => {
    const id = notify("success", "Halo");
    expect(get(toasts)).toEqual([{ id, type: "success", message: "Halo" }]);
    vi.advanceTimersByTime(3999);
    expect(get(toasts)).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(get(toasts)).toHaveLength(0);
  });

  it("mendukung durasi khusus dan dismiss manual", () => {
    const a = notify("error", "A", 100);
    const b = notify("info", "B");
    expect(a).not.toBe(b);
    dismiss(b);
    expect(get(toasts).map((t) => t.id)).toEqual([a]);
    vi.advanceTimersByTime(100);
    expect(get(toasts)).toEqual([]);
  });
});
