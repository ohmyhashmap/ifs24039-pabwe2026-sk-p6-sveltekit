import { getBaseUrl } from "./apiHelper";

export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function getYoutubeId(url: string): string | null {
  const pattern =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})(?:[?&#/].*)?$/;
  return pattern.exec(url.trim())?.[1] ?? null;
}

export function formatRating(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "Belum ada rating";
  const number = Number(value);
  return Number.isNaN(number) ? "Belum ada rating" : number.toFixed(1);
}

export function formatPercent(value?: string | number | null): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 0;
}

export function confirmAction(message: string): boolean {
  return window.confirm(message);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Foto profil dapat berupa URL penuh atau jalur relatif (mis. `img/profile/1.png`). */
export function resolveAsset(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(getBaseUrl()).origin}/${path.replace(/^\/+/, "")}`;
}

export function matchesQuery(query: string, ...fields: string[]): boolean {
  const needle = query.trim().toLowerCase();
  return needle === "" || fields.some((field) => field.toLowerCase().includes(needle));
}
