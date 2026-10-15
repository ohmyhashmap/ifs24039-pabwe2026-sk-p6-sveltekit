import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import {
  addContent,
  changeCover,
  clearMutations,
  coursesStore,
  createCourse,
  joinCourse,
  leaveCourse,
  loadContent,
  loadCourse,
  loadCourses,
  normalizeDetail,
  normalizeSummary,
  rateCourse,
  removeAllCourses,
  removeContent,
  removeCourse,
  resetCoursesState,
  setContentStatus,
  updateContent,
  updateCourse,
} from "../../../features/courses/states/coursesStore";
import { toasts } from "../../../states/toastStore";
import { content, detail, fail, mockFetch, ok, resetStores, summary } from "../../utils";

const flags = () => get(coursesStore).flags;
const messages = () => get(toasts).map((t) => `${t.type}:${t.message}`);

describe("normalisasi data", () => {
  it("normalizeSummary mempertahankan data lengkap", () => {
    const full = summary({ students: [1, 2], avg_ratings: "3.5000" });
    expect(normalizeSummary(full)).toEqual(full);
  });

  it("normalizeSummary mengisi bidang yang hilang", () => {
    expect(normalizeSummary({ id: 1, user_id: 2 })).toEqual({
      id: 1,
      user_id: 2,
      title: "",
      cover: null,
      description: "",
      created_at: "",
      updated_at: "",
      author: { name: "Tidak diketahui", photo: null },
      students: [],
      total_contents: 0,
      avg_ratings: null,
    });
  });

  it("normalizeDetail mempertahankan data lengkap", () => {
    const full = detail();
    expect(normalizeDetail(full)).toEqual(full);
  });

  it("normalizeDetail mengisi bidang yang hilang", () => {
    const result = normalizeDetail({ id: 1, user_id: 2 });
    expect(result.contents).toEqual([]);
    expect(result.ratings).toEqual([]);
    expect(result.total_contents).toBe(0);
    expect(result.my_percentage_finished).toBe("0");
    const withContents = normalizeDetail({ id: 1, user_id: 2, contents: [content()] });
    expect(withContents.total_contents).toBe(1);
  });
});

describe("pemuatan data", () => {
  beforeEach(resetStores);

  it("loadCourses menyimpan daftar dan membawa parameter is_me", async () => {
    const { calls } = mockFetch({ "GET /courses": ok("ok", { courses: [summary({ id: 1 }), { id: 2, user_id: 1 }] }) });
    expect(await loadCourses()).toBe(true);
    expect(get(coursesStore).courses.map((c) => c.id)).toEqual([1, 2]);
    expect(get(coursesStore).loading).toBe(false);
    await loadCourses(true);
    expect(calls[1].query).toBe("?is_me=1");
  });

  it("loadCourses gagal menyimpan galat; sukses tanpa data juga gagal", async () => {
    mockFetch({ "GET /courses": fail("Unauthenticated.") });
    expect(await loadCourses()).toBe(false);
    expect(get(coursesStore).error).toBe("Unauthenticated.");
    mockFetch({ "GET /courses": ok("kosong") });
    expect(await loadCourses()).toBe(false);
  });

  it("loadCourse dan loadContent", async () => {
    mockFetch({
      "GET /courses/3": ok("ok", { course: detail() }),
      "GET /courses/-/contents/10": ok("ok", { course_content: content() }),
    });
    expect(await loadCourse(3)).toBe(true);
    expect(await loadContent(10)).toBe(true);
    expect(get(coursesStore).course?.id).toBe(3);
    expect(get(coursesStore).content?.id).toBe(10);
  });

  it("loadCourse gagal tidak menimpa data sebelumnya namun mengisi galat", async () => {
    mockFetch({ "GET /courses/3": fail("Data tidak ditemukan") });
    expect(await loadCourse(3)).toBe(false);
    expect(get(coursesStore).error).toBe("Data tidak ditemukan");
  });
});

describe("mutasi", () => {
  beforeEach(resetStores);

  const cases: Array<[string, string, string, () => Promise<boolean>, keyof ReturnType<typeof flags>]> = [
    ["createCourse", "POST /courses", "Berhasil menambahkan", () => createCourse({ title: "T", description: "D" }), "course"],
    ["updateCourse", "PUT /courses/3", "Berhasil mengubah data", () => updateCourse(3, { title: "T", description: "D" }), "course"],
    ["removeCourse", "DELETE /courses/3", "Berhasil menghapus data", () => removeCourse(3), "course"],
    ["removeAllCourses", "DELETE /courses", "Berhasil menghapus semua", () => removeAllCourses(), "course"],
    ["changeCover", "POST /courses/3/cover", "Berhasil mengubah cover", () => changeCover(3, new File(["x"], "c.png")), "cover"],
    ["joinCourse", "POST /courses/3/students", "Berhasil menjadi pelajar", () => joinCourse(3), "student"],
    ["leaveCourse", "DELETE /courses/3/students", "Berhasil keluar", () => leaveCourse(3), "student"],
    ["rateCourse", "PUT /courses/3/students/ratings", "Berhasil mengubah ratings", () => rateCourse(3, { ratings: 5, comment: "x" }), "rating"],
    ["addContent", "POST /courses/3/contents", "Berhasil menambahkan konten", () => addContent(3, { title: "T", youtube: "y" }), "content"],
    ["updateContent", "PUT /courses/-/contents/7", "Berhasil mengubah konten", () => updateContent(7, { title: "T", youtube: "y" }), "content"],
    ["removeContent", "DELETE /courses/-/contents/7", "Berhasil menghapus konten", () => removeContent(7), "content"],
    ["setContentStatus", "POST /courses/-/contents/7/learns", "Berhasil mengubah status", () => setContentStatus(7, 1), "content"],
  ];

  it.each(cases)("%s menyalakan bendera mutasi dan menampilkan toast sukses", async (_n, route, message, run, flag) => {
    mockFetch({ [route]: ok(message) });
    expect(await run()).toBe(true);
    expect(flags()[flag]).toBe(true);
    expect(Object.values(flags()).filter(Boolean)).toHaveLength(1);
    expect(messages()).toEqual([`success:${message}`]);
  });

  it.each(cases)("%s yang gagal menampilkan galat tanpa menyalakan bendera", async (_n, route, _m, run) => {
    mockFetch({ [route]: fail("Data tidak valid", { field: ["Pesan validasi"] }) });
    expect(await run()).toBe(false);
    expect(Object.values(flags()).some(Boolean)).toBe(false);
    expect(messages()).toEqual(["error:Pesan validasi"]);
  });

  it("clearMutations dan resetCoursesState", async () => {
    mockFetch({ "DELETE /courses/3": ok("ok") });
    await removeCourse(3);
    clearMutations();
    expect(Object.values(flags()).some(Boolean)).toBe(false);
    coursesStore.update((s) => ({ ...s, courses: [summary()] }));
    resetCoursesState();
    expect(get(coursesStore).courses).toEqual([]);
  });
});
