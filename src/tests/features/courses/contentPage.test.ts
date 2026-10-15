import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";
import ContentPage from "../../../features/courses/pages/ContentPage.svelte";
import { coursesStore } from "../../../features/courses/states/coursesStore";
import type { CourseContent, CourseDetail } from "../../../features/courses/types";
import { content, deferred, detail, fail, mockFetch, ok, resetStores, signIn } from "../../utils";

let course: CourseDetail;
let item: CourseContent;
const routes = (extra: Record<string, unknown> = {}) => ({
  "GET /courses/3": () => ok("ok", { course }),
  "GET /courses/-/contents/10": () => ok("ok", { course_content: item }),
  ...extra,
});
const props = { courseId: 3, contentId: 10 };

beforeEach(() => {
  resetStores();
  signIn();
  course = detail();
  item = content();
});

describe("ContentPage", () => {
  it("menampilkan status memuat, lalu galat bila gagal", async () => {
    const gate = deferred<unknown>();
    mockFetch({ "GET /courses/3": () => gate.promise, "GET /courses/-/contents/10": () => gate.promise });
    const view = render(ContentPage, { props });
    expect(await screen.findByText("Memuat materi...")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke kursus/ })).toHaveAttribute("href", "/courses/3");
    gate.resolve(fail("Data tidak ditemukan"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Data tidak ditemukan");
    view.unmount();
  });

  it("pemilik: memutar video YouTube tanpa tombol status", async () => {
    mockFetch(routes());
    render(ContentPage, { props });
    expect(await screen.findByRole("heading", { name: "Pengenalan Pointer" })).toBeInTheDocument();
    expect(screen.getByTitle("Pengenalan Pointer")).toHaveAttribute("src", "https://www.youtube.com/embed/uHyfQV0kbgo");
    expect(screen.getByText("Anda melihat materi ini sebagai pemilik kursus.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tandai/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Dasar C/ })).toHaveAttribute("href", "/courses/3");
  });

  it("peserta: menandai selesai lalu belum selesai", async () => {
    course = detail({ user_id: 2, students: [1] });
    const { calls } = mockFetch(
      routes({
        "POST /courses/-/contents/10/learns": (call: { body: { status: 0 | 1 } }) => {
          item = content({ my_status_finished: call.body.status === 1 });
          return ok("Berhasil mengubah status pembelajaran pada konten kursus");
        },
      }),
    );
    render(ContentPage, { props });
    const mark = await screen.findByRole("button", { name: "Tandai selesai" });
    expect(screen.getByTitle("Pengenalan Pointer")).toBeInTheDocument();
    await fireEvent.click(mark);
    const undo = await screen.findByRole("button", { name: "Tandai belum selesai" });
    await fireEvent.click(undo);
    await screen.findByRole("button", { name: "Tandai selesai" });
    const posts = calls.filter((c) => c.method === "POST").map((c) => c.body);
    expect(posts).toEqual([{ status: 1 }, { status: 0 }]);
  });

  it("pengunjung: materi terkunci dan tanpa pemutar", async () => {
    course = detail({ user_id: 2, students: [] });
    mockFetch(routes());
    render(ContentPage, { props });
    expect(await screen.findByText("Daftar kursus ini terlebih dahulu untuk menonton materi.")).toBeInTheDocument();
    expect(screen.queryByTitle("Pengenalan Pointer")).toBeNull();
  });

  it("menampilkan peringatan bila tautan video tidak valid", async () => {
    item = content({ youtube: "https://example.com/bukan-youtube" });
    mockFetch(routes());
    render(ContentPage, { props });
    expect(await screen.findByRole("alert")).toHaveTextContent("Tautan video tidak valid.");
  });

  it("memuat ulang saat id berubah", async () => {
    mockFetch(
      routes({
        "GET /courses/-/contents/11": () => ok("ok", { course_content: content({ id: 11, title: "Array" }) }),
      }),
    );
    const { rerender } = render(ContentPage, { props });
    await screen.findByRole("heading", { name: "Pengenalan Pointer" });
    await rerender({ courseId: 3, contentId: 11 });
    expect(await screen.findByRole("heading", { name: "Array" })).toBeInTheDocument();
  });

  it("memuat ulang bila ada bendera mutasi dari luar", async () => {
    const { calls } = mockFetch(routes());
    render(ContentPage, { props });
    await screen.findByRole("heading", { name: "Pengenalan Pointer" });
    const before = calls.length;
    coursesStore.update((s) => ({ ...s, flags: { ...s.flags, content: true } }));
    await waitFor(() => expect(calls.length).toBe(before + 2));
  });
});
