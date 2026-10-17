import { describe, expect, it } from "vitest";
import { mockPageState, mockPageStore, updateMockPage } from "../pageState.svelte";

describe("mock page state", () => {
  it("updates reactive page state and publishes the same snapshot to the store", () => {
    const initial = {
      url: mockPageState.url,
      params: mockPageState.params,
      route: mockPageState.route,
      status: mockPageState.status,
      error: mockPageState.error,
      data: mockPageState.data,
      form: mockPageState.form,
    };
    const next = {
      url: new URL("http://localhost/courses/3"),
      params: { id: "3" },
      status: 200,
    };
    let storeValue: typeof mockPageState | undefined;
    const unsubscribe = mockPageStore.subscribe((value) => {
      storeValue = value;
    });

    updateMockPage(next);

    expect(mockPageState.url).toEqual(next.url);
    expect(mockPageState.params).toEqual(next.params);
    expect(mockPageState.status).toBe(next.status);
    expect(storeValue).toMatchObject(next);

    updateMockPage(initial);
    unsubscribe();
  });
});
