import { describe, expect, it, vi } from "vitest";
import {
  confirmAction,
  formatDate,
  formatPercent,
  formatRating,
  getYoutubeId,
  initials,
  matchesQuery,
  resolveAsset,
} from "../../helpers/toolsHelper";

describe("toolsHelper", () => {
  it("formatDate", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
    expect(formatDate("2024-10-06T01:27:37.000000Z")).toContain("2024");
  });

  it("getYoutubeId mengenali berbagai bentuk tautan", () => {
    const id = "uHyfQV0kbgo";
    expect(getYoutubeId(`https://youtu.be/${id}`)).toBe(id);
    expect(getYoutubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(getYoutubeId(`https://www.youtube.com/watch?list=x&v=${id}&t=5`)).toBe(id);
    expect(getYoutubeId(`https://youtube.com/embed/${id}`)).toBe(id);
    expect(getYoutubeId(` https://m.youtube.com/shorts/${id}?feature=share `)).toBe(id);
    expect(getYoutubeId(`youtu.be/${id}`)).toBe(id);
  });

  it("getYoutubeId menolak tautan lain", () => {
    expect(getYoutubeId("https://example.com/video")).toBeNull();
    expect(getYoutubeId("https://youtu.be/pendek")).toBeNull();
    expect(getYoutubeId("")).toBeNull();
  });

  it("formatRating", () => {
    expect(formatRating(null)).toBe("Belum ada rating");
    expect(formatRating(undefined)).toBe("Belum ada rating");
    expect(formatRating("")).toBe("Belum ada rating");
    expect(formatRating("abc")).toBe("Belum ada rating");
    expect(formatRating("4.0000")).toBe("4.0");
    expect(formatRating(3.456)).toBe("3.5");
  });

  it("formatPercent membatasi nilai pada 0-100", () => {
    expect(formatPercent(null)).toBe(0);
    expect(formatPercent(undefined)).toBe(0);
    expect(formatPercent("33.33")).toBe(33);
    expect(formatPercent(150)).toBe(100);
    expect(formatPercent(-5)).toBe(0);
  });

  it("confirmAction meneruskan ke window.confirm", () => {
    const spy = vi.spyOn(window, "confirm").mockReturnValue(true);
    expect(confirmAction("Yakin?")).toBe(true);
    expect(spy).toHaveBeenCalledWith("Yakin?");
    spy.mockRestore();
  });

  it("initials", () => {
    expect(initials("Abdullah Ubaid Ketiga")).toBe("AU");
    expect(initials("delcom")).toBe("D");
    expect(initials("  ")).toBe("");
  });

  it("resolveAsset", () => {
    expect(resolveAsset(null)).toBe("");
    expect(resolveAsset("")).toBe("");
    expect(resolveAsset("https://cdn.test/a.png")).toBe("https://cdn.test/a.png");
    expect(resolveAsset("img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(resolveAsset("/img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });

  it("matchesQuery", () => {
    expect(matchesQuery("", "apa saja")).toBe(true);
    expect(matchesQuery("   ", "apa saja")).toBe(true);
    expect(matchesQuery("reACT", "Belajar ReactJS", "x")).toBe(true);
    expect(matchesQuery("vue", "Belajar ReactJS", "deskripsi")).toBe(false);
    expect(matchesQuery("desk", "Judul", "deskripsi")).toBe(true);
  });
});
