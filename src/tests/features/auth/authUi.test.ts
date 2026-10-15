import { goto } from "$app/navigation";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { createRawSnippet } from "svelte";
import { beforeEach, describe, expect, it } from "vitest";
import AuthSessionRedirect from "../../../features/auth/components/AuthSessionRedirect.svelte";
import AuthLayout from "../../../features/auth/layouts/AuthLayout.svelte";
import LoginPage from "../../../features/auth/pages/LoginPage.svelte";
import RegisterPage from "../../../features/auth/pages/RegisterPage.svelte";
import { authStore } from "../../../features/auth/states/authStore";
import { toasts } from "../../../states/toastStore";
import { deferred, fail, mockFetch, ok, resetStores, signIn, typeInto, user } from "../../utils";

beforeEach(resetStores);

describe("AuthSessionRedirect", () => {
  it("mode guest: mengalihkan ke beranda hanya bila profil tersedia", async () => {
    render(AuthSessionRedirect, { props: { mode: "guest" } });
    expect(goto).not.toHaveBeenCalled();
    authStore.update((s) => ({ ...s, token: "t", profile: user() }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("mode protected: mengalihkan ke login hanya bila token tidak ada", async () => {
    signIn();
    render(AuthSessionRedirect, { props: { mode: "protected" } });
    expect(goto).not.toHaveBeenCalled();
    authStore.update((s) => ({ ...s, token: null }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("mode guest tidak mengalihkan ke login dan sebaliknya", () => {
    render(AuthSessionRedirect, { props: { mode: "guest" } });
    expect(goto).not.toHaveBeenCalledWith("/auth/login");
  });
});

describe("AuthLayout", () => {
  const children = createRawSnippet(() => ({ render: () => "<p>Formulir</p>" }));
  const footer = createRawSnippet(() => ({ render: () => "<span>Tautan kaki</span>" }));

  it("menjelaskan kursus dan menampilkan judul serta isi", () => {
    render(AuthLayout, { props: { title: "Masuk", subtitle: "Sub judul", children } });
    expect(screen.getByRole("heading", { level: 1, name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByText("Sub judul")).toBeInTheDocument();
    expect(screen.getByText("Formulir")).toBeInTheDocument();
    expect(screen.getByText(/Delcom Courses adalah tempat membuat dan mengikuti kursus/)).toBeInTheDocument();
    expect(screen.queryByText("Tautan kaki")).toBeNull();
  });

  it("menampilkan footer bila disediakan", () => {
    render(AuthLayout, { props: { title: "Masuk", subtitle: "s", children, footer } });
    expect(screen.getByText("Tautan kaki")).toBeInTheDocument();
  });
});

describe("LoginPage", () => {
  it("masuk dengan email & kata sandi lalu beralih ke beranda setelah profil tersedia", async () => {
    const { calls } = mockFetch({
      "POST /auth/login": ok("Berhasil login", { user: user(), token: "1|abc" }),
      "GET /users/me": ok("ok", { user: user() }),
    });
    render(LoginPage);
    await typeInto(screen.getByLabelText("Email"), "  testing@delcom.org ");
    await typeInto(screen.getByLabelText("Kata sandi"), "123456");
    await fireEvent.click(screen.getByRole("button", { name: /Masuk/ }));

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(calls[0].body).toEqual({ email: "testing@delcom.org", password: "123456" });
    expect(get(authStore).profile?.id).toBe(1);
  });

  it("menampilkan galat dan tetap di halaman saat login gagal", async () => {
    mockFetch({ "POST /auth/login": fail("Kredensial akun tidak ditemukan") });
    render(LoginPage);
    await typeInto(screen.getByLabelText("Email"), "a@b.c");
    await typeInto(screen.getByLabelText("Kata sandi"), "salah");
    await fireEvent.click(screen.getByRole("button", { name: /Masuk/ }));
    await waitFor(() => expect(get(toasts)[0]?.message).toBe("Kredensial akun tidak ditemukan"));
    expect(goto).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Masuk/ })).toBeEnabled();
  });

  it("menonaktifkan tombol saat memproses", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "POST /auth/login": () => gate.promise });
    render(LoginPage);
    await typeInto(screen.getByLabelText("Email"), "a@b.c");
    await typeInto(screen.getByLabelText("Kata sandi"), "x");
    await fireEvent.click(screen.getByRole("button", { name: /Masuk/ }));
    const busy = await screen.findByRole("button", { name: /Memproses/ });
    expect(busy).toBeDisabled();
    gate.resolve(fail("Kredensial akun tidak ditemukan"));
    await waitFor(() => expect(screen.getByRole("button", { name: /Masuk/ })).toBeEnabled());
  });

  it("memiliki tautan ke halaman daftar", () => {
    render(LoginPage);
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/auth/register");
  });
});

describe("RegisterPage", () => {
  const fill = async () => {
    await typeInto(screen.getByLabelText("Nama"), " Delcom Testing ");
    await typeInto(screen.getByLabelText("Email"), "testing@delcom.org");
    await typeInto(screen.getByLabelText("Kata sandi"), "123456");
    await fireEvent.click(screen.getByRole("button", { name: /Daftar/ }));
  };

  it("mendaftar lalu mengarahkan ke halaman login", async () => {
    const { calls } = mockFetch({ "POST /auth/register": ok("Berhasil melakukan pendaftaran") });
    render(RegisterPage);
    await fill();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(calls[0].body).toEqual({ name: "Delcom Testing", email: "testing@delcom.org", password: "123456" });
  });

  it("tetap di halaman bila pendaftaran gagal", async () => {
    mockFetch({ "POST /auth/register": fail("Data tidak valid", { email: ["Email sudah dipakai"] }) });
    render(RegisterPage);
    await fill();
    await waitFor(() => expect(get(toasts)[0]?.message).toBe("Email sudah dipakai"));
    expect(goto).not.toHaveBeenCalled();
  });

  it("menampilkan status memproses dan tautan ke login", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "POST /auth/register": () => gate.promise });
    render(RegisterPage);
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
    await fill();
    expect(await screen.findByRole("button", { name: /Memproses/ })).toBeDisabled();
    gate.resolve(fail("Gagal"));
    await waitFor(() => expect(screen.getByRole("button", { name: /Daftar/ })).toBeEnabled());
  });
});
