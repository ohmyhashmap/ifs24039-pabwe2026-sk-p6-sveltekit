import { goto } from "$app/navigation";
import { render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";
import Harness from "./tests/Harness.svelte";
import LoginRoute from "./routes/auth/login/+page.svelte";
import HomeRoute from "./routes/+page.svelte";
import { notify } from "./states/toastStore";
import { mockFetch, ok, resetStores, setPage, signIn, summary } from "./tests/utils";

beforeEach(resetStores);

describe("App (layout root)", () => {
  it("rute /auth tidak memakai layout kursus", () => {
    setPage("/auth/login");
    render(Harness, { props: { Page: LoginRoute } });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Navigasi utama" })).toBeNull();
    expect(screen.queryByLabelText("Menu samping")).toBeNull();
  });

  it("rute lain dibungkus CourseLayout (navbar, sidebar, isi halaman)", async () => {
    setPage("/");
    signIn();
    mockFetch({ "GET /courses": ok("ok", { courses: [summary()] }) });
    render(Harness, { props: { Page: HomeRoute } });
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByLabelText("Menu samping")).toBeInTheDocument();
    expect(await screen.findByText("Dasar C")).toBeInTheDocument();
  });

  it("pengguna tanpa sesi dialihkan ke login dari rute terlindungi", async () => {
    setPage("/");
    render(Harness, { props: { Page: HomeRoute } });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi...");
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("berpindah dari /auth ke rute lain mengganti layout secara reaktif, dan toast tampil", async () => {
    setPage("/auth/login");
    render(Harness, { props: { Page: LoginRoute } });
    setPage("/users");
    expect(await screen.findByText("Memuat sesi...")).toBeInTheDocument();
    notify("success", "Halo dari toast", 60_000);
    expect(await screen.findByText("Halo dari toast")).toBeInTheDocument();
  });
});
