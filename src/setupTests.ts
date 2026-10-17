import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/svelte";
import { writable } from "svelte/store";
import { mockPageState, mockPageStore, updateMockPage } from "./pageState.svelte";

export { mockPageState, mockPageStore, updateMockPage };

afterEach(() => {
  cleanup();
});

if (typeof document !== "undefined") {
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null;
  }
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  }
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (typeof (globalThis as any).DELCOM_BASEURL === "undefined") {
  (globalThis as any).DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";
}

vi.mock("lucide-svelte", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>;
  const { default: TestIcon } = await import("./tests/TestIcon.svelte");
  const mocked: Record<string, any> = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = TestIcon;
  }
  return {
    ...actual,
    ...mocked,
    default: mocked,
  };
});

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (this: any, options: any) {
      let markdown = options?.initialValue || "";
      this.options = options;
      this.getMarkdown = vi.fn(() => markdown);
      this.setMarkdown = vi.fn((val: string) => {
        markdown = val;
      });
      this.destroy = vi.fn();
    }),
  };
});

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  return {
    default: vi.fn().mockImplementation(function (this: any, options: any) {
      let markdown = options?.initialValue || "";
      if (options?.el) {
        options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
      }
      this.options = options;
      this.setMarkdown = vi.fn((val: string) => {
        markdown = val;
        if (options?.el) {
          options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
        }
      });
      this.destroy = vi.fn();
    }),
  };
});

export const mockGoto = vi.fn(() => Promise.resolve());

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn(),
  pushState: vi.fn(),
  replaceState: vi.fn(),
}));

vi.mock("$app/state", () => ({
  page: mockPageState,
  navigating: null,
  updated: false,
}));

vi.mock("$app/stores", () => ({
  page: {
    subscribe: mockPageStore.subscribe,
  },
  navigating: writable(null),
  updated: writable(false),
}));
