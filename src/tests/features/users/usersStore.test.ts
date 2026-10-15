import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import { authStore } from "../../../features/auth/states/authStore";
import {
  loadUsers,
  savePassword,
  savePhoto,
  saveProfile,
  usersStore,
} from "../../../features/users/states/usersStore";
import { toasts } from "../../../states/toastStore";
import { fail, mockFetch, ok, resetStores, signIn, user } from "../../utils";

const messages = () => get(toasts).map((t) => `${t.type}:${t.message}`);

describe("usersStore", () => {
  beforeEach(resetStores);

  it("loadUsers berhasil", async () => {
    mockFetch({ "GET /users": ok("ok", { users: [user(), user({ id: 2 })] }) });
    expect(await loadUsers()).toBe(true);
    expect(get(usersStore).users).toHaveLength(2);
    expect(get(usersStore).loading).toBe(false);
  });

  it("loadUsers gagal menyimpan pesan galat", async () => {
    mockFetch({ "GET /users": fail("Unauthenticated.") });
    expect(await loadUsers()).toBe(false);
    expect(get(usersStore).error).toBe("Unauthenticated.");
    expect(get(usersStore).loading).toBe(false);
  });

  it("loadUsers sukses tanpa data dianggap gagal", async () => {
    mockFetch({ "GET /users": ok("kosong") });
    expect(await loadUsers()).toBe(false);
  });

  it("saveProfile memperbarui profil di authStore", async () => {
    signIn();
    mockFetch({ "PUT /users/me": ok("Berhasil mengubah data", { user: user({ name: "Baru" }) }) });
    expect(await saveProfile("Baru", "testing@delcom.org")).toBe(true);
    expect(get(authStore).profile?.name).toBe("Baru");
    expect(messages()).toEqual(["success:Berhasil mengubah data"]);
  });

  it("saveProfile sukses tanpa data tidak mengubah profil; gagal menampilkan galat", async () => {
    signIn();
    mockFetch({ "PUT /users/me": ok("Berhasil mengubah data") });
    expect(await saveProfile("X", "x@y.z")).toBe(true);
    expect(get(authStore).profile?.name).toBe("Delcom Testing");

    mockFetch({ "PUT /users/me": fail("Data tidak valid", { email: ["Email tidak valid"] }) });
    expect(await saveProfile("X", "x")).toBe(false);
    expect(messages().at(-1)).toBe("error:Email tidak valid");
  });

  it("savePhoto memuat ulang profil saat berhasil", async () => {
    signIn();
    const { calls } = mockFetch({
      "POST /users/me/photo": ok("Berhasil mengubah foto"),
      "GET /users/me": ok("ok", { user: user({ photo: "img/profile/1.png" }) }),
    });
    expect(await savePhoto(new File(["x"], "p.png"))).toBe(true);
    expect(get(authStore).profile?.photo).toBe("img/profile/1.png");
    expect(calls.map((c) => c.path)).toEqual(["/users/me/photo", "/users/me"]);
  });

  it("savePhoto gagal tidak memuat ulang profil", async () => {
    const { calls } = mockFetch({ "POST /users/me/photo": fail("Foto tidak valid") });
    expect(await savePhoto(new File(["x"], "p.png"))).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it("savePassword mengirim konfirmasi kata sandi", async () => {
    const { calls } = mockFetch({ "PUT /users/password": ok("Berhasil mengubah kata sandi") });
    expect(await savePassword("lama", "baru", "baru")).toBe(true);
    expect(calls[0].body).toEqual({
      password: "lama",
      new_password: "baru",
      new_password_confirmation: "baru",
    });
  });
});
