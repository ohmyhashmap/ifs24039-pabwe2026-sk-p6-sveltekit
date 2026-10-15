import { describe, expect, it } from "vitest";
import { courseApi } from "../../../features/courses/api/courseApi";
import { mockFetch, ok } from "../../utils";

describe("courseApi", () => {
  it("memakai endpoint dan metode sesuai dokumentasi Delcom", async () => {
    const routes = [
      "POST /courses",
      "POST /courses/3/cover",
      "PUT /courses/3",
      "GET /courses",
      "GET /courses/3",
      "DELETE /courses/3",
      "DELETE /courses",
      "POST /courses/3/students",
      "DELETE /courses/3/students",
      "PUT /courses/3/students/ratings",
      "POST /courses/3/contents",
      "PUT /courses/-/contents/7",
      "GET /courses/-/contents/7",
      "DELETE /courses/-/contents/7",
      "POST /courses/-/contents/7/learns",
    ];
    const { calls } = mockFetch(Object.fromEntries(routes.map((r) => [r, ok()])));

    await courseApi.createCourse({ title: "T", description: "D" });
    await courseApi.changeCover(3, new File(["x"], "c.png"));
    await courseApi.updateCourse(3, { title: "T2", description: "D2" });
    await courseApi.getCourses();
    await courseApi.getCourse(3);
    await courseApi.deleteCourse(3);
    await courseApi.deleteAllCourses();
    await courseApi.joinCourse(3);
    await courseApi.leaveCourse(3);
    await courseApi.rateCourse(3, { ratings: 5, comment: "Bagus" });
    await courseApi.addContent(3, { title: "C", youtube: "https://youtu.be/uHyfQV0kbgo" });
    await courseApi.updateContent(7, { title: "C2", youtube: "https://youtu.be/uHyfQV0kbgo" });
    await courseApi.getContent(7);
    await courseApi.deleteContent(7);
    await courseApi.changeContentStatus(7, 1);

    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(routes);
    expect(calls[0].body).toEqual({ title: "T", description: "D" });
    expect((calls[1].body as FormData).get("cover")).toBeInstanceOf(File);
    expect(calls[9].body).toEqual({ ratings: 5, comment: "Bagus" });
    expect(calls[14].body).toEqual({ status: 1 });
  });

  it("getCourses mengirim is_me=1 hanya untuk filter milik saya", async () => {
    const { calls } = mockFetch({ "GET /courses": ok() });
    await courseApi.getCourses(false);
    await courseApi.getCourses(true);
    expect(calls[0].query).toBe("");
    expect(calls[1].query).toBe("?is_me=1");
  });
});
