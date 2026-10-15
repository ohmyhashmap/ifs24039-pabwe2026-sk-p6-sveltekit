import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import RatingModal from "./RatingModal.svelte";
import coursesStore from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("RatingModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should not render modal when show is false and handle show transition", async () => {
    const { queryByTestId, rerender } = render(RatingModal, { props: { show: false } });
    expect(queryByTestId("rating-modal")).toBeNull();
    await rerender({ show: true, courseId: 1 });
    expect(document.body.style.overflow).toBe("hidden");
    await rerender({ show: false });
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render modal when show is true and display unselected stars", () => {
    const { getByTestId, getByText } = render(RatingModal, {
      props: { show: true, courseId: 1, initialRating: 3, initialComment: "Bagus!" },
    });
    expect(getByTestId("rating-modal")).toBeDefined();
    expect(getByText("Beri Rating Kursus")).toBeDefined();
    expect(getByTestId("star-4").innerHTML).toContain("text-slate-300");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should allow selecting star ratings", async () => {
    const { getByTestId, getByText } = render(RatingModal, {
      props: { show: true, courseId: 1 },
    });

    await fireEvent.click(getByTestId("star-1"));
    expect(getByText("1 / 5")).toBeDefined();

    await fireEvent.click(getByTestId("star-2"));
    expect(getByText("2 / 5")).toBeDefined();

    await fireEvent.click(getByTestId("star-3"));
    expect(getByText("3 / 5")).toBeDefined();

    await fireEvent.click(getByTestId("star-5"));
    expect(getByText("5 / 5")).toBeDefined();
  });

  it("should handle close and cancel buttons with and without onClose prop", async () => {
    const onClose = vi.fn();
    const { getByTestId, rerender } = render(RatingModal, {
      props: { show: true, courseId: 1, onClose },
    });

    await fireEvent.click(getByTestId("close-rating-modal-btn"));
    expect(onClose).toHaveBeenCalled();

    // Rerender without onClose and click cancel
    await rerender({ show: true, courseId: 1, onClose: undefined });
    await fireEvent.click(getByTestId("cancel-rating-modal-btn"));
  });

  it("should validate rating range", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();
    const { getByTestId } = render(RatingModal, {
      props: { show: true, courseId: 1, initialRating: 0 },
    });

    await fireEvent.submit(getByTestId("submit-rating-modal-btn"));
    expect(errorSpy).toHaveBeenCalledWith("Rating harus antara 1 sampai 5 bintang");
  });

  it("should early return on handleSave if courseId is null", async () => {
    const ratingSpy = vi.spyOn(coursesStore, "asyncSetIsCourseStudentRating");
    const { getByTestId } = render(RatingModal, {
      props: { show: true, courseId: null },
    });

    await fireEvent.submit(getByTestId("submit-rating-modal-btn"));
    expect(ratingSpy).not.toHaveBeenCalled();
  });

  it("should submit rating successfully", async () => {
    const ratingSpy = vi.spyOn(coursesStore, "asyncSetIsCourseStudentRating").mockImplementation(async () => {});
    const { getByTestId } = render(RatingModal, {
      props: { show: true, courseId: 1 },
    });

    await fireEvent.click(getByTestId("star-4"));
    await fireEvent.input(getByTestId("rating-comment-input"), { target: { value: "Materi sangat jelas" } });
    await fireEvent.submit(getByTestId("submit-rating-modal-btn"));

    expect(ratingSpy).toHaveBeenCalledWith(1, 4, "Materi sangat jelas");
  });

  it("should react to rating success", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();
    render(RatingModal, { props: { show: true, courseId: 1, onClose } });

    coursesStore.setIsCourseStudentRated(true);
    coursesStore.setIsCourseStudentRating(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to rating success when courseId is null", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});
    const onClose = vi.fn();
    render(RatingModal, { props: { show: true, courseId: null, onClose } });

    coursesStore.setIsCourseStudentRated(true);
    coursesStore.setIsCourseStudentRating(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should react to rating failure", async () => {
    const onClose = vi.fn();
    render(RatingModal, { props: { show: true, courseId: 1, onClose } });

    coursesStore.setIsCourseStudentRated(false);
    coursesStore.setIsCourseStudentRating(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should return correct class from getStarClass helper", () => {
    const { component } = render(RatingModal, { props: { show: true, courseId: 1 } });
    expect((component as any).getStarClass(1, 3)).toContain("fill-amber-400");
    expect((component as any).getStarClass(4, 3)).toContain("text-slate-300");
  });

  it("should handle null initialRating gracefully", () => {
    const { getByTestId } = render(RatingModal, {
      props: { show: true, courseId: 1, initialRating: null as any },
    });
    expect(getByTestId("rating-modal")).toBeDefined();
  });
});
