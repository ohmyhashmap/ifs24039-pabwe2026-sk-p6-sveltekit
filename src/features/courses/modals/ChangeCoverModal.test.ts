import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import coursesStore from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockCourse = {
    id: 1,
    user_id: 1,
    title: "Course 1",
    description: "Desc 1",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:preview-url");
  });

  it("should not render modal when show is false or course is null", () => {
    const { queryByTestId, rerender } = render(ChangeCoverModal, {
      props: { show: false, course: mockCourse },
    });
    expect(queryByTestId("change-cover-modal")).toBeNull();

    rerender({ show: true, course: null });
    expect(queryByTestId("change-cover-modal")).toBeNull();
  });

  it("should render modal when show is true and course is provided", () => {
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });
    expect(getByTestId("change-cover-modal")).toBeDefined();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle close and cancel buttons with and without onClose prop", async () => {
    const onClose = vi.fn();
    const { getByTestId, rerender } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse, onClose },
    });

    await fireEvent.click(getByTestId("close-cover-modal-btn"));
    expect(onClose).toHaveBeenCalled();

    // Rerender without onClose and click cancel
    await rerender({ show: true, course: mockCourse, onClose: undefined });
    await fireEvent.click(getByTestId("cancel-cover-modal-btn"));
  });

  it("should handle empty file selection", async () => {
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [] } });
  });

  it("should validate file type", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    const invalidFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar (JPG/PNG)!");
  });

  it("should validate file size", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(errorSpy).toHaveBeenCalledWith("Ukuran gambar maksimal 1MB!");
  });

  it("should preview selected valid image", async () => {
    const { getByTestId, getByAltText } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    const validFile = new File(["test-image"], "cover.jpg", { type: "image/jpeg" });
    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [validFile] } });

    const previewImg = getByAltText("Preview") as HTMLImageElement;
    expect(previewImg.src).toBe("blob:preview-url");
  });

  it("should validate if submit without choosing a file", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    await fireEvent.submit(getByTestId("submit-cover-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih cover baru!");
  });

  it("should early return on handleSave if course id is missing", async () => {
    const changeCoverSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover");
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: { ...mockCourse, id: 0 } },
    });

    const validFile = new File(["test-image"], "cover.jpg", { type: "image/jpeg" });
    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [validFile] } });

    await fireEvent.submit(getByTestId("submit-cover-modal-btn"));
    expect(changeCoverSpy).not.toHaveBeenCalled();
  });

  it("should submit change cover successfully with valid file", async () => {
    const changeCoverSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {});
    const { getByTestId } = render(ChangeCoverModal, {
      props: { show: true, course: mockCourse },
    });

    const validFile = new File(["test-image"], "cover.jpg", { type: "image/jpeg" });
    const fileInput = getByTestId("cover-file-input");
    await fireEvent.change(fileInput, { target: { files: [validFile] } });

    await fireEvent.submit(getByTestId("submit-cover-modal-btn"));
    expect(changeCoverSpy).toHaveBeenCalledWith(1, validFile);
  });

  it("should react to successful cover change", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const onClose = vi.fn();

    render(ChangeCoverModal, {
      props: { show: true, course: mockCourse, onClose },
    });

    coursesStore.setIsCourseChangedCover(true);
    coursesStore.setIsCourseChangeCover(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(1);
    expect(setCoursesSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to successful cover change when course id is falsy", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();

    render(ChangeCoverModal, {
      props: { show: true, course: { ...mockCourse, id: 0 }, onClose },
    });

    coursesStore.setIsCourseChangedCover(true);
    coursesStore.setIsCourseChangeCover(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to failed cover change", async () => {
    const onClose = vi.fn();

    render(ChangeCoverModal, {
      props: { show: true, course: mockCourse, onClose },
    });

    coursesStore.setIsCourseChangedCover(false);
    coursesStore.setIsCourseChangeCover(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });
});
