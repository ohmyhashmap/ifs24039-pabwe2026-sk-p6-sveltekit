import { vi } from "vitest";
import { page } from "$app/state";
import { authStore } from "../features/auth/states/authStore";
import { resetCoursesState } from "../features/courses/states/coursesStore";
import type { CourseContent, CourseDetail, CourseSummary } from "../features/courses/types";
import { usersStore } from "../features/users/states/usersStore";
import type { User } from "../features/users/types";
import { toasts } from "../states/toastStore";

export const user = (o: Partial<User> = {}): User => ({
  id: 1,
  name: "Delcom Testing",
  email: "testing@delcom.org",
  email_verified_at: null,
  photo: "http://127.0.0.1:8000/default/img/user.png",
  created_at: "2024-10-05T02:53:38.000000Z",
  updated_at: "2024-10-05T02:53:38.000000Z",
  ...o,
});

export const summary = (o: Partial<CourseSummary> = {}): CourseSummary => ({
  id: 3,
  user_id: 1,
  title: "Dasar C",
  cover: "http://127.0.0.1:8000/img/courses/cover/1.jpeg",
  description: "Belajar dasar C dari awal",
  created_at: "2024-10-06T00:40:35.000000Z",
  updated_at: "2024-10-06T00:40:35.000000Z",
  author: { name: "Abdullah Ubaid", photo: null },
  students: [],
  total_contents: 3,
  avg_ratings: "4.0000",
  ...o,
});

export const content = (o: Partial<CourseContent> = {}): CourseContent => ({
  id: 10,
  course_id: 3,
  title: "Pengenalan Pointer",
  youtube: "https://youtu.be/uHyfQV0kbgo",
  created_at: "2024-10-06T00:55:15.000000Z",
  updated_at: "2024-10-06T00:55:15.000000Z",
  my_status_finished: false,
  ...o,
});

export const detail = (o: Partial<CourseDetail> = {}): CourseDetail => ({
  ...summary(),
  contents: [content(), content({ id: 11, title: "Array", my_status_finished: true })],
  ratings: [{ name: "Abdullah Ubaid", ratings: 4, comment: "Keren kali kursusnya" }],
  my_percentage_finished: "50.00",
  ...o,
});

export const ok = (message = "Berhasil", data?: unknown) => ({ status: "success", message, data });
export const fail = (message = "Gagal", data?: unknown) => ({ status: "fail", message, data });

export interface RecordedCall {
  method: string;
  path: string;
  query: string;
  body: any;
  headers: Record<string, string>;
}
type Handler = unknown | ((call: RecordedCall) => unknown);

/** Mengganti `fetch` global dengan penanggap berbasis "METHOD /path". */
export function mockFetch(routes: Record<string, Handler>) {
  const calls: RecordedCall[] = [];
  const fn = vi.fn(async (input: string, init: RequestInit = {}) => {
    const url = new URL(input);
    const call: RecordedCall = {
      method: init.method ?? "GET",
      path: url.pathname.replace("/api/v1", ""),
      query: url.search,
      body: typeof init.body === "string" ? JSON.parse(init.body) : init.body,
      headers: (init.headers ?? {}) as Record<string, string>,
    };
    calls.push(call);
    const handler = routes[`${call.method} ${call.path}`];
    const payload =
      handler === undefined
        ? fail(`Tidak ada mock untuk ${call.method} ${call.path}`)
        : typeof handler === "function"
          ? await (handler as (c: RecordedCall) => unknown)(call)
          : handler;
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fn);
  return { fn, calls };
}

export function resetStores() {
  localStorage.clear();
  authStore.set({ token: null, profile: null, loading: false });
  usersStore.set({ users: [], loading: false, error: null });
  resetCoursesState();
  toasts.set([]);
}

export function signIn(profile: User = user()) {
  localStorage.setItem("delcom_token", "tok-123");
  authStore.set({ token: "tok-123", profile, loading: false });
}

export function setPage(url: string, params: Record<string, string> = {}, extra: object = {}) {
  page.url = new URL(url, "http://localhost");
  page.params = params;
  Object.assign(page, extra);
}

/** Mengisi input/textarea dan memicu event `input` agar `bind:value` terbarui. */
export async function typeInto(el: HTMLElement, value: string) {
  const { fireEvent } = await import("@testing-library/svelte");
  await fireEvent.input(el, { target: { value } });
}

/** Janji yang dapat diselesaikan manual, untuk menguji keadaan "sedang menyimpan". */
export function deferred<T = unknown>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
