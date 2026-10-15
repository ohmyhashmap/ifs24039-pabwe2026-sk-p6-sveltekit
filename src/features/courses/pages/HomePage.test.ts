import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import HomePage from "./HomePage.svelte";
import coursesStore from "../states/coursesStore";
import usersStore from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as navigation from "$app/navigation";

describe("HomePage", () => {
  const mockProfile = {
    id: 1,
    name: "User 1",
    email: "user1@delcom.org",
    username: "user1",
  };

  const mockCourses = [
    {
      id: 101,
      user_id: 1,
      title: "Algoritma Pemrograman",
      description: "Dasar logika komputasi",
      cover: "https://example.com/cover1.jpg",
      students: [1, 2],
      total_contents: 5,
      avg_ratings: 4.5,
      author: { name: "User 1" },
    },
    {
      id: 102,
      user_id: 2,
      title: "Desain Antarmuka",
      description: "Prinsip UI/UX modern",
      cover: null,
      students: [2],
      contents: [{ id: 1, title: "C1", youtube: "https://youtu.be/1" }],
      avg_ratings: null,
      author: { name: "User 2" },
    },
    {
      id: 103,
      user_id: 3,
      title: "Jaringan Komputer",
      description: "Dasar protokol jaringan",
      cover: null,
      students: undefined,
      total_contents: undefined,
      contents: undefined,
      author: undefined,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    coursesStore.reset();
    usersStore.reset();
  });

  it("should not render content if profile is null", () => {
    usersStore.setProfile(null);
    const { queryByTestId } = render(HomePage);
    expect(queryByTestId("add-course-btn")).toBeNull();
  });

  it("should render courses and stats when profile is present", async () => {
    usersStore.setProfile(mockProfile);
    coursesStore.setCourses(mockCourses);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    const { findByText, findByTestId } = render(HomePage);

    expect(await findByText("Daftar Kursus")).toBeDefined();
    expect(await findByTestId("course-card-101")).toBeDefined();
    expect(await findByTestId("course-card-102")).toBeDefined();
    expect(await findByTestId("course-card-103")).toBeDefined();
    expect(await findByText("Algoritma Pemrograman")).toBeDefined();
    expect(await findByText("Desain Antarmuka")).toBeDefined();
  });

  it("should filter courses by search query", async () => {
    usersStore.setProfile(mockProfile);
    coursesStore.setCourses(mockCourses);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    const { findByTestId, queryByTestId } = render(HomePage);

    const searchInput = await findByTestId("course-search-input");
    await fireEvent.input(searchInput, { target: { value: "Algoritma" } });

    expect(await findByTestId("course-card-101")).toBeDefined();
    expect(queryByTestId("course-card-102")).toBeNull();

    // Search by description
    await fireEvent.input(searchInput, { target: { value: "UI/UX" } });
    expect(await findByTestId("course-card-102")).toBeDefined();

    // Search by author
    await fireEvent.input(searchInput, { target: { value: "User 1" } });
    expect(await findByTestId("course-card-101")).toBeDefined();

    // Search query matching nothing
    await fireEvent.input(searchInput, { target: { value: "xyznotfound" } });
    expect(queryByTestId("course-card-101")).toBeNull();
  });

  it("should reload courses when filter select is changed", async () => {
    usersStore.setProfile(mockProfile);
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    const { findByTestId } = render(HomePage);

    const filterSelect = await findByTestId("course-filter-select");
    await fireEvent.change(filterSelect, { target: { value: "1" } });

    expect(setCoursesSpy).toHaveBeenCalledWith("1");
  });

  it("should open and close AddModal", async () => {
    usersStore.setProfile(mockProfile);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    const { findByTestId, queryByTestId } = render(HomePage);

    expect(queryByTestId("add-course-modal")).toBeNull();
    const addBtn = await findByTestId("add-course-btn");
    await fireEvent.click(addBtn);
    expect(await findByTestId("add-course-modal")).toBeDefined();

    await fireEvent.click(await findByTestId("close-add-modal-btn"));
    expect(queryByTestId("add-course-modal")).toBeNull();
  });

  it("should handle delete all courses confirmed and cancelled", async () => {
    usersStore.setProfile(mockProfile);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const deleteAllSpy = vi.spyOn(coursesStore, "asyncSetIsCourseDeleteAll").mockImplementation(async () => {});

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const { findByTestId } = render(HomePage);

    await fireEvent.click(await findByTestId("delete-all-courses-btn"));
    expect(deleteAllSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await fireEvent.click(await findByTestId("delete-all-courses-btn"));
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should navigate to detail course page", async () => {
    usersStore.setProfile(mockProfile);
    coursesStore.setCourses(mockCourses);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();

    const { findByTestId } = render(HomePage);

    await fireEvent.click(await findByTestId("detail-course-btn-101"));

    expect(gotoSpy).toHaveBeenCalledWith("/courses/101");
  });

  it("should open ChangeModal for editing course owned by user", async () => {
    usersStore.setProfile(mockProfile);
    coursesStore.setCourses(mockCourses);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    const { findByTestId, queryByTestId } = render(HomePage);

    expect(queryByTestId("edit-course-modal")).toBeNull();
    await fireEvent.click(await findByTestId("edit-course-btn-101"));
    expect(await findByTestId("edit-course-modal")).toBeDefined();

    await fireEvent.click(await findByTestId("close-edit-modal-btn"));
    expect(queryByTestId("edit-course-modal")).toBeNull();
  });

  it("should handle delete course confirmed and cancelled", async () => {
    usersStore.setProfile(mockProfile);
    coursesStore.setCourses(mockCourses);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const deleteSpy = vi.spyOn(coursesStore, "asyncSetIsCourseDelete").mockImplementation(async () => {});

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const { findByTestId } = render(HomePage);

    await fireEvent.click(await findByTestId("delete-course-btn-101"));
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await fireEvent.click(await findByTestId("delete-course-btn-101"));
    expect(deleteSpy).toHaveBeenCalledWith(101);
  });

  it("should react to isCourseDeleted and reload courses", async () => {
    usersStore.setProfile(mockProfile);
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    render(HomePage);
    await new Promise((r) => setTimeout(r, 10));

    coursesStore.setIsCourseDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCoursesSpy).toHaveBeenCalled();
  });

  it("should react to isCourseDeletedAll and reload courses", async () => {
    usersStore.setProfile(mockProfile);
    const setCoursesSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    render(HomePage);
    await new Promise((r) => setTimeout(r, 10));

    coursesStore.setIsCourseDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setCoursesSpy).toHaveBeenCalled();
  });
});
