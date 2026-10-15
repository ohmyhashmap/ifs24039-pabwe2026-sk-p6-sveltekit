import { goto } from "$app/navigation";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore } from "../../../features/auth/states/authStore";
import DetailPage from "../../../features/courses/pages/DetailPage.svelte";
import { coursesStore } from "../../../features/courses/states/coursesStore";
import type { CourseDetail } from "../../../features/courses/types";
import { content, deferred, detail, fail, mockFetch, ok, resetStores, signIn, typeInto } from "../../utils";

let current: CourseDetail;
const routes = (extra: Record<string, unknown> = {}) => ({
  "GET /courses/3": () => ok("ok", { course: current }),
  ...extra,
});

beforeEach(() => {
  resetStores();
  signIn();
  current = detail();
});

describe("status pemuatan", () => {
  it("menampilkan status memuat lalu data", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "GET /courses/3": () => gate.promise });
    render(DetailPage, { props: { courseId: 3 } });
    expect(await screen.findByText("Memuat kursus...")).toBeInTheDocument();
    gate.resolve(ok("ok", { course: current }));
    expect(await screen.findByRole("heading", { name: "Dasar C" })).toBeInTheDocument();
  });

  it("menampilkan galat bila kursus tidak ditemukan", async () => {
    mockFetch({ "GET /courses/3": fail("Data tidak ditemukan") });
    render(DetailPage, { props: { courseId: 3 } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Data tidak ditemukan");
  });

  it("tidak menampilkan kursus lain yang tersisa di store", async () => {
    coursesStore.update((s) => ({ ...s, course: detail({ id: 99, title: "Lama" }) }));
    const gate = deferred<unknown>();
    mockFetch({ "GET /courses/3": () => gate.promise });
    render(DetailPage, { props: { courseId: 3 } });
    expect(screen.queryByText("Lama")).toBeNull();
    gate.resolve(ok("ok", { course: current }));
    await screen.findByRole("heading", { name: "Dasar C" });
  });

  it("memuat ulang saat courseId berubah dan menyembunyikan modal selama kursus belum ada", async () => {
    const gate = deferred<unknown>();
    mockFetch(routes({ "GET /courses/4": () => gate.promise }));
    const { rerender } = render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    await fireEvent.click(screen.getByRole("button", { name: /Ubah data/ }));
    expect(screen.getByRole("dialog", { name: "Ubah data kursus" })).toBeInTheDocument();
    await rerender({ courseId: 4 });
    expect(await screen.findByText("Memuat kursus...")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    gate.resolve(ok("ok", { course: detail({ id: 4, title: "Kursus Empat" }) }));
    expect(await screen.findByRole("heading", { name: "Kursus Empat" })).toBeInTheDocument();
  });
});

describe("antarmuka pemilik", () => {
  it("menampilkan aksi pemilik dan konten dengan tombol ubah/hapus", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByTestId("owner-actions")).toBeInTheDocument();
    expect(screen.queryByTestId("student-actions")).toBeNull();
    expect(screen.queryByRole("button", { name: "Daftar kursus" })).toBeNull();
    expect(screen.getByRole("link", { name: "Pengenalan Pointer" })).toHaveAttribute("href", "/courses/3/contents/10");
    expect(screen.getByRole("button", { name: "Ubah Pengenalan Pointer" })).toBeInTheDocument();
    expect(screen.queryByText("Daftar kursus untuk membuka materi.")).toBeNull();
    expect(screen.queryByRole("group", { name: "Pilih rating" })).toBeNull();
    expect(screen.getByText("Oleh Abdullah Ubaid")).toBeInTheDocument();
  });

  it("antarmuka pemilik didahulukan bila pengguna juga peserta", async () => {
    current = detail({ students: [1] });
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByTestId("owner-actions")).toBeInTheDocument();
    expect(screen.queryByTestId("student-actions")).toBeNull();
    expect(screen.queryByRole("group", { name: "Pilih rating" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Keluar dari kursus" })).toBeNull();
  });

  it("membuka modal ubah data, ubah sampul, tambah dan ubah konten", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    const close = () => fireEvent.click(screen.getByRole("button", { name: "Tutup" }));

    await fireEvent.click(screen.getByRole("button", { name: /Ubah data/ }));
    expect(screen.getByRole("dialog", { name: "Ubah data kursus" })).toBeInTheDocument();
    await close();
    await fireEvent.click(screen.getByRole("button", { name: /Ubah sampul/ }));
    expect(screen.getByRole("dialog", { name: "Ubah sampul kursus" })).toBeInTheDocument();
    await close();
    await fireEvent.click(screen.getByRole("button", { name: /Tambah konten/ }));
    expect(screen.getByRole("dialog", { name: "Tambah konten" })).toBeInTheDocument();
    await close();
    await fireEvent.click(screen.getByRole("button", { name: "Ubah Array" }));
    expect(screen.getByRole("dialog", { name: "Ubah konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Array");
    await close();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("mengubah data kursus lalu menampilkan hasil terbaru", async () => {
    mockFetch(
      routes({
        "PUT /courses/3": () => {
          current = detail({ title: "Judul Baru" });
          return ok("Berhasil mengubah data");
        },
      }),
    );
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    await fireEvent.click(screen.getByRole("button", { name: /Ubah data/ }));
    await typeInto(screen.getByLabelText("Judul"), "Judul Baru");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(await screen.findByRole("heading", { name: "Judul Baru" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("menghapus kursus: batal, gagal, lalu berhasil dan kembali ke beranda", async () => {
    const confirm = vi.spyOn(window, "confirm");
    let result: unknown = fail("Gagal menghapus");
    const { calls } = mockFetch(routes({ "DELETE /courses/3": () => result }));
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    const button = screen.getByRole("button", { name: /Hapus kursus/ });

    confirm.mockReturnValueOnce(false);
    await fireEvent.click(button);
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);

    confirm.mockReturnValueOnce(true);
    await fireEvent.click(button);
    await waitFor(() => expect(calls.some((c) => c.method === "DELETE")).toBe(true));
    expect(goto).not.toHaveBeenCalled();

    result = ok("Berhasil menghapus data");
    confirm.mockReturnValueOnce(true);
    await fireEvent.click(button);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("menghapus konten hanya setelah konfirmasi", async () => {
    const confirm = vi.spyOn(window, "confirm");
    const { calls } = mockFetch(
      routes({
        "DELETE /courses/-/contents/10": () => {
          current = detail({ contents: [content({ id: 11, title: "Array" })] });
          return ok("Berhasil menghapus konten kursus");
        },
      }),
    );
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    const button = screen.getByRole("button", { name: "Hapus Pengenalan Pointer" });

    confirm.mockReturnValueOnce(false);
    await fireEvent.click(button);
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);

    confirm.mockReturnValueOnce(true);
    await fireEvent.click(button);
    await waitFor(() => expect(screen.queryByText("Pengenalan Pointer")).toBeNull());
    expect(confirm).toHaveBeenLastCalledWith('Hapus konten "Pengenalan Pointer"?');
  });

  it("menampilkan sampul cadangan, tanpa konten, dan tanpa rating", async () => {
    current = detail({ cover: null, contents: [], ratings: [], total_contents: 0, avg_ratings: null });
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByTestId("cover-fallback")).toBeInTheDocument();
    expect(screen.getByText("Belum ada konten.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating")).toBeInTheDocument();
  });

  it("menampilkan sampul gambar dan daftar rating", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByAltText("Sampul Dasar C")).toBeInTheDocument();
    expect(screen.getByText("Keren kali kursusnya")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
  });
});

describe("antarmuka peserta", () => {
  beforeEach(() => {
    current = detail({ user_id: 2, students: [1] });
  });

  it("menampilkan progres, status konten, dan tidak menampilkan aksi pemilik", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByTestId("student-actions")).toBeInTheDocument();
    expect(screen.queryByTestId("owner-actions")).toBeNull();
    expect(screen.getByRole("progressbar", { name: "Progres belajar" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByLabelText("Selesai", { selector: "svg" })).toBeInTheDocument();
    expect(screen.getByLabelText("Belum selesai", { selector: "svg" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah konten/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ubah Array" })).toBeNull();
  });

  it("keluar dari kursus setelah konfirmasi", async () => {
    const confirm = vi.spyOn(window, "confirm");
    const { calls } = mockFetch(
      routes({
        "DELETE /courses/3/students": () => {
          current = detail({ user_id: 2, students: [] });
          return ok("Berhasil keluar sebagai pelajar pada kursus");
        },
      }),
    );
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    const button = screen.getByRole("button", { name: "Keluar dari kursus" });

    confirm.mockReturnValueOnce(false);
    await fireEvent.click(button);
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);

    confirm.mockReturnValueOnce(true);
    await fireEvent.click(button);
    expect(await screen.findByRole("button", { name: "Daftar kursus" })).toBeInTheDocument();
  });

  it("memberi rating: tombol nonaktif sebelum memilih, lalu terkirim dan direset", async () => {
    const { calls } = mockFetch(routes({ "PUT /courses/3/students/ratings": ok("Berhasil mengubah ratings pada kursus") }));
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    const submit = screen.getByRole("button", { name: "Kirim rating" });
    expect(submit).toBeDisabled();

    await fireEvent.click(screen.getByRole("button", { name: "Beri rating 4" }));
    expect(screen.getByRole("button", { name: "Beri rating 4" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Beri rating 5" })).toHaveAttribute("aria-pressed", "false");
    await typeInto(screen.getByLabelText("Komentar"), " Mantap ");
    expect(submit).toBeEnabled();
    await fireEvent.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    expect(screen.getByLabelText("Komentar")).toHaveValue("");
    expect(calls.find((c) => c.method === "PUT")?.body).toEqual({ ratings: 4, comment: "Mantap" });
  });

  it("mempertahankan rating bila server menolak", async () => {
    mockFetch(routes({ "PUT /courses/3/students/ratings": fail("Selesaikan materi terlebih dahulu") }));
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    await fireEvent.click(screen.getByRole("button", { name: "Beri rating 2" }));
    await typeInto(screen.getByLabelText("Komentar"), "Cukup");
    await fireEvent.click(screen.getByRole("button", { name: "Kirim rating" }));
    await waitFor(() => expect(get(coursesStore).flags.rating).toBe(false));
    expect(screen.getByLabelText("Komentar")).toHaveValue("Cukup");
    expect(screen.getByRole("button", { name: "Beri rating 2" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("antarmuka pengunjung", () => {
  beforeEach(() => {
    current = detail({ user_id: 2, students: [] });
  });

  it("menampilkan tombol daftar, konten terkunci, dan tanpa formulir rating", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    expect(screen.getByRole("button", { name: "Daftar kursus" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pengenalan Pointer" })).toBeNull();
    expect(screen.getByText("Pengenalan Pointer")).toBeInTheDocument();
    expect(screen.getByText("Daftar kursus untuk membuka materi.")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Pilih rating" })).toBeNull();
  });

  it("mendaftar ke kursus lalu menampilkan antarmuka peserta", async () => {
    const { calls } = mockFetch(
      routes({
        "POST /courses/3/students": () => {
          current = detail({ user_id: 2, students: [1] });
          return ok("Berhasil menjadi pelajar pada kursus");
        },
      }),
    );
    render(DetailPage, { props: { courseId: 3 } });
    await fireEvent.click(await screen.findByRole("button", { name: "Daftar kursus" }));
    expect(await screen.findByTestId("student-actions")).toBeInTheDocument();
    expect(calls.filter((c) => c.method === "GET")).toHaveLength(2);
  });

  it("tanpa profil, pengguna dianggap pengunjung", async () => {
    mockFetch(routes());
    render(DetailPage, { props: { courseId: 3 } });
    await screen.findByRole("heading", { name: "Dasar C" });
    authStore.update((s) => ({ ...s, profile: null }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Daftar kursus" })).toBeInTheDocument());
    expect(within(document.body).queryByTestId("owner-actions")).toBeNull();
  });
});
