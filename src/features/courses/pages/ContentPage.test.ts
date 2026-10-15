import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import ContentPage from "./ContentPage.svelte";
import coursesStore from "../states/coursesStore";
import * as navigation from "$app/navigation";

describe("ContentPage", () => {
  const mockCourseData = {
    id: 50,
    user_id: 1,
    title: "Fullstack SvelteKit",
    description: "Belajar SvelteKit",
    contents: [
      {
        id: 501,
        title: "01. Pendahuluan",
        youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        my_status_finished: false,
      },
      {
        id: 502,
        title: "02. Routing",
        youtube: "https://youtu.be/dQw4w9WgXcQ",
        my_status_finished: true,
      },
      {
        id: 503,
        title: "03. State Management",
        youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        my_status_finished: false,
      },
      {
        id: 504,
        title: "04. Summary",
        youtube: "plainVideoId123",
        my_status_finished: false,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("navigates back to course detail when courseId is present", async () => {
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();
    const { getByTestId } = render(ContentPage, {
      props: { courseId: 50, contentId: 501 },
    });

    await fireEvent.click(getByTestId("back-to-course-btn"));
    expect(gotoSpy).toHaveBeenCalledWith("/courses/50");
  });

  it("navigates to home when courseId is null", async () => {
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();
    const { getByTestId } = render(ContentPage, {
      props: { courseId: null, contentId: null },
    });

    await fireEvent.click(getByTestId("back-to-course-btn"));
    expect(gotoSpy).toHaveBeenCalledWith("/");
  });

  it("renders loading state when content is null", () => {
    coursesStore.setCourseContent(null);
    const { getByText } = render(ContentPage, {
      props: { courseId: 50, contentId: 501 },
    });

    expect(getByText("Memuat video pembelajaran...")).toBeDefined();
  });

  it("renders video iframe, title, and handles completion toggle", async () => {
    coursesStore.setCourse(mockCourseData as any);
    coursesStore.setCourseContent(mockCourseData.contents[0] as any);
    const learnSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentLearn").mockImplementation(async () => {});

    const { getByTestId, getByText } = render(ContentPage, {
      props: { courseId: 50, contentId: 501 },
    });

    expect(getByText("01. Pendahuluan")).toBeDefined();
    const iframe = getByTestId("video-iframe") as HTMLIFrameElement;
    expect(iframe.src).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");

    // Toggle unfinished -> finished
    const toggleBtn = getByTestId("toggle-learn-btn");
    expect(getByText("Tandai Sudah Selesai")).toBeDefined();
    await fireEvent.click(toggleBtn);
    expect(learnSpy).toHaveBeenCalledWith(501, true);
  });

  it("handles completion toggle for finished content", async () => {
    coursesStore.setCourse(mockCourseData as any);
    coursesStore.setCourseContent(mockCourseData.contents[1] as any);
    const learnSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentLearn").mockImplementation(async () => {});

    const { getByTestId, getByText } = render(ContentPage, {
      props: { courseId: 50, contentId: 502 },
    });

    expect(getByText("Selesai Dipelajari")).toBeDefined();
    const toggleBtn = getByTestId("toggle-learn-btn");
    expect(getByText("Tandai Belum Selesai")).toBeDefined();
    await fireEvent.click(toggleBtn);
    expect(learnSpy).toHaveBeenCalledWith(502, false);
  });

  it("handles next and previous playlist navigation", async () => {
    coursesStore.setCourse(mockCourseData as any);
    coursesStore.setCourseContent(mockCourseData.contents[1] as any);
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();

    const { getByTestId } = render(ContentPage, {
      props: { courseId: 50, contentId: 502 },
    });

    // Previous content button
    const prevBtn = getByTestId("prev-content-btn");
    await fireEvent.click(prevBtn);
    expect(gotoSpy).toHaveBeenCalledWith("/courses/50/contents/501");

    // Next content button
    const nextBtn = getByTestId("next-content-btn");
    await fireEvent.click(nextBtn);
    expect(gotoSpy).toHaveBeenCalledWith("/courses/50/contents/503");
  });

  it("handles various youtube url embed conversions", () => {
    // Test embed url format
    coursesStore.setCourse(mockCourseData as any);
    coursesStore.setCourseContent(mockCourseData.contents[2] as any);
    const { getByTestId, rerender } = render(ContentPage, {
      props: { courseId: 50, contentId: 503 },
    });
    let iframe = getByTestId("video-iframe") as HTMLIFrameElement;
    expect(iframe.src).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");

    // Test plain video id format
    coursesStore.setCourseContent(mockCourseData.contents[3] as any);
    rerender({ courseId: 50, contentId: 504 });
    iframe = getByTestId("video-iframe") as HTMLIFrameElement;
    expect(iframe.src).toBe("https://www.youtube.com/embed/plainVideoId123");

    // Test empty youtube string
    coursesStore.setCourseContent({ id: 505, title: "Empty", youtube: "" } as any);
    rerender({ courseId: 50, contentId: 505 });
    iframe = getByTestId("video-iframe") as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe("");
  });

  it("early returns on handleToggleLearn if content is null or id is falsy", async () => {
    coursesStore.setCourseContent({ id: 0, title: "No ID", youtube: "" } as any);
    const learnSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentLearn");

    const { getByTestId } = render(ContentPage, {
      props: { courseId: 50, contentId: 501 },
    });

    await fireEvent.click(getByTestId("toggle-learn-btn"));
    expect(learnSpy).not.toHaveBeenCalled();
  });

  it("reacts to learn status change success and reloads content & course", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(async () => {});

    render(ContentPage, {
      props: { courseId: 50, contentId: 501 },
    });

    coursesStore.setIsCourseContentLearned(true);
    coursesStore.setIsCourseContentLearn(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setContentSpy).toHaveBeenCalledWith(501);
    expect(setCourseSpy).toHaveBeenCalledWith(50);
  });

  it("handles learn status reaction when isCourseContentLearned is false", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(async () => {});

    render(ContentPage, { props: { courseId: 50, contentId: 501 } });
    setContentSpy.mockClear();
    setCourseSpy.mockClear();

    coursesStore.setIsCourseContentLearned(false);
    coursesStore.setIsCourseContentLearn(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setContentSpy).not.toHaveBeenCalled();
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("handles learn status reaction when courseId is null", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(async () => {});

    render(ContentPage, { props: { courseId: null, contentId: 501 } });
    setContentSpy.mockClear();
    setCourseSpy.mockClear();

    coursesStore.setIsCourseContentLearned(true);
    coursesStore.setIsCourseContentLearn(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setContentSpy).toHaveBeenCalledWith(501);
    expect(setCourseSpy).not.toHaveBeenCalled();
  });

  it("does not navigate when courseId is null on navigateTo", async () => {
    coursesStore.setCourse(mockCourseData as any);
    coursesStore.setCourseContent(mockCourseData.contents[1] as any);
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();

    const { getByTestId } = render(ContentPage, {
      props: { courseId: null, contentId: 502 },
    });

    await fireEvent.click(getByTestId("prev-content-btn"));
    expect(gotoSpy).not.toHaveBeenCalled();
  });
});
