import { describe, expect, it, vi } from "vitest";
import { handle } from "../hooks.server";

describe("server hook", () => {
  it("menonaktifkan cache dan ETag pada /auth/login", async () => {
    const originalResponse = new Response("Halaman login", {
      headers: { etag: '"cached-etag"' },
    });
    const resolve = vi.fn(async () => originalResponse);

    const response = await handle({
      event: { url: new URL("http://localhost/auth/login") },
      resolve,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("etag")).toBeNull();
  });

  it("tidak mengubah cache untuk rute lain", async () => {
    const originalResponse = new Response("Halaman lain");
    const resolve = vi.fn(async () => originalResponse);

    const response = await handle({
      event: { url: new URL("http://localhost/") },
      resolve,
    });

    expect(response).toBe(originalResponse);
  });
});
