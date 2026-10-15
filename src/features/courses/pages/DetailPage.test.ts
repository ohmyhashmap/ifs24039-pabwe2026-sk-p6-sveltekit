import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import DetailPage from "./DetailPage.svelte";
import coursesStore from "../states/coursesStore";
import usersStore from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as navigation from "$app/navigation";

describe("DetailPage", () => {
  const mockOwnerProfile = {
    id: 1,
    name: "Instructor Alice",
    email: "alice@delcom.org",
    username: "alice",
  };

  const mockStudentProfile = {
    id: 2,
    name: "Student Bob",
    email: "bob@delcom.org",
    username: "bob",
  };

  const mockCourseData = {
    id: 50,
    user_id: 1,
    title: "Fullstack SvelteKit",
    description: "Belajar SvelteKit dari nol sampai mahir.",
    cover: "https://example.com/cover.jpg",
    author: { name: "Instructor Alice" },
    students: [2, 3],
    my_percentage_finished: 50,
    avg_ratings: 4.8,
    ratings: [
      { name: "Student Bob", ratings: 5, comment: "Luar biasa!" },
      { name: "Student Charlie", ratings: 4, comment: "" },
    ],
    contents: [
      {
        id: 501,
        title: "01. Pendahuluan",
        youtube: "https://youtu.be/intro",
        my_status_finished: true,
      },
      {
        id: 502,
        title: "02. Routing & Layout",
        youtube: "https://youtu.be/routing",
        my_status_finished: false,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
    usersStore.reset();
  });

  it("does not call asyncSetCourse on mount if courseId is null", () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse");
    render(DetailPage, { props: { courseId: null } });
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("navigates back to home when back button is clicked", async () => {
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();
    const { getByTestId } = render(DetailPage, { props: { courseId: 50 } });

    await fireEvent.click(getByTestId("back-button"));
    expect(gotoSpy).toHaveBeenCalledWith("/");
  });

  it("renders loading state when course is null", () => {
    coursesStore.setCourse(null);
    const { getByText } = render(DetailPage, { props: { courseId: 50 } });
    expect(getByText("Memuat detail kursus...")).toBeDefined();
  });

  it("renders owner view with management controls", async () => {
    usersStore.setProfile(mockOwnerProfile);
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});

    const { getByText, getByTestId, queryByTestId } = render(DetailPage, {
      props: { courseId: 50 },
    });

    expect(getByText("Pemilik Kursus")).toBeDefined();
    expect(getByText("Fullstack SvelteKit")).toBeDefined();
    expect(getByTestId("change-cover-btn")).toBeDefined();
    expect(getByTestId("edit-course-btn")).toBeDefined();
    expect(getByTestId("delete-course-btn")).toBeDefined();
    expect(getByTestId("add-content-btn")).toBeDefined();
    expect(getByTestId("edit-content-btn-501")).toBeDefined();
    expect(getByTestId("delete-content-btn-501")).toBeDefined();

    // Change cover modal toggle
    await fireEvent.click(getByTestId("change-cover-btn"));
    expect(getByTestId("change-cover-modal")).toBeDefined();
    await fireEvent.click(getByTestId("close-cover-modal-btn"));
    expect(queryByTestId("change-cover-modal")).toBeNull();

    // Change modal toggle
    await fireEvent.click(getByTestId("edit-course-btn"));
    expect(getByTestId("edit-course-modal")).toBeDefined();
    await fireEvent.click(getByTestId("close-edit-modal-btn"));
    expect(queryByTestId("edit-course-modal")).toBeNull();

    // Add content modal toggle
    await fireEvent.click(getByTestId("add-content-btn"));
    expect(getByTestId("content-modal")).toBeDefined();
    await fireEvent.click(getByTestId("close-content-modal-btn"));
    expect(queryByTestId("content-modal")).toBeNull();

    // Edit content modal toggle
    await fireEvent.click(getByTestId("edit-content-btn-501"));
    expect(getByTestId("content-modal")).toBeDefined();
    await fireEvent.click(getByTestId("close-content-modal-btn"));
  });

  it("handles delete course in owner view (cancelled and confirmed)", async () => {
    usersStore.setProfile(mockOwnerProfile);
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const deleteSpy = vi.spyOn(coursesStore, "asyncSetIsCourseDelete").mockImplementation(async () => {});

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const { getByTestId } = render(DetailPage, { props: { courseId: 50 } });
    await fireEvent.click(getByTestId("delete-course-btn"));
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await fireEvent.click(getByTestId("delete-course-btn"));
    expect(deleteSpy).toHaveBeenCalledWith(50);
  });

  it("handles delete content in owner view (cancelled and confirmed)", async () => {
    usersStore.setProfile(mockOwnerProfile);
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const deleteContentSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentDelete").mockImplementation(async () => {});

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const { getByTestId } = render(DetailPage, { props: { courseId: 50 } });
    await fireEvent.click(getByTestId("delete-content-btn-501"));
    expect(deleteContentSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await fireEvent.click(getByTestId("delete-content-btn-501"));
    expect(deleteContentSpy).toHaveBeenCalledWith(501);
  });

  it("renders enrolled student view with rate and leave controls", async () => {
    usersStore.setProfile(mockStudentProfile);
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const leaveSpy = vi.spyOn(coursesStore, "asyncSetIsCourseStudentLeave").mockImplementation(async () => {});

    const { getByText, getByTestId, queryByTestId } = render(DetailPage, {
      props: { courseId: 50 },
    });

    expect(getByText("Terdaftar sebagai Siswa")).toBeDefined();
    expect(getByText("Progres Belajar Anda")).toBeDefined();
    expect(getByTestId("rate-course-btn")).toBeDefined();
    expect(getByTestId("leave-course-btn")).toBeDefined();

    // Rating modal toggle
    await fireEvent.click(getByTestId("rate-course-btn"));
    expect(getByTestId("rating-modal")).toBeDefined();
    await fireEvent.click(getByTestId("close-rating-modal-btn"));
    expect(queryByTestId("rating-modal")).toBeNull();

    // Leave course cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    await fireEvent.click(getByTestId("leave-course-btn"));
    expect(leaveSpy).not.toHaveBeenCalled();

    // Leave course confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await fireEvent.click(getByTestId("leave-course-btn"));
    expect(leaveSpy).toHaveBeenCalledWith(50);
  });

  it("renders non-enrolled user view with join button", async () => {
    usersStore.setProfile({ id: 99, name: "Guest", email: "guest@delcom.org", username: "guest" });
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const joinSpy = vi.spyOn(coursesStore, "asyncSetIsCourseStudentJoin").mockImplementation(async () => {});

    const { getByTestId } = render(DetailPage, { props: { courseId: 50 } });
    const joinBtn = getByTestId("join-course-btn");
    expect(joinBtn).toBeDefined();

    await fireEvent.click(joinBtn);
    expect(joinSpy).toHaveBeenCalledWith(50);
  });

  it("navigates to content learning page on view-content click", async () => {
    usersStore.setProfile(mockStudentProfile);
    coursesStore.setCourse(mockCourseData);
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();

    const { getByTestId } = render(DetailPage, { props: { courseId: 50 } });
    await fireEvent.click(getByTestId("view-content-btn-501"));

    expect(gotoSpy).toHaveBeenCalledWith("/courses/50/contents/501");
  });

  it("renders empty contents message when contents array is empty", () => {
    usersStore.setProfile(mockStudentProfile);
    coursesStore.setCourse({ ...mockCourseData, contents: [] });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});

    const { getByText } = render(DetailPage, { props: { courseId: 50 } });
    expect(getByText("Belum ada video materi di kursus ini.")).toBeDefined();
  });

  it("reacts to isCourseDeleted and navigates home", async () => {
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();
    render(DetailPage, { props: { courseId: 50 } });

    coursesStore.setIsCourseDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(gotoSpy).toHaveBeenCalledWith("/");
  });

  it("reacts to student join success and reloads course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });

    coursesStore.setIsCourseStudentJoined(true);
    coursesStore.setIsCourseStudentJoin(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(50);
  });

  it("reacts to student leave success and reloads course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });

    coursesStore.setIsCourseStudentLeft(true);
    coursesStore.setIsCourseStudentLeave(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(50);
  });

  it("reacts to content delete success and reloads course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });

    coursesStore.setIsCourseContentDeleted(true);
    coursesStore.setIsCourseContentDelete(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(50);
  });

  it("reacts to student join failure without reloading course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });
    setCourseSpy.mockClear();

    coursesStore.setIsCourseStudentJoined(false);
    coursesStore.setIsCourseStudentJoin(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("reacts to student leave failure without reloading course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });
    setCourseSpy.mockClear();

    coursesStore.setIsCourseStudentLeft(false);
    coursesStore.setIsCourseStudentLeave(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("reacts to content delete failure without reloading course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: 50 } });
    setCourseSpy.mockClear();

    coursesStore.setIsCourseContentDeleted(false);
    coursesStore.setIsCourseContentDelete(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("renders course with fallback values (no cover, no author, no students, no contents, no ratings)", () => {
    usersStore.setProfile(null);
    coursesStore.setCourse({
      id: 999,
      user_id: 100,
      title: "Fallback Course",
      description: "Fallback description",
      cover: null,
      avg_ratings: 0,
      author: null,
      students: null,
      contents: null,
      ratings: null,
    });

    const { getByText } = render(DetailPage, { props: { courseId: 999 } });
    expect(getByText("Fallback Course")).toBeDefined();
    expect(getByText("Rating: 0.0")).toBeDefined();
    expect(getByText("0 Siswa Terdaftar")).toBeDefined();
    expect(getByText("0 Modul Video")).toBeDefined();
    expect(getByText("Pengajar")).toBeDefined();
  });

  it("does not reload course if courseId is null on student join/leave/content delete success", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    render(DetailPage, { props: { courseId: null } });
    setCourseSpy.mockClear();

    coursesStore.setIsCourseStudentJoined(true);
    coursesStore.setIsCourseStudentJoin(true);
    await new Promise((r) => setTimeout(r, 10));

    coursesStore.setIsCourseStudentLeft(true);
    coursesStore.setIsCourseStudentLeave(true);
    await new Promise((r) => setTimeout(r, 10));

    coursesStore.setIsCourseContentDeleted(true);
    coursesStore.setIsCourseContentDelete(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).not.toHaveBeenCalled();
  });
});
