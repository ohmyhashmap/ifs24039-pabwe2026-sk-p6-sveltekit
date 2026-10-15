import { goto } from "$app/navigation";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseCard from "../../../features/courses/components/CourseCard.svelte";
import CourseLayout from "../../../features/courses/layouts/CourseLayout.svelte";
import { authStore } from "../../../features/auth/states/authStore";
import { fail, mockFetch, ok, resetStores, setPage, signIn, summary, user } from "../../utils";

beforeEach(() => {
  resetStores();
  setPage("/");
});

const children = createRawSnippet(() => ({ render: () => "<p>Konten halaman</p>" }));

describe("CourseLayout", () => {
  it("tanpa token: menampilkan status memuat dan mengalihkan ke login", async () => {
    render(CourseLayout, { props: { children } });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi...");
    expect(screen.queryByText("Konten halaman")).toBeNull();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("dengan token tanpa profil: memuat profil lalu menampilkan navbar, sidebar, dan isi", async () => {
    localStorage.setItem("delcom_token", "tok");
    authStore.set({ token: "tok", profile: null, loading: false });
    const { calls } = mockFetch({ "GET /users/me": ok("ok", { user: user() }) });
    render(CourseLayout, { props: { children } });
    expect(await screen.findByText("Konten halaman")).toBeInTheDocument();
    expect(calls).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toBeInTheDocument();
  });

  it("sesi tidak valid: token dibersihkan dan dialihkan ke login", async () => {
    authStore.set({ token: "tok", profile: null, loading: false });
    mockFetch({ "GET /users/me": fail("Unauthenticated.") });
    render(CourseLayout, { props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(get(authStore).token).toBeNull();
  });

  it("tidak memuat profil ganda saat sedang loading", () => {
    authStore.set({ token: "tok", profile: null, loading: true });
    const { calls } = mockFetch({});
    render(CourseLayout, { props: { children } });
    expect(calls).toHaveLength(0);
  });

  it("membuka dan menutup sidebar pada layar kecil", async () => {
    signIn();
    render(CourseLayout, { props: { children } });
    const sidebar = screen.getByLabelText("Menu samping");
    expect(sidebar).toHaveAttribute("data-open", "false");
    await fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(sidebar).toHaveAttribute("data-open", "true");
    await fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(sidebar).toHaveAttribute("data-open", "false");
    await fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    const link = screen.getByRole("link", { name: "Pengguna" });
    link.addEventListener("click", (e) => e.preventDefault());
    await fireEvent.click(link);
    expect(sidebar).toHaveAttribute("data-open", "false");
  });
});

describe("CourseCard", () => {
  it("pemilik: lencana 'Milik Anda' dan tombol hapus", async () => {
    const ondelete = vi.fn();
    const course = summary({ user_id: 1, students: [1] });
    render(CourseCard, { props: { course, myId: 1, ondelete } });
    expect(screen.getByText("Milik Anda")).toBeInTheDocument();
    expect(screen.queryByText("Terdaftar")).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Hapus Dasar C" }));
    expect(ondelete).toHaveBeenCalledWith(course);
    expect(screen.getByAltText("Sampul Dasar C")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka Dasar C" })).toHaveAttribute("href", "/courses/3");
  });

  it("peserta: lencana 'Terdaftar' tanpa tombol hapus; sampul cadangan; tanpa rating", () => {
    render(CourseCard, {
      props: { course: summary({ user_id: 2, students: [1], cover: null, avg_ratings: null }), myId: 1, ondelete: vi.fn() },
    });
    expect(screen.getByText("Terdaftar")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByTestId("cover-fallback")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating")).toBeInTheDocument();
  });

  it("pengunjung: tanpa lencana; memperbarui tampilan saat data berubah", async () => {
    const { rerender } = render(CourseCard, {
      props: { course: summary({ user_id: 2, students: [] }), myId: 1, ondelete: vi.fn() },
    });
    expect(screen.queryByText("Milik Anda")).toBeNull();
    expect(screen.queryByText("Terdaftar")).toBeNull();
    await rerender({ course: summary({ id: 4, title: "Baru", user_id: 2, students: [], cover: null }) });
    expect(screen.getByRole("link", { name: "Buka Baru" })).toHaveAttribute("href", "/courses/4");
    expect(screen.getByTestId("cover-fallback")).toBeInTheDocument();
  });

  it("tanpa id pengguna, tidak dianggap pemilik atau peserta", () => {
    render(CourseCard, { props: { course: summary(), ondelete: vi.fn() } });
    expect(screen.queryByText("Milik Anda")).toBeNull();
    expect(screen.queryByText("Terdaftar")).toBeNull();
  });
});
