import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import coursesStore from "../states/coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should not render modal when show is false", () => {
    const { queryByTestId } = render(ChangeModal, {
      props: { show: false, courseId: 1 },
    });
    expect(queryByTestId("edit-course-modal")).toBeNull();
  });

  it("should render modal without loading course if courseId is null", () => {
    const getSpy = vi.spyOn(courseApi, "getCourseById");
    const { getByTestId } = render(ChangeModal, {
      props: { show: true, courseId: null },
    });
    expect(getByTestId("edit-course-modal")).toBeDefined();
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("should load course data successfully on show", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      user_id: 1,
      title: "Course Original",
      description: "Description Original",
    });

    const { getByTestId } = render(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 10));

    const titleInput = getByTestId("edit-course-title-input") as HTMLInputElement;
    expect(titleInput.value).toBe("Course Original");
  });

  it("should handle error when loading course data fails", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("API Error"));
    const onClose = vi.fn();

    render(ChangeModal, {
      props: { show: true, courseId: 1, onClose },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data kursus");
    expect(onClose).toHaveBeenCalled();
  });

  it("should handle close and cancel buttons with and without onClose prop", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      user_id: 1,
      title: "Course",
      description: "Desc",
    });

    const onClose = vi.fn();
    const { getByTestId, rerender } = render(ChangeModal, {
      props: { show: true, courseId: 1, onClose },
    });

    await new Promise((r) => setTimeout(r, 10));
    await fireEvent.click(getByTestId("close-edit-modal-btn"));
    expect(onClose).toHaveBeenCalled();

    // Rerender without onClose and click cancel
    await rerender({ show: true, courseId: 1, onClose: undefined });
    await fireEvent.click(getByTestId("cancel-edit-modal-btn"));
  });

  it("should validate empty title and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      user_id: 1,
      title: "",
      description: "",
    });

    const { getByTestId } = render(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 10));

    // Submit with empty title
    await fireEvent.submit(getByTestId("submit-edit-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    // Provide title, submit with empty description
    const titleInput = getByTestId("edit-course-title-input");
    await fireEvent.input(titleInput, { target: { value: "New Title" } });
    await fireEvent.submit(getByTestId("submit-edit-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should early return on handleSave if courseId is null", async () => {
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {});
    const { getByTestId } = render(ChangeModal, {
      props: { show: true, courseId: null },
    });

    const titleInput = getByTestId("edit-course-title-input");
    await fireEvent.input(titleInput, { target: { value: "Title" } });

    const descInput = getByTestId("edit-course-description-input");
    await fireEvent.input(descInput, { target: { value: "Desc" } });

    await fireEvent.submit(getByTestId("submit-edit-modal-btn"));
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should submit change course successfully", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      user_id: 1,
      title: "Course",
      description: "Desc",
    });
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {});

    const { getByTestId } = render(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 10));

    const titleInput = getByTestId("edit-course-title-input");
    await fireEvent.input(titleInput, { target: { value: "Updated Title" } });

    const descInput = getByTestId("edit-course-description-input");
    await fireEvent.input(descInput, { target: { value: "Updated Desc" } });

    await fireEvent.submit(getByTestId("submit-edit-modal-btn"));
    expect(changeSpy).toHaveBeenCalledWith(1, "Updated Title", "Updated Desc");
  });

  it("should react to successful course change and refresh store", async () => {
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();

    render(ChangeModal, {
      props: { show: true, courseId: 1, onClose },
    });

    coursesStore.setIsCourseChanged(true);
    coursesStore.setIsCourseChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCoursesSpy).toHaveBeenCalled();
    expect(setCourseSpy).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should handle course change success when courseId is null", async () => {
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();

    render(ChangeModal, {
      props: { show: true, courseId: null, onClose },
    });

    coursesStore.setIsCourseChanged(true);
    coursesStore.setIsCourseChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCoursesSpy).toHaveBeenCalled();
    expect(setCourseSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to failed course change", async () => {
    const onClose = vi.fn();

    render(ChangeModal, {
      props: { show: true, courseId: 1, onClose },
    });

    coursesStore.setIsCourseChanged(false);
    coursesStore.setIsCourseChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });
});
