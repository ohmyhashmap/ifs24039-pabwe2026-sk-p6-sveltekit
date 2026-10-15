import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Avatar from "../../components/Avatar.svelte";
import Logo from "../../components/Logo.svelte";
import Modal from "../../components/Modal.svelte";
import ToastHost from "../../components/ToastHost.svelte";
import { notify, toasts } from "../../states/toastStore";

const body = createRawSnippet(() => ({ render: () => "<p>Isi modal</p>" }));

describe("Logo", () => {
  it("menampilkan ikon dan nama aplikasi", () => {
    render(Logo);
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText("Delcom Courses")).toHaveClass("text-ink-900");
  });

  it("dapat menyembunyikan teks dan memakai mode gelap", () => {
    const { rerender } = render(Logo, { props: { showText: false } });
    expect(screen.queryByText("Delcom Courses")).toBeNull();
    rerender({ showText: true, dark: true });
    expect(screen.getByText("Delcom Courses")).toHaveClass("text-white");
  });
});

describe("Avatar", () => {
  it("menampilkan gambar bila ada foto (termasuk jalur relatif)", () => {
    render(Avatar, { props: { name: "Abdullah Ubaid", src: "img/profile/1.png" } });
    expect(screen.getByAltText("Abdullah Ubaid")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/profile/1.png",
    );
  });

  it("menampilkan inisial bila tanpa foto, dengan ukuran sesuai", () => {
    render(Avatar, { props: { name: "Abdullah Ubaid", size: "lg" } });
    const el = screen.getByRole("img", { name: "Abdullah Ubaid" });
    expect(el).toHaveTextContent("AU");
    expect(el).toHaveClass("size-24");
  });

  it("memperbarui kelas ukuran saat properti berubah", async () => {
    const withPhoto = render(Avatar, { props: { name: "A B", src: "http://x.test/a.png", size: "sm" } });
    expect(screen.getByAltText("A B")).toHaveClass("size-8");
    await withPhoto.rerender({ size: "md" });
    expect(screen.getByAltText("A B")).toHaveClass("size-10");
    withPhoto.unmount();

    const initialsOnly = render(Avatar, { props: { name: "A B", size: "sm" } });
    await initialsOnly.rerender({ size: "md" });
    expect(screen.getByRole("img", { name: "A B" })).toHaveClass("size-10");
  });
});

describe("Modal", () => {
  it("menampilkan judul dan isi", () => {
    render(Modal, { props: { title: "Judul Modal", onclose: vi.fn(), children: body } });
    expect(screen.getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(screen.getByText("Isi modal")).toBeInTheDocument();
  });

  it("menutup lewat tombol, Escape, dan klik latar; tidak menutup untuk interaksi lain", async () => {
    const onclose = vi.fn();
    render(Modal, { props: { title: "M", onclose, children: body } });

    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onclose).toHaveBeenCalledTimes(1);

    await fireEvent.keyDown(window, { key: "Enter" });
    expect(onclose).toHaveBeenCalledTimes(1);
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onclose).toHaveBeenCalledTimes(2);

    await fireEvent.click(screen.getByText("Isi modal"));
    expect(onclose).toHaveBeenCalledTimes(2);
    await fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onclose).toHaveBeenCalledTimes(3);
  });
});

describe("ToastHost", () => {
  beforeEach(() => toasts.set([]));

  it("menampilkan semua jenis toast dan dapat menutupnya", async () => {
    render(ToastHost);
    expect(screen.queryAllByRole("status")).toHaveLength(0);

    notify("success", "Sukses", 60_000);
    notify("error", "Galat", 60_000);
    notify("info", "Info", 60_000);
    expect(await screen.findByText("Sukses")).toBeInTheDocument();
    expect(screen.getByText("Galat")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();

    await fireEvent.click(screen.getAllByRole("button", { name: "Tutup notifikasi" })[0]);
    expect(screen.queryByText("Sukses")).toBeNull();
  });

  it("memperbarui gaya saat jenis toast berubah", async () => {
    render(ToastHost);
    toasts.set([{ id: 1, type: "info", message: "Pesan" }]);
    const item = await screen.findByRole("status");
    expect(item).toHaveClass("bg-white");
    toasts.set([{ id: 1, type: "error", message: "Pesan" }]);
    await waitFor(() => expect(item).toHaveClass("bg-red-50"));
  });
});
