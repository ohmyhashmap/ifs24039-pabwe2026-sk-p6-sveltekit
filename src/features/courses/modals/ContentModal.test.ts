import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import ContentModal from "./ContentModal.svelte";
import coursesStore from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ContentModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should not render modal when show is false", () => {
    const { queryByTestId } = render(ContentModal, { props: { show: false } });
    expect(queryByTestId("content-modal")).toBeNull();
  });

  it("should render modal for adding content when content prop is null", () => {
    const { getByTestId, getByText } = render(ContentModal, {
      props: { show: true, courseId: 1, content: null },
    });
    expect(getByTestId("content-modal")).toBeDefined();
    expect(getByText("Tambah Konten Video")).toBeDefined();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should render modal for editing content when content prop is provided", () => {
    const content = { id: 10, title: "SvelteKit Intro", youtube: "https://youtu.be/abc" };
    const { getByTestId, getByText } = render(ContentModal, {
      props: { show: true, courseId: 1, content },
    });
    expect(getByText("Ubah Konten Video")).toBeDefined();
    const titleInput = getByTestId("content-title-input") as HTMLInputElement;
    const ytInput = getByTestId("content-youtube-input") as HTMLInputElement;
    expect(titleInput.value).toBe("SvelteKit Intro");
    expect(ytInput.value).toBe("https://youtu.be/abc");
  });

  it("should handle close and cancel buttons with and without onClose prop", async () => {
    const onClose = vi.fn();
    const { getByTestId, rerender } = render(ContentModal, {
      props: { show: true, courseId: 1, onClose },
    });

    await fireEvent.click(getByTestId("close-content-modal-btn"));
    expect(onClose).toHaveBeenCalled();

    // Rerender without onClose and click cancel
    await rerender({ show: true, courseId: 1, onClose: undefined });
    await fireEvent.click(getByTestId("cancel-content-modal-btn"));
  });

  it("should validate empty title and empty youtube", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(ContentModal, { props: { show: true, courseId: 1 } });

    // Submit with empty title
    await fireEvent.submit(getByTestId("submit-content-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Judul konten tidak boleh kosong");

    // Submit with title but empty youtube
    const titleInput = getByTestId("content-title-input");
    await fireEvent.input(titleInput, { target: { value: "Konten Baru" } });
    await fireEvent.submit(getByTestId("submit-content-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Tautan video YouTube tidak boleh kosong");
  });

  it("should submit new content successfully", async () => {
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentAdd").mockImplementation(async () => {});
    const { getByTestId } = render(ContentModal, { props: { show: true, courseId: 1 } });

    await fireEvent.input(getByTestId("content-title-input"), { target: { value: "Video 1" } });
    await fireEvent.input(getByTestId("content-youtube-input"), { target: { value: "https://youtu.be/xyz" } });

    await fireEvent.submit(getByTestId("submit-content-modal-btn"));
    expect(addSpy).toHaveBeenCalledWith(1, "Video 1", "https://youtu.be/xyz");
  });

  it("should submit edited content successfully", async () => {
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentChange").mockImplementation(async () => {});
    const content = { id: 10, title: "Old Title", youtube: "https://youtu.be/old" };
    const { getByTestId } = render(ContentModal, { props: { show: true, courseId: 1, content } });

    await fireEvent.input(getByTestId("content-title-input"), { target: { value: "New Title" } });
    await fireEvent.input(getByTestId("content-youtube-input"), { target: { value: "https://youtu.be/new" } });

    await fireEvent.submit(getByTestId("submit-content-modal-btn"));
    expect(changeSpy).toHaveBeenCalledWith(10, "New Title", "https://youtu.be/new");
  });

  it("should handle save when both content and courseId are absent", async () => {
    const { getByTestId } = render(ContentModal, { props: { show: true, courseId: null, content: null } });

    await fireEvent.input(getByTestId("content-title-input"), { target: { value: "Video 1" } });
    await fireEvent.input(getByTestId("content-youtube-input"), { target: { value: "https://youtu.be/xyz" } });

    await fireEvent.submit(getByTestId("submit-content-modal-btn"));
  });

  it("should react to add content success", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();
    render(ContentModal, { props: { show: true, courseId: 1, onClose } });

    coursesStore.setIsCourseContentAdded(true);
    coursesStore.setIsCourseContentAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to add content success when courseId is null", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();
    render(ContentModal, { props: { show: true, courseId: null, onClose } });

    coursesStore.setIsCourseContentAdded(true);
    coursesStore.setIsCourseContentAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to add content failure", async () => {
    const onClose = vi.fn();
    render(ContentModal, { props: { show: true, courseId: 1, onClose } });

    coursesStore.setIsCourseContentAdded(false);
    coursesStore.setIsCourseContentAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should react to change content success", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(async () => {});
    const onClose = vi.fn();
    const content = { id: 10, title: "Title", youtube: "https://youtu.be/123" };
    render(ContentModal, { props: { show: true, courseId: 1, content, onClose } });

    coursesStore.setIsCourseContentChanged(true);
    coursesStore.setIsCourseContentChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(1);
    expect(setContentSpy).toHaveBeenCalledWith(10);
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to change content success when courseId and content id are falsy", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(async () => {});
    const onClose = vi.fn();
    const content = { id: 0, title: "Title", youtube: "https://youtu.be/123" };
    render(ContentModal, { props: { show: true, courseId: null, content, onClose } });

    coursesStore.setIsCourseContentChanged(true);
    coursesStore.setIsCourseContentChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).not.toHaveBeenCalled();
    expect(setContentSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to change content failure", async () => {
    const onClose = vi.fn();
    const content = { id: 10, title: "Title", youtube: "https://youtu.be/123" };
    render(ContentModal, { props: { show: true, courseId: 1, content, onClose } });

    coursesStore.setIsCourseContentChanged(false);
    coursesStore.setIsCourseContentChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });
});
