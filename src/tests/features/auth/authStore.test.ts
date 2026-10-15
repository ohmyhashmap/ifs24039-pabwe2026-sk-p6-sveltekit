import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import { getToken } from "../../../helpers/apiHelper";
import {
  authStore,
  loadProfile,
  login,
  logout,
  register,
  setProfile,
} from "../../../features/auth/states/authStore";
import { toasts } from "../../../states/toastStore";
import { fail, mockFetch, ok, resetStores, signIn, user } from "../../utils";

const messages = () => get(toasts).map((t) => `${t.type}:${t.message}`);

describe("authStore", () => {
  beforeEach(resetStores);

  it("loadProfile berhasil menyimpan profil", async () => {
    signIn(user({ id: 9 }));
    authStore.update((s) => ({ ...s, profile: null }));
    mockFetch({ "GET /users/me": ok("ok", { user: user({ id: 9 }) }) });
    expect(await loadProfile()).toBe(true);
    expect(get(authStore).profile?.id).toBe(9);
    expect(get(authStore).loading).toBe(false);
  });

  it("loadProfile gagal menghapus token dan sesi", async () => {
    signIn();
    mockFetch({ "GET /users/me": fail("Unauthenticated.") });
    expect(await loadProfile()).toBe(false);
    expect(getToken()).toBeNull();
    expect(get(authStore)).toEqual({ token: null, profile: null, loading: false });
  });

  it("loadProfile menganggap sukses tanpa data sebagai gagal", async () => {
    mockFetch({ "GET /users/me": ok("kosong") });
    expect(await loadProfile()).toBe(false);
  });

  it("login berhasil menyimpan token lalu memuat profil", async () => {
    mockFetch({
      "POST /auth/login": ok("Berhasil login", { user: user(), token: "1|abc" }),
      "GET /users/me": ok("ok", { user: user() }),
    });
    expect(await login("testing@delcom.org", "123456")).toBe(true);
    expect(getToken()).toBe("1|abc");
    expect(get(authStore).token).toBe("1|abc");
    expect(get(authStore).profile?.email).toBe("testing@delcom.org");
    expect(messages()).toEqual(["success:Berhasil login"]);
  });

  it("login gagal menampilkan pesan server", async () => {
    mockFetch({ "POST /auth/login": fail("Kredensial akun tidak ditemukan") });
    expect(await login("a@b.c", "x")).toBe(false);
    expect(get(authStore).loading).toBe(false);
    expect(messages()).toEqual(["error:Kredensial akun tidak ditemukan"]);
  });

  it("login sukses tanpa data dianggap gagal", async () => {
    mockFetch({ "POST /auth/login": ok("aneh") });
    expect(await login("a@b.c", "x")).toBe(false);
    expect(getToken()).toBeNull();
  });

  it("login gagal bila profil tidak dapat dimuat", async () => {
    mockFetch({
      "POST /auth/login": ok("Berhasil login", { user: user(), token: "1|abc" }),
      "GET /users/me": fail("Unauthenticated."),
    });
    expect(await login("a@b.c", "x")).toBe(false);
    expect(messages()).toEqual(["error:Gagal memuat profil pengguna"]);
    expect(getToken()).toBeNull();
  });

  it("register berhasil dan gagal", async () => {
    mockFetch({ "POST /auth/register": ok("Berhasil melakukan pendaftaran") });
    expect(await register("A", "a@b.c", "123456")).toBe(true);
    mockFetch({ "POST /auth/register": fail("Data tidak valid", { email: ["Email sudah dipakai"] }) });
    expect(await register("A", "a@b.c", "123456")).toBe(false);
    expect(messages()).toEqual([
      "success:Berhasil melakukan pendaftaran",
      "error:Email sudah dipakai",
    ]);
    expect(get(authStore).loading).toBe(false);
  });

  it("logout menghapus sesi", async () => {
    signIn();
    mockFetch({ "POST /auth/logout": ok("Berhasil logout") });
    await logout();
    expect(getToken()).toBeNull();
    expect(get(authStore)).toEqual({ token: null, profile: null, loading: false });
    expect(messages()).toEqual(["info:Anda telah keluar"]);
  });

  it("setProfile menimpa profil", () => {
    setProfile(user({ name: "Baru" }));
    expect(get(authStore).profile?.name).toBe("Baru");
  });
});
