import { get } from "svelte/store";
import { describe, expect, it } from "vitest";
import { useInput } from "../../hooks/useInput";

describe("useInput", () => {
  it("memakai nilai awal kosong secara default", () => {
    expect(get(useInput().value)).toBe("");
  });

  it("memperbarui nilai dari event input, set, dan reset ke nilai awal", () => {
    const input = useInput("awal");
    expect(get(input.value)).toBe("awal");

    const el = document.createElement("input");
    el.value = "diketik";
    input.onInput({ target: el } as unknown as Event);
    expect(get(input.value)).toBe("diketik");

    input.set("langsung");
    expect(get(input.value)).toBe("langsung");

    input.reset();
    expect(get(input.value)).toBe("awal");
  });
});
