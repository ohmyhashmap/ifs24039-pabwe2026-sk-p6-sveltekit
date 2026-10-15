import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiHelper,
  clearToken,
  getBaseUrl,
  getErrorMessage,
  getToken,
  setToken,
  TOKEN_KEY,
} from "../../helpers/apiHelper";
import { fail, mockFetch, ok } from "../utils";

describe("token & base url", () => {
  it("membaca base url dari env dan menghapus garis miring akhir", () => {
    expect(getBaseUrl()).toBe("https://open-api.delcom.org/api/v1");
    vi.stubEnv("VITE_DELCOM_BASEURL", "https://x.test/api/");
    expect(getBaseUrl()).toBe("https://x.test/api");
  });

  it("menghasilkan string kosong bila env tidak diatur", () => {
    vi.stubEnv("VITE_DELCOM_BASEURL", undefined as unknown as string);
    expect(getBaseUrl()).toBe("");
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe("apiHelper", () => {
  afterEach(() => localStorage.clear());

  it("mengirim GET dengan header Authorization bila token ada", async () => {
    setToken("tok");
    const { calls, fn } = mockFetch({ "GET /courses": ok("Berhasil", { courses: [] }) });
    const res = await apiHelper.get("/courses");
    expect(res.status).toBe("success");
    expect(fn.mock.calls[0][0]).toBe("https://open-api.delcom.org/api/v1/courses");
    expect(calls[0].headers).toEqual({ Accept: "application/json", Authorization: "Bearer tok" });
    expect(calls[0].body).toBeUndefined();
  });

  it("tidak mengirim Authorization tanpa token atau saat auth=false", async () => {
    const { calls } = mockFetch({ "POST /auth/login": ok() });
    await apiHelper.post("/auth/login", { body: { a: 1 } });
    setToken("tok");
    await apiHelper.post("/auth/login", { body: { a: 1 }, auth: false });
    expect(calls[0].headers.Authorization).toBeUndefined();
    expect(calls[1].headers.Authorization).toBeUndefined();
    expect(calls[0].headers["Content-Type"]).toBe("application/json");
    expect(calls[0].body).toEqual({ a: 1 });
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const { calls } = mockFetch({ "POST /upload": ok() });
    const form = new FormData();
    form.append("cover", new File(["x"], "c.png"));
    await apiHelper.post("/upload", { form });
    expect(calls[0].headers["Content-Type"]).toBeUndefined();
    expect(calls[0].body).toBeInstanceOf(FormData);
  });

  it("menyusun query string dan mengabaikan nilai undefined", async () => {
    const { calls } = mockFetch({ "GET /courses": ok() });
    await apiHelper.get("/courses", { query: { is_me: 1, skip: undefined } });
    await apiHelper.get("/courses", { query: { is_me: undefined } });
    expect(calls[0].query).toBe("?is_me=1");
    expect(calls[1].query).toBe("");
  });

  it("menyediakan put dan delete", async () => {
    const { calls } = mockFetch({ "PUT /a": ok(), "DELETE /a": ok() });
    await apiHelper.put("/a", { body: {} });
    await apiHelper.delete("/a");
    expect(calls.map((c) => c.method)).toEqual(["PUT", "DELETE"]);
  });

  it("mengembalikan galat bila respons bukan JSON valid", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 502 })));
    expect(await apiHelper.get("/x")).toEqual({
      status: "error",
      message: "Respons server tidak valid (502)",
    });
  });

  it("mengembalikan galat bila JSON tidak memiliki status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ hello: 1 }), { status: 200 })));
    expect((await apiHelper.get("/x")).status).toBe("error");
  });

  it("mengembalikan galat jaringan bila fetch melempar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("down"))));
    expect(await apiHelper.get("/x")).toEqual({
      status: "error",
      message: "Tidak dapat terhubung ke server",
    });
  });
});

describe("getErrorMessage", () => {
  it("memakai pesan validasi pertama", () => {
    expect(getErrorMessage(fail("Data tidak valid", { title: ["Judul wajib diisi"] }) as any)).toBe(
      "Judul wajib diisi",
    );
  });
  it("memakai pesan umum bila tidak ada data", () => {
    expect(getErrorMessage(fail("Kredensial akun tidak ditemukan") as any)).toBe(
      "Kredensial akun tidak ditemukan",
    );
  });
  it("memakai pesan umum bila data tidak berisi string", () => {
    expect(getErrorMessage(fail("Gagal", { items: [1, 2] }) as any)).toBe("Gagal");
  });
});
