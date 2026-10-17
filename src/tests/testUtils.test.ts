import { describe, expect, it } from "vitest";
import { flush, mockFetch } from "./utils";

describe("test utilities", () => {
  it("returns a failure response and records defaults for an unmatched fetch route", async () => {
    const { fn, calls } = mockFetch({});

    const response = await fn("http://localhost/api/v1/missing");

    expect(await response.json()).toEqual({
      status: "fail",
      message: "Tidak ada mock untuk GET /missing",
    });
    expect(calls).toEqual([
      {
        method: "GET",
        path: "/missing",
        query: "",
        body: undefined,
        headers: {},
      },
    ]);
  });

  it("resolves after pending tasks have had a chance to run", async () => {
    await expect(flush()).resolves.toBeUndefined();
  });
});
