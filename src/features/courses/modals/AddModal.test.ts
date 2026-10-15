import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import coursesStore from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should not render modal when show is false", () => {
    const { queryByTestId } = render(AddModal, { props: { show: false } });
    expect(queryByTestId("add-course-modal")).toBeNull();
  });

  it("should render modal when show is true and lock body scroll", () => {
    const { getByTestId } = render(AddModal, { props: { show: true } });
    expect(getByTestId("add-course-modal")).toBeDefined();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle close button click with and without onClose prop", async () => {
    const onClose = vi.fn();
    const { getByTestId, rerender } = render(AddModal, {
      props: { show: true, onClose },
    });

    await fireEvent.click(getByTestId("close-add-modal-btn"));
    expect(onClose).toHaveBeenCalled();

    // Rerender without onClose and click cancel
    await rerender({ show: true, onClose: undefined });
    await fireEvent.click(getByTestId("cancel-add-modal-btn"));
  });

  it("should validate empty title", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(AddModal, { props: { show: true } });

    await fireEvent.submit(getByTestId("submit-add-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should validate empty description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(AddModal, { props: { show: true } });

    const titleInput = getByTestId("add-course-title-input");
    await fireEvent.input(titleInput, { target: { value: "Kursus Baru" } });

    await fireEvent.submit(getByTestId("submit-add-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should call asyncSetIsCourseAdd on valid submit", async () => {
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {});
    const { getByTestId } = render(AddModal, { props: { show: true } });

    const titleInput = getByTestId("add-course-title-input");
    await fireEvent.input(titleInput, { target: { value: "Kursus Web" } });

    const descInput = getByTestId("add-course-description-input");
    await fireEvent.input(descInput, { target: { value: "Deskripsi silabus" } });

    await fireEvent.submit(getByTestId("submit-add-modal-btn"));
    expect(addSpy).toHaveBeenCalledWith("Kursus Web", "Deskripsi silabus");
  });

  it("should react to successful course addition", async () => {
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const onClose = vi.fn();
    render(AddModal, { props: { show: true, onClose } });

    coursesStore.setIsCourseAdded(true);
    coursesStore.setIsCourseAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCoursesSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to failed course addition", async () => {
    const onClose = vi.fn();
    render(AddModal, { props: { show: true, onClose } });

    coursesStore.setIsCourseAdded(false);
    coursesStore.setIsCourseAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });
});
