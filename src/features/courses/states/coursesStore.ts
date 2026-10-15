import { writable } from "svelte/store";
import { getErrorMessage, type ApiResponse } from "../../../helpers/apiHelper";
import { notify } from "../../../states/toastStore";
import { courseApi } from "../api/courseApi";
import type {
  ContentPayload,
  ContentStatus,
  CourseContent,
  CourseDetail,
  CoursePayload,
  CourseSummary,
  RatingPayload,
} from "../types";

export type MutationKey = "course" | "cover" | "student" | "rating" | "content";
export type MutationFlags = Record<MutationKey, boolean>;

export interface CoursesState {
  courses: CourseSummary[];
  course: CourseDetail | null;
  content: CourseContent | null;
  loading: boolean;
  error: string | null;
  flags: MutationFlags;
}

const idleFlags = (): MutationFlags => ({
  course: false,
  cover: false,
  student: false,
  rating: false,
  content: false,
});

const initialState = (): CoursesState => ({
  courses: [],
  course: null,
  content: null,
  loading: false,
  error: null,
  flags: idleFlags(),
});

export const coursesStore = writable<CoursesState>(initialState());

const patch = (partial: Partial<CoursesState>) =>
  coursesStore.update((state) => ({ ...state, ...partial }));

/** Melengkapi bidang yang mungkin tidak dikirim server agar antarmuka tidak rusak. */
export function normalizeSummary(raw: Partial<CourseSummary>): CourseSummary {
  return {
    id: raw.id!,
    user_id: raw.user_id!,
    title: raw.title ?? "",
    cover: raw.cover ?? null,
    description: raw.description ?? "",
    created_at: raw.created_at ?? "",
    updated_at: raw.updated_at ?? "",
    author: raw.author ?? { name: "Tidak diketahui", photo: null },
    students: raw.students ?? [],
    total_contents: raw.total_contents ?? 0,
    avg_ratings: raw.avg_ratings ?? null,
  };
}

export function normalizeDetail(raw: Partial<CourseDetail>): CourseDetail {
  const contents = raw.contents ?? [];
  return {
    ...normalizeSummary(raw),
    contents,
    ratings: raw.ratings ?? [],
    total_contents: raw.total_contents ?? contents.length,
    my_percentage_finished: raw.my_percentage_finished ?? "0",
  };
}

async function load<T>(
  call: () => Promise<ApiResponse<T>>,
  apply: (data: T) => Partial<CoursesState>,
): Promise<boolean> {
  patch({ loading: true, error: null });
  const response = await call();
  if (response.status === "success" && response.data) {
    patch({ ...apply(response.data), loading: false });
    return true;
  }
  patch({ loading: false, error: getErrorMessage(response) });
  return false;
}

export const loadCourses = (onlyMine = false) =>
  load(
    () => courseApi.getCourses(onlyMine),
    (data) => ({ courses: data.courses.map(normalizeSummary) }),
  );

export const loadCourse = (id: number) =>
  load(
    () => courseApi.getCourse(id),
    (data) => ({ course: normalizeDetail(data.course) }),
  );

export const loadContent = (id: number) =>
  load(
    () => courseApi.getContent(id),
    (data) => ({ content: data.course_content }),
  );

async function mutate(call: () => Promise<ApiResponse<any>>, key: MutationKey): Promise<boolean> {
  const response = await call();
  if (response.status !== "success") {
    notify("error", getErrorMessage(response));
    return false;
  }
  coursesStore.update((state) => ({ ...state, flags: { ...state.flags, [key]: true } }));
  notify("success", response.message);
  return true;
}

export const clearMutations = () => patch({ flags: idleFlags() });

export const resetCoursesState = () => coursesStore.set(initialState());

// Kursus
export const createCourse = (payload: CoursePayload) =>
  mutate(() => courseApi.createCourse(payload), "course");
export const updateCourse = (id: number, payload: CoursePayload) =>
  mutate(() => courseApi.updateCourse(id, payload), "course");
export const removeCourse = (id: number) => mutate(() => courseApi.deleteCourse(id), "course");
export const removeAllCourses = () => mutate(() => courseApi.deleteAllCourses(), "course");
export const changeCover = (id: number, cover: File) =>
  mutate(() => courseApi.changeCover(id, cover), "cover");

// Peserta
export const joinCourse = (id: number) => mutate(() => courseApi.joinCourse(id), "student");
export const leaveCourse = (id: number) => mutate(() => courseApi.leaveCourse(id), "student");
export const rateCourse = (id: number, payload: RatingPayload) =>
  mutate(() => courseApi.rateCourse(id, payload), "rating");

// Konten
export const addContent = (courseId: number, payload: ContentPayload) =>
  mutate(() => courseApi.addContent(courseId, payload), "content");
export const updateContent = (id: number, payload: ContentPayload) =>
  mutate(() => courseApi.updateContent(id, payload), "content");
export const removeContent = (id: number) => mutate(() => courseApi.deleteContent(id), "content");
export const setContentStatus = (id: number, status: ContentStatus) =>
  mutate(() => courseApi.changeContentStatus(id, status), "content");
