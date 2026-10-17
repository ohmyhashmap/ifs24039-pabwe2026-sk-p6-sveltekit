import { getBaseUrl } from "./apiHelper";

export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function getYoutubeId(url: string): string | null {
  let parsed: URL;
  try {
    const input = url.trim();
    parsed = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    return null;
  }

  if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.username || parsed.password) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  const isShortUrl = ["youtu.be", "www.youtu.be", "m.youtu.be"].includes(hostname);
  const isYoutubeUrl = ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(hostname);
  if (!isShortUrl && !isYoutubeUrl) return null;

  const segments = parsed.pathname.split("/");
  let id: string | null;
  if (isShortUrl) {
    id = segments[1];
  } else if (parsed.pathname === "/watch") {
    id = parsed.searchParams.get("v");
  } else if (["embed", "shorts", "live"].includes(segments[1])) {
    id = segments[2] ?? null;
  } else {
    id = null;
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null;
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
  return globalThis.confirm(message);
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
