import { render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";
import * as rootLayout from "../../routes/+layout";
import ErrorPage from "../../routes/+error.svelte";
import HomeRoute from "../../routes/+page.svelte";
import LoginRoute from "../../routes/auth/login/+page.svelte";
import RegisterRoute from "../../routes/auth/register/+page.svelte";
import ContentRoute from "../../routes/courses/[courseId]/contents/[contentId]/+page.svelte";
import DetailRoute from "../../routes/courses/[courseId]/+page.svelte";
import ProfileRoute from "../../routes/profile/+page.svelte";
import UsersRoute from "../../routes/users/+page.svelte";
import { content, detail, mockFetch, ok, resetStores, setPage, signIn, summary, user } from "../utils";

beforeEach(() => {
  resetStores();
  signIn();
});

describe("rute", () => {
  it("+layout.ts menonaktifkan SSR dan prerender", () => {
    expect(rootLayout.ssr).toBe(false);
    expect(rootLayout.prerender).toBe(false);
  });

  it("/ menampilkan daftar kursus", async () => {
    setPage("/");
    mockFetch({ "GET /courses": ok("ok", { courses: [summary()] }) });
    render(HomeRoute);
    expect(await screen.findByText("Dasar C")).toBeInTheDocument();
    expect(document.title).toContain("Semua Kursus");
  });

  it("/courses/[courseId] membaca parameter dan menampilkan detail", async () => {
    setPage("/courses/3", { courseId: "3" });
    const { calls } = mockFetch({ "GET /courses/3": ok("ok", { course: detail() }) });
    render(DetailRoute);
    expect(await screen.findByRole("heading", { name: "Dasar C" })).toBeInTheDocument();
    expect(calls[0].path).toBe("/courses/3");
  });

  it("/courses/[courseId]/contents/[contentId] menampilkan materi", async () => {
    setPage("/courses/3/contents/10", { courseId: "3", contentId: "10" });
    const { calls } = mockFetch({
      "GET /courses/3": ok("ok", { course: detail() }),
      "GET /courses/-/contents/10": ok("ok", { course_content: content() }),
    });
    render(ContentRoute);
    expect(await screen.findByRole("heading", { name: "Pengenalan Pointer" })).toBeInTheDocument();
    expect(calls.map((c) => c.path).sort()).toEqual(["/courses/-/contents/10", "/courses/3"]);
  });

  it("/auth/login dan /auth/register", () => {
    setPage("/auth/login");
    localStorage.clear();
    const login = render(LoginRoute);
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    login.unmount();
    render(RegisterRoute);
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });

  it("/users dan /profile", async () => {
    setPage("/users");
    mockFetch({ "GET /users": ok("ok", { users: [user({ name: "Pengguna Satu" })] }) });
    const users = render(UsersRoute);
    expect(await screen.findByText("Pengguna Satu")).toBeInTheDocument();
    users.unmount();
    setPage("/profile");
    render(ProfileRoute);
    expect(screen.getByRole("heading", { name: "Profil" })).toBeInTheDocument();
  });

  it("+error.svelte menampilkan halaman tidak ditemukan", () => {
    setPage("/nope", {}, { status: 404, error: null });
    render(ErrorPage);
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByText("Halaman yang Anda cari tidak tersedia.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke Semua Kursus" })).toHaveAttribute("href", "/");
  });

  it("+error.svelte menampilkan pesan galat lain", async () => {
    setPage("/x", {}, { status: 500, error: { message: "Server bermasalah" } });
    render(ErrorPage);
    expect(screen.getByRole("heading", { name: "Terjadi kesalahan" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Server bermasalah")).toBeInTheDocument());
  });
});
