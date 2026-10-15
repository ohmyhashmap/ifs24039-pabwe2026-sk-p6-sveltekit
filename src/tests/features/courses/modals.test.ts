import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddModal from "../../../features/courses/components/AddModal.svelte";
import ChangeCoverModal from "../../../features/courses/components/ChangeCoverModal.svelte";
import ChangeModal from "../../../features/courses/components/ChangeModal.svelte";
import ContentModal from "../../../features/courses/components/ContentModal.svelte";
import { coursesStore } from "../../../features/courses/states/coursesStore";
import { content, deferred, detail, fail, mockFetch, ok, resetStores, typeInto } from "../../utils";

beforeEach(resetStores);

describe("AddModal", () => {
  it("membuat kursus dengan judul & deskripsi lalu menutup", async () => {
    const onclose = vi.fn();
    const { calls } = mockFetch({ "POST /courses": ok("Berhasil menambahkan kursus") });
    render(AddModal, { props: { onclose } });
    await typeInto(screen.getByLabelText("Judul"), " Belajar Svelte ");
    await typeInto(screen.getByLabelText("Deskripsi"), " Dari nol ");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan kursus" }));
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(calls[0].body).toEqual({ title: "Belajar Svelte", description: "Dari nol" });
    expect(get(coursesStore).flags.course).toBe(true);
  });

  it("tetap terbuka bila gagal dan menampilkan status menyimpan", async () => {
    const onclose = vi.fn();
    const gate = deferred<unknown>();
    mockFetch({ "POST /courses": () => gate.promise });
    render(AddModal, { props: { onclose } });
    await typeInto(screen.getByLabelText("Judul"), "J");
    await typeInto(screen.getByLabelText("Deskripsi"), "D");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan kursus" }));
    expect(await screen.findByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    gate.resolve(fail("Data tidak valid"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan kursus" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol Batal", async () => {
    const onclose = vi.fn();
    render(AddModal, { props: { onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});

describe("ChangeModal", () => {
  it("mengisi nilai awal dan memperbarui kursus", async () => {
    const onclose = vi.fn();
    const { calls } = mockFetch({ "PUT /courses/3": ok("Berhasil mengubah data") });
    render(ChangeModal, { props: { course: detail(), onclose } });
    expect(screen.getByLabelText("Judul")).toHaveValue("Dasar C");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Belajar dasar C dari awal");
    await typeInto(screen.getByLabelText("Judul"), "Dasar C Lanjut");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(calls[0].body).toEqual({ title: "Dasar C Lanjut", description: "Belajar dasar C dari awal" });
  });

  it("tetap terbuka saat gagal dan dapat dibatalkan", async () => {
    const onclose = vi.fn();
    const gate = deferred<unknown>();
    mockFetch({ "PUT /courses/3": () => gate.promise });
    render(ChangeModal, { props: { course: detail(), onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(await screen.findByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    gate.resolve(fail("Gagal"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});

describe("ChangeCoverModal", () => {
  const pick = (name = "c.png") =>
    fireEvent.change(screen.getByLabelText("Berkas gambar"), { target: { files: [new File(["x"], name)] } });

  it("mengunggah sampul lalu menutup", async () => {
    const onclose = vi.fn();
    const { calls } = mockFetch({ "POST /courses/3/cover": ok("Berhasil mengubah cover") });
    render(ChangeCoverModal, { props: { courseId: 3, onclose } });
    const submit = screen.getByRole("button", { name: "Unggah sampul" });
    expect(submit).toBeDisabled();
    await pick();
    await fireEvent.click(submit);
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect((calls[0].body as FormData).get("cover")).toBeInstanceOf(File);
    expect(get(coursesStore).flags.cover).toBe(true);
  });

  it("mengabaikan kiriman tanpa berkas dan tidak menutup saat gagal", async () => {
    const onclose = vi.fn();
    const gate = deferred<unknown>();
    const { calls } = mockFetch({ "POST /courses/3/cover": () => gate.promise });
    render(ChangeCoverModal, { props: { courseId: 3, onclose } });
    await fireEvent.submit(screen.getByRole("button", { name: "Unggah sampul" }).closest("form")!);
    expect(calls).toHaveLength(0);

    await pick();
    await fireEvent.click(screen.getByRole("button", { name: "Unggah sampul" }));
    expect(await screen.findByRole("button", { name: "Mengunggah..." })).toBeDisabled();
    gate.resolve(fail("Berkas tidak valid"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Unggah sampul" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
  });

  it("menganggap pilihan berkas yang dibatalkan sebagai kosong dan dapat dibatalkan", async () => {
    const onclose = vi.fn();
    render(ChangeCoverModal, { props: { courseId: 3, onclose } });
    await pick();
    await fireEvent.change(screen.getByLabelText("Berkas gambar"), { target: { files: [] } });
    expect(screen.getByRole("button", { name: "Unggah sampul" })).toBeDisabled();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalled();
  });
});

describe("ContentModal", () => {
  it("mode tambah: menolak tautan non-YouTube", async () => {
    const { calls } = mockFetch({});
    render(ContentModal, { props: { courseId: 3, onclose: vi.fn() } });
    expect(screen.getByRole("heading", { name: "Tambah konten" })).toBeInTheDocument();
    await typeInto(screen.getByLabelText("Judul materi"), "Materi");
    await typeInto(screen.getByLabelText("Tautan YouTube"), "https://example.com/x");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan konten" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Masukkan tautan YouTube yang valid");
    expect(calls).toHaveLength(0);
  });

  it("mode tambah: menyimpan konten baru, menghapus galat, lalu menutup", async () => {
    const onclose = vi.fn();
    const { calls } = mockFetch({ "POST /courses/3/contents": ok("Berhasil menambahkan konten kursus") });
    render(ContentModal, { props: { courseId: 3, onclose } });
    await typeInto(screen.getByLabelText("Judul materi"), " Materi ");
    await typeInto(screen.getByLabelText("Tautan YouTube"), "bukan url");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan konten" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await typeInto(screen.getByLabelText("Tautan YouTube"), "https://youtu.be/uHyfQV0kbgo");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan konten" }));
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).toBeNull();
    expect(calls[0].body).toEqual({ title: "Materi", youtube: "https://youtu.be/uHyfQV0kbgo" });
  });

  it("mode ubah: mengisi nilai awal dan memanggil PUT konten", async () => {
    const onclose = vi.fn();
    const { calls } = mockFetch({ "PUT /courses/-/contents/10": ok("Berhasil mengubah konten kursus") });
    render(ContentModal, { props: { courseId: 3, content: content(), onclose } });
    expect(screen.getByRole("heading", { name: "Ubah konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Pengenalan Pointer");
    expect(screen.getByLabelText("Tautan YouTube")).toHaveValue("https://youtu.be/uHyfQV0kbgo");
    await typeInto(screen.getByLabelText("Judul materi"), "Pointer Lanjut");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan konten" }));
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(calls[0].body.title).toBe("Pointer Lanjut");
  });

  it("tetap terbuka saat server menolak dan menampilkan status menyimpan", async () => {
    const onclose = vi.fn();
    const gate = deferred<unknown>();
    mockFetch({ "POST /courses/3/contents": () => gate.promise });
    render(ContentModal, { props: { courseId: 3, onclose } });
    await typeInto(screen.getByLabelText("Judul materi"), "M");
    await typeInto(screen.getByLabelText("Tautan YouTube"), "https://youtu.be/uHyfQV0kbgo");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan konten" }));
    expect(await screen.findByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    gate.resolve(fail("Gagal"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan konten" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
