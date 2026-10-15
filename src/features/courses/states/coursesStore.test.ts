import { describe, it, expect, vi, beforeEach } from "vitest";
import coursesStore, { useCoursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("coursesStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
  });

  it("should return coursesStore from useCoursesStore", () => {
    expect(useCoursesStore()).toBe(coursesStore);
  });

  it("should have correct initial state and getters", () => {
    expect(coursesStore.courses).toEqual([]);
    expect(coursesStore.course).toBeNull();
    expect(coursesStore.courseContent).toBeNull();
    expect(coursesStore.isCourse).toBe(false);
    expect(coursesStore.isCourseAdd).toBe(false);
    expect(coursesStore.isCourseAdded).toBe(false);
    expect(coursesStore.isCourseChange).toBe(false);
    expect(coursesStore.isCourseChanged).toBe(false);
    expect(coursesStore.isCourseChangeCover).toBe(false);
    expect(coursesStore.isCourseChangedCover).toBe(false);
    expect(coursesStore.isCourseDelete).toBe(false);
    expect(coursesStore.isCourseDeleted).toBe(false);
    expect(coursesStore.isCourseDeleteAll).toBe(false);
    expect(coursesStore.isCourseDeletedAll).toBe(false);
    expect(coursesStore.isCourseStudentJoin).toBe(false);
    expect(coursesStore.isCourseStudentJoined).toBe(false);
    expect(coursesStore.isCourseStudentLeave).toBe(false);
    expect(coursesStore.isCourseStudentLeft).toBe(false);
    expect(coursesStore.isCourseStudentRating).toBe(false);
    expect(coursesStore.isCourseStudentRated).toBe(false);
    expect(coursesStore.isCourseContent).toBe(false);
    expect(coursesStore.isCourseContentAdd).toBe(false);
    expect(coursesStore.isCourseContentAdded).toBe(false);
    expect(coursesStore.isCourseContentChange).toBe(false);
    expect(coursesStore.isCourseContentChanged).toBe(false);
    expect(coursesStore.isCourseContentDelete).toBe(false);
    expect(coursesStore.isCourseContentDeleted).toBe(false);
    expect(coursesStore.isCourseContentLearn).toBe(false);
    expect(coursesStore.isCourseContentLearned).toBe(false);
    expect(coursesStore.$state).toBeDefined();
  });

  it("should update state using setters", () => {
    coursesStore.setCourses([{ id: 1, user_id: 1, title: "T", description: "D" }]);
    expect(coursesStore.courses.length).toBe(1);

    coursesStore.setCourse({ id: 1, user_id: 1, title: "T", description: "D" });
    expect(coursesStore.course?.title).toBe("T");

    coursesStore.setCourseContent({ id: 1, title: "C1", youtube: "https://youtu.be/xxx" });
    expect(coursesStore.courseContent?.title).toBe("C1");

    coursesStore.setIsCourse(true);
    expect(coursesStore.isCourse).toBe(true);

    coursesStore.setIsCourseAdd(true);
    expect(coursesStore.isCourseAdd).toBe(true);

    coursesStore.setIsCourseAdded(true);
    expect(coursesStore.isCourseAdded).toBe(true);

    coursesStore.setIsCourseChange(true);
    expect(coursesStore.isCourseChange).toBe(true);

    coursesStore.setIsCourseChanged(true);
    expect(coursesStore.isCourseChanged).toBe(true);

    coursesStore.setIsCourseChangeCover(true);
    expect(coursesStore.isCourseChangeCover).toBe(true);

    coursesStore.setIsCourseChangedCover(true);
    expect(coursesStore.isCourseChangedCover).toBe(true);

    coursesStore.setIsCourseDelete(true);
    expect(coursesStore.isCourseDelete).toBe(true);

    coursesStore.setIsCourseDeleted(true);
    expect(coursesStore.isCourseDeleted).toBe(true);

    coursesStore.setIsCourseDeleteAll(true);
    expect(coursesStore.isCourseDeleteAll).toBe(true);

    coursesStore.setIsCourseDeletedAll(true);
    expect(coursesStore.isCourseDeletedAll).toBe(true);

    coursesStore.setIsCourseStudentJoin(true);
    expect(coursesStore.isCourseStudentJoin).toBe(true);

    coursesStore.setIsCourseStudentJoined(true);
    expect(coursesStore.isCourseStudentJoined).toBe(true);

    coursesStore.setIsCourseStudentLeave(true);
    expect(coursesStore.isCourseStudentLeave).toBe(true);

    coursesStore.setIsCourseStudentLeft(true);
    expect(coursesStore.isCourseStudentLeft).toBe(true);

    coursesStore.setIsCourseStudentRating(true);
    expect(coursesStore.isCourseStudentRating).toBe(true);

    coursesStore.setIsCourseStudentRated(true);
    expect(coursesStore.isCourseStudentRated).toBe(true);

    coursesStore.setIsCourseContent(true);
    expect(coursesStore.isCourseContent).toBe(true);

    coursesStore.setIsCourseContentAdd(true);
    expect(coursesStore.isCourseContentAdd).toBe(true);

    coursesStore.setIsCourseContentAdded(true);
    expect(coursesStore.isCourseContentAdded).toBe(true);

    coursesStore.setIsCourseContentChange(true);
    expect(coursesStore.isCourseContentChange).toBe(true);

    coursesStore.setIsCourseContentChanged(true);
    expect(coursesStore.isCourseContentChanged).toBe(true);

    coursesStore.setIsCourseContentDelete(true);
    expect(coursesStore.isCourseContentDelete).toBe(true);

    coursesStore.setIsCourseContentDeleted(true);
    expect(coursesStore.isCourseContentDeleted).toBe(true);

    coursesStore.setIsCourseContentLearn(true);
    expect(coursesStore.isCourseContentLearn).toBe(true);

    coursesStore.setIsCourseContentLearned(true);
    expect(coursesStore.isCourseContentLearned).toBe(true);
  });

  it("should reset state with custom partial values", () => {
    coursesStore.reset({ isCourse: true });
    expect(coursesStore.isCourse).toBe(true);
    expect(coursesStore.courses).toEqual([]);
  });

  describe("asyncSetCourses", () => {
    it("should set courses on success", async () => {
      const mockCourses = [{ id: 1, user_id: 1, title: "C1", description: "D1" }];
      vi.spyOn(courseApi, "getCourses").mockResolvedValue(mockCourses);

      await coursesStore.asyncSetCourses();
      expect(coursesStore.courses).toEqual(mockCourses);
    });

    it("should set empty array on failure", async () => {
      vi.spyOn(courseApi, "getCourses").mockRejectedValue(new Error("API Error"));

      await coursesStore.asyncSetCourses();
      expect(coursesStore.courses).toEqual([]);
    });
  });

  describe("asyncSetCourse", () => {
    it("should set course on success", async () => {
      const mockCourse = { id: 1, user_id: 1, title: "C1", description: "D1" };
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse);

      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toEqual(mockCourse);
      expect(coursesStore.isCourse).toBe(true);
    });

    it("should set course to null on failure", async () => {
      vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("API Error"));

      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toBeNull();
      expect(coursesStore.isCourse).toBe(true);
    });
  });

  describe("asyncSetIsCourseAdd", () => {
    it("should handle success", async () => {
      vi.spyOn(courseApi, "postCourse").mockResolvedValue({ id: 1 });
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseAdd("Title", "Desc");
      expect(dialogSpy).toHaveBeenCalledWith("Kursus berhasil ditambahkan!");
      expect(coursesStore.isCourseAdded).toBe(true);
      expect(coursesStore.isCourseAdd).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "postCourse").mockRejectedValue(new Error("Fail Add"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseAdd("Title", "Desc");
      expect(dialogSpy).toHaveBeenCalledWith("Fail Add");
      expect(coursesStore.isCourseAdded).toBe(false);
      expect(coursesStore.isCourseAdd).toBe(true);
    });
  });

  describe("asyncSetIsCourseChange", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("Berhasil diubah custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChange(1, "Title", "Desc");
      expect(dialogSpy).toHaveBeenCalledWith("Berhasil diubah custom");
      expect(coursesStore.isCourseChanged).toBe(true);
      expect(coursesStore.isCourseChange).toBe(true);
    });

    it("should handle success with default message if empty", async () => {
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChange(1, "Title", "Desc");
      expect(dialogSpy).toHaveBeenCalledWith("Kursus berhasil diubah!");
      expect(coursesStore.isCourseChanged).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "putCourse").mockRejectedValue(new Error("Fail Edit"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChange(1, "Title", "Desc");
      expect(dialogSpy).toHaveBeenCalledWith("Fail Edit");
      expect(coursesStore.isCourseChanged).toBe(false);
      expect(coursesStore.isCourseChange).toBe(true);
    });
  });

  describe("asyncSetIsCourseChangeCover", () => {
    it("should handle success with custom message", async () => {
      const file = new File(["cover"], "cover.jpg", { type: "image/jpeg" });
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("Berhasil ubah cover custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChangeCover(1, file);
      expect(dialogSpy).toHaveBeenCalledWith("Berhasil ubah cover custom");
      expect(coursesStore.isCourseChangedCover).toBe(true);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });

    it("should handle success with default message", async () => {
      const file = new File(["cover"], "cover.jpg", { type: "image/jpeg" });
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChangeCover(1, file);
      expect(dialogSpy).toHaveBeenCalledWith("Cover kursus berhasil diubah!");
      expect(coursesStore.isCourseChangedCover).toBe(true);
    });

    it("should handle failure", async () => {
      const file = new File(["cover"], "cover.jpg", { type: "image/jpeg" });
      vi.spyOn(courseApi, "postCourseCover").mockRejectedValue(new Error("Cover fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseChangeCover(1, file);
      expect(dialogSpy).toHaveBeenCalledWith("Cover fail");
      expect(coursesStore.isCourseChangedCover).toBe(false);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsCourseDelete", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("Dihapus custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Dihapus custom");
      expect(coursesStore.isCourseDeleted).toBe(true);
      expect(coursesStore.isCourseDelete).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Kursus berhasil dihapus!");
      expect(coursesStore.isCourseDeleted).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockRejectedValue(new Error("Delete fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Delete fail");
      expect(coursesStore.isCourseDeleted).toBe(false);
      expect(coursesStore.isCourseDelete).toBe(true);
    });
  });

  describe("asyncSetIsCourseDeleteAll", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "deleteAllCourses").mockResolvedValue("Semua dihapus custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(dialogSpy).toHaveBeenCalledWith("Semua dihapus custom");
      expect(coursesStore.isCourseDeletedAll).toBe(true);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "deleteAllCourses").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(dialogSpy).toHaveBeenCalledWith("Semua kursus berhasil dihapus!");
      expect(coursesStore.isCourseDeletedAll).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "deleteAllCourses").mockRejectedValue(new Error("Delete all fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(dialogSpy).toHaveBeenCalledWith("Delete all fail");
      expect(coursesStore.isCourseDeletedAll).toBe(false);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });
  });

  describe("asyncSetIsCourseStudentJoin", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "postCourseStudent").mockResolvedValue("Join custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentJoin(1);
      expect(dialogSpy).toHaveBeenCalledWith("Join custom");
      expect(coursesStore.isCourseStudentJoined).toBe(true);
      expect(coursesStore.isCourseStudentJoin).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "postCourseStudent").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentJoin(1);
      expect(dialogSpy).toHaveBeenCalledWith("Berhasil bergabung ke kursus!");
      expect(coursesStore.isCourseStudentJoined).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "postCourseStudent").mockRejectedValue(new Error("Join fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentJoin(1);
      expect(dialogSpy).toHaveBeenCalledWith("Join fail");
      expect(coursesStore.isCourseStudentJoined).toBe(false);
      expect(coursesStore.isCourseStudentJoin).toBe(true);
    });
  });

  describe("asyncSetIsCourseStudentLeave", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "deleteCourseStudent").mockResolvedValue("Leave custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentLeave(1);
      expect(dialogSpy).toHaveBeenCalledWith("Leave custom");
      expect(coursesStore.isCourseStudentLeft).toBe(true);
      expect(coursesStore.isCourseStudentLeave).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "deleteCourseStudent").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentLeave(1);
      expect(dialogSpy).toHaveBeenCalledWith("Berhasil keluar dari kursus!");
      expect(coursesStore.isCourseStudentLeft).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "deleteCourseStudent").mockRejectedValue(new Error("Leave fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentLeave(1);
      expect(dialogSpy).toHaveBeenCalledWith("Leave fail");
      expect(coursesStore.isCourseStudentLeft).toBe(false);
      expect(coursesStore.isCourseStudentLeave).toBe(true);
    });
  });

  describe("asyncSetIsCourseStudentRating", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "putCourseStudentRating").mockResolvedValue("Rating custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentRating(1, 5, "Good");
      expect(dialogSpy).toHaveBeenCalledWith("Rating custom");
      expect(coursesStore.isCourseStudentRated).toBe(true);
      expect(coursesStore.isCourseStudentRating).toBe(true);
    });

    it("should handle success with default message and comment default", async () => {
      vi.spyOn(courseApi, "putCourseStudentRating").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentRating(1, 4);
      expect(dialogSpy).toHaveBeenCalledWith("Berhasil memberikan rating!");
      expect(coursesStore.isCourseStudentRated).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "putCourseStudentRating").mockRejectedValue(new Error("Rating fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseStudentRating(1, 3);
      expect(dialogSpy).toHaveBeenCalledWith("Rating fail");
      expect(coursesStore.isCourseStudentRated).toBe(false);
      expect(coursesStore.isCourseStudentRating).toBe(true);
    });
  });

  describe("asyncSetCourseContent", () => {
    it("should set content on success", async () => {
      const mockContent = { id: 1, title: "Content 1", youtube: "https://youtu.be/123" };
      vi.spyOn(courseApi, "getCourseContentById").mockResolvedValue(mockContent);

      await coursesStore.asyncSetCourseContent(1);
      expect(coursesStore.courseContent).toEqual(mockContent);
      expect(coursesStore.isCourseContent).toBe(true);
    });

    it("should set content to null on failure", async () => {
      vi.spyOn(courseApi, "getCourseContentById").mockRejectedValue(new Error("Get content fail"));

      await coursesStore.asyncSetCourseContent(1);
      expect(coursesStore.courseContent).toBeNull();
      expect(coursesStore.isCourseContent).toBe(true);
    });
  });

  describe("asyncSetIsCourseContentAdd", () => {
    it("should handle success", async () => {
      vi.spyOn(courseApi, "postCourseContent").mockResolvedValue({ id: 1 });
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentAdd(1, "Title", "https://youtu.be/xyz");
      expect(dialogSpy).toHaveBeenCalledWith("Konten kursus berhasil ditambahkan!");
      expect(coursesStore.isCourseContentAdded).toBe(true);
      expect(coursesStore.isCourseContentAdd).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "postCourseContent").mockRejectedValue(new Error("Add content fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentAdd(1, "Title", "https://youtu.be/xyz");
      expect(dialogSpy).toHaveBeenCalledWith("Add content fail");
      expect(coursesStore.isCourseContentAdded).toBe(false);
      expect(coursesStore.isCourseContentAdd).toBe(true);
    });
  });

  describe("asyncSetIsCourseContentChange", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "putCourseContent").mockResolvedValue("Update content custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentChange(1, "Title", "https://youtu.be/xyz");
      expect(dialogSpy).toHaveBeenCalledWith("Update content custom");
      expect(coursesStore.isCourseContentChanged).toBe(true);
      expect(coursesStore.isCourseContentChange).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "putCourseContent").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentChange(1, "Title", "https://youtu.be/xyz");
      expect(dialogSpy).toHaveBeenCalledWith("Konten kursus berhasil diubah!");
      expect(coursesStore.isCourseContentChanged).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "putCourseContent").mockRejectedValue(new Error("Change content fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentChange(1, "Title", "https://youtu.be/xyz");
      expect(dialogSpy).toHaveBeenCalledWith("Change content fail");
      expect(coursesStore.isCourseContentChanged).toBe(false);
      expect(coursesStore.isCourseContentChange).toBe(true);
    });
  });

  describe("asyncSetIsCourseContentDelete", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "deleteCourseContent").mockResolvedValue("Delete content custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Delete content custom");
      expect(coursesStore.isCourseContentDeleted).toBe(true);
      expect(coursesStore.isCourseContentDelete).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "deleteCourseContent").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Konten kursus berhasil dihapus!");
      expect(coursesStore.isCourseContentDeleted).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "deleteCourseContent").mockRejectedValue(new Error("Delete content fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentDelete(1);
      expect(dialogSpy).toHaveBeenCalledWith("Delete content fail");
      expect(coursesStore.isCourseContentDeleted).toBe(false);
      expect(coursesStore.isCourseContentDelete).toBe(true);
    });
  });

  describe("asyncSetIsCourseContentLearn", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(courseApi, "postCourseContentLearn").mockResolvedValue("Learn custom");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentLearn(1, 1);
      expect(dialogSpy).toHaveBeenCalledWith("Learn custom");
      expect(coursesStore.isCourseContentLearned).toBe(true);
      expect(coursesStore.isCourseContentLearn).toBe(true);
    });

    it("should handle success with default message", async () => {
      vi.spyOn(courseApi, "postCourseContentLearn").mockResolvedValue("");
      const dialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentLearn(1, false);
      expect(dialogSpy).toHaveBeenCalledWith("Status pembelajaran berhasil diperbarui!");
      expect(coursesStore.isCourseContentLearned).toBe(true);
    });

    it("should handle failure", async () => {
      vi.spyOn(courseApi, "postCourseContentLearn").mockRejectedValue(new Error("Learn fail"));
      const dialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockReturnValue();

      await coursesStore.asyncSetIsCourseContentLearn(1, true);
      expect(dialogSpy).toHaveBeenCalledWith("Learn fail");
      expect(coursesStore.isCourseContentLearned).toBe(false);
      expect(coursesStore.isCourseContentLearn).toBe(true);
    });
  });
});
