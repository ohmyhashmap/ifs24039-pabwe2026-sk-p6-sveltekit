import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../../features/courses/pages/HomePage.svelte";
import { coursesStore } from "../../../features/courses/states/coursesStore";
import { authStore } from "../../../features/auth/states/authStore";
import { deferred, fail, mockFetch, ok, resetStores, signIn, summary, typeInto } from "../../utils";

const courses = [
  summary({ id: 1, user_id: 1, title: "Belajar ReactJS", description: "Frontend", author: { name: "Saya", photo: null } }),
  summary({ id: 2, user_id: 2, title: "Dasar C", description: "Bahasa C", author: { name: "Abdullah", photo: null } }),
];

beforeEach(() => {
  resetStores();
  signIn();
});

describe("HomePage", () => {
  it("menampilkan judul, daftar kursus, dan menandai milik sendiri", async () => {
    mockFetch({ "GET /courses": ok("ok", { courses }) });
    render(HomePage);
    expect(screen.getByRole("heading", { name: "Semua Kursus" })).toBeInTheDocument();
    expect(await screen.findByText("Belajar ReactJS")).toBeInTheDocument();
    expect(screen.getByText("Dasar C")).toBeInTheDocument();
    expect(screen.getAllByText("Milik Anda")).toHaveLength(1);
  });

  it("menampilkan status memuat saat daftar masih kosong", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "GET /courses": () => gate.promise });
    render(HomePage);
    expect(await screen.findByText("Memuat kursus...")).toBeInTheDocument();
    gate.resolve(ok("ok", { courses: [] }));
    expect(await screen.findByText("Belum ada kursus. Tambahkan yang pertama.")).toBeInTheDocument();
  });

  it("menampilkan galat dari server", async () => {
    mockFetch({ "GET /courses": fail("Unauthenticated.") });
    render(HomePage);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthenticated.");
  });

  it("mencari berdasarkan judul/deskripsi/pengajar dan menampilkan pesan bila tidak cocok", async () => {
    mockFetch({ "GET /courses": ok("ok", { courses }) });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");
    const search = screen.getByPlaceholderText("Cari judul, deskripsi, atau pengajar");

    await typeInto(search, "react");
    expect(screen.queryByText("Dasar C")).toBeNull();
    await typeInto(search, "bahasa c");
    expect(screen.queryByText("Belajar ReactJS")).toBeNull();
    await typeInto(search, "abdullah");
    expect(screen.getByText("Dasar C")).toBeInTheDocument();
    await typeInto(search, "tidak ada");
    expect(screen.getByText("Tidak ada kursus yang cocok dengan pencarian.")).toBeInTheDocument();
    await typeInto(search, "");
    expect(screen.getByText("Belajar ReactJS")).toBeInTheDocument();
  });

  it("filter 'Hanya milik saya' memuat ulang dengan is_me=1", async () => {
    const { calls } = mockFetch({ "GET /courses": ok("ok", { courses }) });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");
    await fireEvent.click(screen.getByLabelText("Hanya milik saya"));
    await waitFor(() => expect(calls.some((c) => c.query === "?is_me=1")).toBe(true));
    await fireEvent.click(screen.getByLabelText("Hanya milik saya"));
    await waitFor(() => expect(calls.filter((c) => c.query === "").length).toBeGreaterThan(1));
  });

  it("membuka dan menutup modal tambah kursus", async () => {
    mockFetch({ "GET /courses": ok("ok", { courses: [] }) });
    render(HomePage);
    await fireEvent.click(screen.getByRole("button", { name: /Tambah kursus/ }));
    expect(screen.getByRole("dialog", { name: "Tambah kursus" })).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("menambah kursus lalu memuat ulang daftar lewat bendera mutasi", async () => {
    let list = [courses[1]];
    const { calls } = mockFetch({
      "GET /courses": () => ok("ok", { courses: list }),
      "POST /courses": () => {
        list = [...courses];
        return ok("Berhasil menambahkan kursus");
      },
    });
    render(HomePage);
    await screen.findByText("Dasar C");
    await fireEvent.click(screen.getByRole("button", { name: /Tambah kursus/ }));
    await typeInto(screen.getByLabelText("Judul"), "Belajar ReactJS");
    await typeInto(screen.getByLabelText("Deskripsi"), "Frontend");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan kursus" }));
    expect(await screen.findByText("Belajar ReactJS")).toBeInTheDocument();
    expect(calls.filter((c) => c.method === "GET")).toHaveLength(2);
    expect(Object.values(get(coursesStore).flags).some(Boolean)).toBe(false);
  });

  it("menghapus satu kursus hanya setelah konfirmasi", async () => {
    let list = [...courses];
    const confirm = vi.spyOn(window, "confirm");
    const { calls } = mockFetch({
      "GET /courses": () => ok("ok", { courses: list }),
      "DELETE /courses/1": () => {
        list = [courses[1]];
        return ok("Berhasil menghapus data");
      },
    });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");

    confirm.mockReturnValueOnce(false);
    await fireEvent.click(screen.getByRole("button", { name: "Hapus Belajar ReactJS" }));
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);

    confirm.mockReturnValueOnce(true);
    await fireEvent.click(screen.getByRole("button", { name: "Hapus Belajar ReactJS" }));
    await waitFor(() => expect(screen.queryByText("Belajar ReactJS")).toBeNull());
    expect(confirm).toHaveBeenLastCalledWith('Hapus kursus "Belajar ReactJS"?');
  });

  it("menghapus semua kursus milik saya setelah konfirmasi", async () => {
    let list = [...courses];
    const confirm = vi.spyOn(window, "confirm");
    const { calls } = mockFetch({
      "GET /courses": () => ok("ok", { courses: list }),
      "DELETE /courses": () => {
        list = [courses[1]];
        return ok("Berhasil menghapus semua data kursus");
      },
    });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");
    const button = screen.getByRole("button", { name: /Hapus semua kursus saya/ });

    confirm.mockReturnValueOnce(false);
    await fireEvent.click(button);
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);

    confirm.mockReturnValueOnce(true);
    await fireEvent.click(button);
    await waitFor(() => expect(screen.queryByText("Belajar ReactJS")).toBeNull());
    expect(screen.queryByRole("button", { name: /Hapus semua kursus saya/ })).toBeNull();
  });

  it("tanpa kursus milik sendiri, tombol hapus semua tidak tampil", async () => {
    mockFetch({ "GET /courses": ok("ok", { courses: [courses[1]] }) });
    render(HomePage);
    await screen.findByText("Dasar C");
    expect(screen.queryByRole("button", { name: /Hapus semua kursus saya/ })).toBeNull();
  });

  it("memuat ulang saat bendera peserta atau sampul menyala", async () => {
    const { calls } = mockFetch({ "GET /courses": ok("ok", { courses }) });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");
    coursesStore.update((s) => ({ ...s, flags: { ...s.flags, student: true } }));
    await waitFor(() => expect(calls).toHaveLength(2));
    coursesStore.update((s) => ({ ...s, flags: { ...s.flags, cover: true } }));
    await waitFor(() => expect(calls).toHaveLength(3));
  });

  it("berfungsi tanpa profil (mis. saat keluar)", async () => {
    mockFetch({ "GET /courses": ok("ok", { courses }) });
    render(HomePage);
    await screen.findByText("Belajar ReactJS");
    authStore.update((s) => ({ ...s, profile: null }));
    await waitFor(() => expect(screen.queryByText("Milik Anda")).toBeNull());
    expect(within(document.body).getByText("Dasar C")).toBeInTheDocument();
  });
});
