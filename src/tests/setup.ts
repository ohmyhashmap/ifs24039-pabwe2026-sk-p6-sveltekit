import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

vi.mock("$app/navigation", () => ({ goto: vi.fn(() => Promise.resolve()) }));
vi.mock("$app/state", async () => await import("./pageMock.svelte"));

beforeEach(() => {
  localStorage.clear();
});
