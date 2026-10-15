import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import NavbarComponent from "./NavbarComponent.svelte";
import * as navigation from "$app/navigation";

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with default props (null profile)", () => {
    const { getByText, getByTestId } = render(NavbarComponent);
    expect(getByText("Delcom Courses")).toBeDefined();
    expect(getByText("U")).toBeDefined();
    expect(getByText("Pengguna")).toBeDefined();
    expect(getByTestId("toggle-sidebar-btn")).toBeDefined();
  });

  it("renders with profile photo and details", () => {
    const profile = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      photo: "https://example.com/photo.jpg",
    };
    const { getByText, getByAltText } = render(NavbarComponent, {
      props: { profile },
    });
    expect(getByText("John Doe")).toBeDefined();
    expect(getByText("john@example.com")).toBeDefined();
    const img = getByAltText("John Doe") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/photo.jpg");
  });

  it("handles sidebar toggle button with and without onToggleSidebar callback", async () => {
    const onToggleSidebar = vi.fn();
    const { getByTestId, rerender } = render(NavbarComponent, {
      props: { isSidebarOpen: false, onToggleSidebar },
    });

    const btn = getByTestId("toggle-sidebar-btn");
    await fireEvent.click(btn);
    expect(onToggleSidebar).toHaveBeenCalled();

    // Rerender with isSidebarOpen: true and without onToggleSidebar
    await rerender({ isSidebarOpen: true, onToggleSidebar: undefined });
    await fireEvent.click(btn);
  });

  it("toggles profile dropdown menu and handles click outside", async () => {
    const { getByTestId, queryByTestId } = render(NavbarComponent, {
      props: { profile: { id: 1, name: "Alice", email: "alice@del.ac.id", username: "alice" } },
    });

    expect(queryByTestId("profile-dropdown-menu")).toBeNull();

    const dropdownBtn = getByTestId("profile-dropdown-button");
    await fireEvent.click(dropdownBtn);
    expect(getByTestId("profile-dropdown-menu")).toBeDefined();

    // Click inside should not close
    const menu = getByTestId("profile-dropdown-menu");
    await fireEvent.mouseDown(menu);
    expect(getByTestId("profile-dropdown-menu")).toBeDefined();

    // Click outside should close
    await fireEvent.mouseDown(document.body);
    expect(queryByTestId("profile-dropdown-menu")).toBeNull();
  });

  it("handles profile navigation click", async () => {
    const gotoSpy = vi.spyOn(navigation, "goto").mockResolvedValue();
    const { getByTestId } = render(NavbarComponent);

    await fireEvent.click(getByTestId("profile-dropdown-button"));
    const profileLink = getByTestId("dropdown-profile-link");
    await fireEvent.click(profileLink);

    expect(gotoSpy).toHaveBeenCalledWith("/profile");
  });

  it("handles logout click with and without onLogout prop", async () => {
    const onLogout = vi.fn();
    const { getByTestId, rerender } = render(NavbarComponent, {
      props: { onLogout },
    });

    await fireEvent.click(getByTestId("profile-dropdown-button"));
    await fireEvent.click(getByTestId("dropdown-logout-button"));
    expect(onLogout).toHaveBeenCalled();

    // Without onLogout
    await rerender({ onLogout: undefined });
    await fireEvent.click(getByTestId("profile-dropdown-button"));
    await fireEvent.click(getByTestId("dropdown-logout-button"));
  });

  it("removes document mousedown listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(NavbarComponent);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
  });
});
