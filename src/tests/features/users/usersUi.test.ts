import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import { authStore } from "../../../features/auth/states/authStore";
import ProfilePage from "../../../features/users/pages/ProfilePage.svelte";
import UsersPage from "../../../features/users/pages/UsersPage.svelte";
import { toasts } from "../../../states/toastStore";
import { deferred, fail, mockFetch, ok, resetStores, signIn, typeInto, user } from "../../utils";

beforeEach(resetStores);

describe("UsersPage", () => {
  it("menampilkan daftar pengguna dan menandai akun sendiri", async () => {
    signIn(user({ id: 1 }));
    mockFetch({
      "GET /users": ok("ok", {
        users: [user({ id: 1, name: "Saya", photo: null }), user({ id: 2, name: "Teman", email: "teman@delcom.org" })],
      }),
    });
    render(UsersPage);
    expect(await screen.findByText("Teman")).toBeInTheDocument();
    expect(screen.getByText("teman@delcom.org")).toBeInTheDocument();
    expect(screen.getAllByText("Anda")).toHaveLength(1);
  });

  it("tanpa profil tidak ada penanda 'Anda'", async () => {
    mockFetch({ "GET /users": ok("ok", { users: [user({ id: 5 })] }) });
    render(UsersPage);
    await screen.findByText("Delcom Testing");
    expect(screen.queryByText("Anda")).toBeNull();
  });

  it("menampilkan status memuat, galat, dan kosong", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "GET /users": () => gate.promise });
    render(UsersPage);
    expect(await screen.findByText("Memuat pengguna...")).toBeInTheDocument();
    gate.resolve(ok("ok", { users: [] }));
    expect(await screen.findByText("Belum ada pengguna terdaftar.")).toBeInTheDocument();
  });

  it("menampilkan pesan galat dari server", async () => {
    mockFetch({ "GET /users": fail("Unauthenticated.") });
    render(UsersPage);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthenticated.");
  });
});

describe("ProfilePage", () => {
  beforeEach(() => signIn(user({ name: "Abdullah", email: "abdullah@delcom.org" })));

  it("memuat data awal dan menyimpan perubahan profil", async () => {
    const { calls } = mockFetch({
      "PUT /users/me": ok("Berhasil mengubah data", { user: user({ name: "Baru", email: "baru@delcom.org" }) }),
    });
    render(ProfilePage);
    expect(screen.getByLabelText("Nama")).toHaveValue("Abdullah");
    expect(screen.getByLabelText("Email")).toHaveValue("abdullah@delcom.org");

    await typeInto(screen.getByLabelText("Nama"), " Baru ");
    await typeInto(screen.getByLabelText("Email"), "baru@delcom.org");
    await fireEvent.click(screen.getByRole("button", { name: /Simpan perubahan/ }));
    await waitFor(() => expect(get(authStore).profile?.name).toBe("Baru"));
    expect(calls[0].body).toEqual({ name: "Baru", email: "baru@delcom.org" });
  });

  it("mengunggah foto lalu mengosongkan pilihan berkas", async () => {
    const { calls } = mockFetch({
      "POST /users/me/photo": ok("Berhasil mengubah foto"),
      "GET /users/me": ok("ok", { user: user({ photo: "img/profile/1.png" }) }),
    });
    render(ProfilePage);
    const button = screen.getByRole("button", { name: /Ganti foto/ });
    expect(button).toBeDisabled();

    const file = new File(["x"], "foto.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Berkas foto"), { target: { files: [file] } });
    expect(button).toBeEnabled();
    await fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect((calls[0].body as FormData).get("photo")).toBeInstanceOf(File);
    expect(get(authStore).profile?.photo).toBe("img/profile/1.png");
  });

  it("mempertahankan berkas bila unggah gagal dan mengabaikan kiriman tanpa berkas", async () => {
    const { calls } = mockFetch({ "POST /users/me/photo": fail("Foto tidak valid") });
    render(ProfilePage);
    const form = screen.getByRole("button", { name: /Ganti foto/ }).closest("form")!;

    await fireEvent.submit(form);
    expect(calls).toHaveLength(0);

    await fireEvent.change(screen.getByLabelText("Berkas foto"), {
      target: { files: [new File(["x"], "foto.png")] },
    });
    await fireEvent.click(screen.getByRole("button", { name: /Ganti foto/ }));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(screen.getByRole("button", { name: /Ganti foto/ })).toBeEnabled();
  });

  it("menganggap pemilihan berkas yang dibatalkan sebagai tanpa berkas", async () => {
    render(ProfilePage);
    await fireEvent.change(screen.getByLabelText("Berkas foto"), { target: { files: [] } });
    expect(screen.getByRole("button", { name: /Ganti foto/ })).toBeDisabled();
  });

  it("menolak kata sandi baru yang tidak cocok dengan konfirmasi", async () => {
    const { calls } = mockFetch({});
    render(ProfilePage);
    await typeInto(screen.getByLabelText("Kata sandi saat ini"), "lama123");
    await typeInto(screen.getByLabelText("Kata sandi baru"), "baru123");
    await typeInto(screen.getByLabelText("Ulangi kata sandi baru"), "beda123");
    await fireEvent.click(screen.getByRole("button", { name: /Ubah kata sandi/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Konfirmasi kata sandi baru tidak sama");
    expect(calls).toHaveLength(0);
  });

  it("mengubah kata sandi, menghapus galat, dan mengosongkan kolom", async () => {
    const { calls } = mockFetch({ "PUT /users/password": ok("Berhasil mengubah kata sandi") });
    render(ProfilePage);
    const current = screen.getByLabelText("Kata sandi saat ini");
    const next = screen.getByLabelText("Kata sandi baru");
    const confirm = screen.getByLabelText("Ulangi kata sandi baru");
    const submit = screen.getByRole("button", { name: /Ubah kata sandi/ });

    await typeInto(current, "lama123");
    await typeInto(next, "baru123");
    await typeInto(confirm, "beda123");
    await fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await typeInto(confirm, "baru123");
    await fireEvent.click(submit);
    await waitFor(() => expect(current).toHaveValue(""));
    expect(next).toHaveValue("");
    expect(confirm).toHaveValue("");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(calls[0].body).toEqual({
      password: "lama123",
      new_password: "baru123",
      new_password_confirmation: "baru123",
    });
  });

  it("mempertahankan isian bila server menolak kata sandi", async () => {
    mockFetch({ "PUT /users/password": fail("Kata sandi saat ini salah") });
    render(ProfilePage);
    await typeInto(screen.getByLabelText("Kata sandi saat ini"), "salah!");
    await typeInto(screen.getByLabelText("Kata sandi baru"), "baru123");
    await typeInto(screen.getByLabelText("Ulangi kata sandi baru"), "baru123");
    await fireEvent.click(screen.getByRole("button", { name: /Ubah kata sandi/ }));
    await waitFor(() => expect(get(toasts)[0]?.message).toBe("Kata sandi saat ini salah"));
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("salah!");
  });

  it("menyembunyikan avatar bila profil hilang (mis. saat logout)", async () => {
    render(ProfilePage);
    expect(screen.getByAltText("Abdullah")).toBeInTheDocument();
    authStore.update((s) => ({ ...s, profile: null }));
    await waitFor(() => expect(screen.queryByAltText("Abdullah")).toBeNull());
  });
});
