import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "../../components/Navbar.svelte";
import Sidebar from "../../components/Sidebar.svelte";
import { authStore } from "../../features/auth/states/authStore";
import { mockFetch, ok, resetStores, setPage, signIn, user } from "../utils";

describe("Navbar", () => {
  beforeEach(resetStores);

  it("menampilkan profil, membuka menu, dan keluar", async () => {
    signIn(user({ name: "Abdullah Ubaid" }));
    const { calls } = mockFetch({ "POST /auth/logout": ok("Berhasil logout") });
    const onmenu = vi.fn();
    render(Navbar, { props: { onmenu } });

    expect(screen.getByRole("link", { name: /Abdullah Ubaid/ })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "Beranda Delcom Courses" })).toHaveAttribute("href", "/");

    await fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onmenu).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    await waitFor(() => expect(get(authStore).token).toBeNull());
    expect(calls[0].path).toBe("/auth/logout");
  });

  it("tidak menampilkan tautan profil bila profil belum ada", () => {
    render(Navbar, { props: { onmenu: vi.fn() } });
    expect(screen.queryByRole("link", { name: /profile/i })).toBeNull();
    expect(screen.queryByText("Delcom Testing")).toBeNull();
  });
});

describe("Sidebar", () => {
  it("memuat menu utama berlabel Semua Kursus", () => {
    setPage("/");
    render(Sidebar, { props: { onnavigate: vi.fn() } });
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profile");
    expect(screen.getByLabelText("Menu samping")).toHaveAttribute("data-open", "false");
  });

  it.each([
    ["/", "Semua Kursus"],
    ["/courses/3", "Semua Kursus"],
    ["/courses/3/contents/10", "Semua Kursus"],
    ["/users", "Pengguna"],
    ["/profile", "Profil"],
  ])("menandai menu aktif untuk %s", (path, label) => {
    setPage(path);
    render(Sidebar, { props: { onnavigate: vi.fn() } });
    const active = screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page");
    expect(active.map((a) => a.textContent?.trim())).toEqual([label]);
  });

  it("terbuka pada layar kecil dan memanggil onnavigate saat tautan diklik", async () => {
    setPage("/users");
    const onnavigate = vi.fn();
    const { container, rerender } = render(Sidebar, { props: { open: false, onnavigate } });
    container.addEventListener("click", (event) => event.preventDefault());
    expect(screen.getByLabelText("Menu samping")).not.toHaveClass("translate-x-0");
    await rerender({ open: true });
    expect(screen.getByLabelText("Menu samping")).toHaveAttribute("data-open", "true");
    expect(screen.getByLabelText("Menu samping")).toHaveClass("translate-x-0");
    await fireEvent.click(screen.getByRole("link", { name: "Profil" }));
    expect(onnavigate).toHaveBeenCalledTimes(1);
  });

  it("memperbarui menu aktif saat rute berubah", async () => {
    setPage("/");
    render(Sidebar, { props: { onnavigate: vi.fn() } });
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveAttribute("aria-current", "page");
    setPage("/users");
    await waitFor(() => expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("aria-current", "page"));
    expect(screen.getByRole("link", { name: "Semua Kursus" })).not.toHaveAttribute("aria-current");
  });
});
