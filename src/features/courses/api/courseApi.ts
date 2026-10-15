import { apiHelper } from "../../../helpers/apiHelper";
import type {
  ContentPayload,
  ContentStatus,
  CourseContent,
  CourseDetail,
  CoursePayload,
  CourseSummary,
  RatingPayload,
} from "../types";

export const courseApi = {
  // --- Kursus ---
  createCourse: (payload: CoursePayload) => apiHelper.post("/courses", { body: payload }),
  changeCover: (id: number, cover: File) => {
    const form = new FormData();
    form.append("cover", cover);
    return apiHelper.post(`/courses/${id}/cover`, { form });
  },
  updateCourse: (id: number, payload: CoursePayload) =>
    apiHelper.put(`/courses/${id}`, { body: payload }),
  getCourses: (onlyMine = false) =>
    apiHelper.get<{ courses: Partial<CourseSummary>[] }>("/courses", {
      query: { is_me: onlyMine ? 1 : undefined },
    }),
  getCourse: (id: number) => apiHelper.get<{ course: Partial<CourseDetail> }>(`/courses/${id}`),
  deleteCourse: (id: number) => apiHelper.delete(`/courses/${id}`),
  deleteAllCourses: () => apiHelper.delete("/courses"),

  // --- Peserta ---
  joinCourse: (id: number) => apiHelper.post(`/courses/${id}/students`),
  leaveCourse: (id: number) => apiHelper.delete(`/courses/${id}/students`),
  rateCourse: (id: number, payload: RatingPayload) =>
    apiHelper.put(`/courses/${id}/students/ratings`, { body: payload }),

  // --- Konten ---
  addContent: (courseId: number, payload: ContentPayload) =>
    apiHelper.post<{ content_id: number }>(`/courses/${courseId}/contents`, { body: payload }),
  updateContent: (id: number, payload: ContentPayload) =>
    apiHelper.put(`/courses/-/contents/${id}`, { body: payload }),
  getContent: (id: number) =>
    apiHelper.get<{ course_content: CourseContent }>(`/courses/-/contents/${id}`),
  deleteContent: (id: number) => apiHelper.delete(`/courses/-/contents/${id}`),
  changeContentStatus: (id: number, status: ContentStatus) =>
    apiHelper.post(`/courses/-/contents/${id}/learns`, { body: { status } }),
};
