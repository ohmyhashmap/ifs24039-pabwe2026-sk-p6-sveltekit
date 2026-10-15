import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

describe("courseApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postCourse", () => {
    it("should send POST request and return data on success", async () => {
      const mockData = { id: 10 };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: mockData }),
      } as Response);

      const result = await courseApi.postCourse("Judul", "Deskripsi");
      expect(result).toEqual(mockData);
    });

    it("should throw error on fail status with message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal validasi" }),
      } as Response);

      await expect(courseApi.postCourse("Judul", "Deskripsi")).rejects.toThrow("Gagal validasi");
    });

    it("should throw error with fallback message if no message provided", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.postCourse("Judul", "Deskripsi")).rejects.toThrow("Gagal menambahkan kursus");
    });
  });

  describe("postCourseCover", () => {
    it("should send multipart POST request and return message on success", async () => {
      const file = new File(["dummy"], "my-cover.png", { type: "image/png" });
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      } as Response);

      const result = await courseApi.postCourseCover(1, file);
      expect(result).toBe("Berhasil mengubah cover");
    });

    it("should fallback filename if cover name is empty", async () => {
      const file = new File(["dummy"], "", { type: "image/jpeg" });
      Object.defineProperty(file, "name", { value: "" });

      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      } as Response);

      const result = await courseApi.postCourseCover(1, file);
      expect(result).toBe("Berhasil mengubah cover");
    });

    it("should throw error on failure", async () => {
      const file = new File(["dummy"], "c.jpg", { type: "image/jpeg" });
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.postCourseCover(1, file)).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("putCourse", () => {
    it("should send PUT request and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah data" }),
      } as Response);

      const result = await courseApi.putCourse(1, "Judul Baru", "Desc Baru");
      expect(result).toBe("Berhasil mengubah data");
    });

    it("should throw error on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.putCourse(1, "Judul", "Desc")).rejects.toThrow("Gagal mengubah kursus");
    });
  });

  describe("getCourses", () => {
    it("should fetch all courses when is_me is empty", async () => {
      const mockList = [{ id: 1, title: "Course 1" }];
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { courses: mockList } }),
      } as Response);

      const result = await courseApi.getCourses();
      expect(result).toEqual(mockList);
      expect(fetchSpy.mock.calls[0][0]).toContain("/courses/");
    });

    it("should fetch filtered courses when is_me is truthy", async () => {
      const mockList = [{ id: 2, title: "My Course" }];
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { courses: mockList } }),
      } as Response);

      const result = await courseApi.getCourses(1);
      expect(result).toEqual(mockList);
      expect(fetchSpy.mock.calls[0][0]).toContain("?is_me=1");
    });

    it("should return empty array when data or courses is undefined", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: null }),
      } as Response);

      const result = await courseApi.getCourses();
      expect(result).toEqual([]);
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.getCourses()).rejects.toThrow("Gagal mengambil data kursus");
    });
  });

  describe("getCourseById", () => {
    it("should fetch single course on success", async () => {
      const mockCourse = { id: 5, title: "Course Detail" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { course: mockCourse } }),
      } as Response);

      const result = await courseApi.getCourseById(5);
      expect(result).toEqual(mockCourse);
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.getCourseById(5)).rejects.toThrow("Gagal mengambil detail kursus");
    });
  });

  describe("deleteCourse", () => {
    it("should delete course and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus data" }),
      } as Response);

      const result = await courseApi.deleteCourse(3);
      expect(result).toBe("Berhasil menghapus data");
    });

    it("should throw error on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.deleteCourse(3)).rejects.toThrow("Gagal menghapus kursus");
    });
  });

  describe("deleteAllCourses", () => {
    it("should delete all courses and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus semua data kursus" }),
      } as Response);

      const result = await courseApi.deleteAllCourses();
      expect(result).toBe("Berhasil menghapus semua data kursus");
    });

    it("should throw error on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.deleteAllCourses()).rejects.toThrow("Gagal menghapus semua kursus");
    });
  });

  describe("postCourseStudent and deleteCourseStudent", () => {
    it("should join course as student on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menjadi pelajar pada kursus" }),
      } as Response);

      const result = await courseApi.postCourseStudent(2);
      expect(result).toBe("Berhasil menjadi pelajar pada kursus");
    });

    it("should throw error on postCourseStudent fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.postCourseStudent(2)).rejects.toThrow("Gagal bergabung ke kursus");
    });

    it("should leave course as student on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil keluar sebagai pelajar pada kursus" }),
      } as Response);

      const result = await courseApi.deleteCourseStudent(2);
      expect(result).toBe("Berhasil keluar sebagai pelajar pada kursus");
    });

    it("should throw error on deleteCourseStudent fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.deleteCourseStudent(2)).rejects.toThrow("Gagal keluar dari kursus");
    });
  });

  describe("putCourseStudentRating", () => {
    it("should submit rating and comment on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah ratings pada kursus" }),
      } as Response);

      const result = await courseApi.putCourseStudentRating(1, 5, "Bagus sekali!");
      expect(result).toBe("Berhasil mengubah ratings pada kursus");
    });

    it("should use empty comment fallback if omitted", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah ratings pada kursus" }),
      } as Response);

      await courseApi.putCourseStudentRating(1, 4);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it("should throw error on fail status", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.putCourseStudentRating(1, 5)).rejects.toThrow("Gagal mengubah rating kursus");
    });
  });

  describe("course contents API", () => {
    it("should post course content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { content_id: 1 } }),
      } as Response);

      const result = await courseApi.postCourseContent(1, "Video 1", "https://youtu.be/abc");
      expect(result).toEqual({ content_id: 1 });
    });

    it("should throw error on postCourseContent failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.postCourseContent(1, "Video 1", "https://youtu.be/abc")).rejects.toThrow("Gagal menambahkan konten kursus");
    });

    it("should put course content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah konten kursus" }),
      } as Response);

      const result = await courseApi.putCourseContent(10, "Updated Video", "https://youtu.be/xyz");
      expect(result).toBe("Berhasil mengubah konten kursus");
    });

    it("should throw error on putCourseContent failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.putCourseContent(10, "Updated Video", "https://youtu.be/xyz")).rejects.toThrow("Gagal mengubah konten kursus");
    });

    it("should get course content by id successfully", async () => {
      const mockContent = { id: 10, title: "Materi 1" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { course_content: mockContent } }),
      } as Response);

      const result = await courseApi.getCourseContentById(10);
      expect(result).toEqual(mockContent);
    });

    it("should throw error on getCourseContentById failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.getCourseContentById(10)).rejects.toThrow("Gagal mengambil detail konten kursus");
    });

    it("should delete course content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus konten kursus" }),
      } as Response);

      const result = await courseApi.deleteCourseContent(10);
      expect(result).toBe("Berhasil menghapus konten kursus");
    });

    it("should throw error on deleteCourseContent failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.deleteCourseContent(10)).rejects.toThrow("Gagal menghapus konten kursus");
    });

    it("should post course content learn status 1 and 0", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah status pembelajaran pada konten kursus" }),
      } as Response);

      const res1 = await courseApi.postCourseContentLearn(10, 1);
      expect(res1).toBe("Berhasil mengubah status pembelajaran pada konten kursus");

      const res0 = await courseApi.postCourseContentLearn(10, 0);
      expect(res0).toBe("Berhasil mengubah status pembelajaran pada konten kursus");
    });

    it("should throw error on postCourseContentLearn failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as Response);

      await expect(courseApi.postCourseContentLearn(10, 1)).rejects.toThrow("Gagal mengubah status belajar");
    });
  });
});
