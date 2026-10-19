import { writable } from "svelte/store";
import { clearToken, getErrorMessage, getToken, setToken } from "../../../helpers/apiHelper";
import { notify } from "../../../states/toastStore";
import { userApi } from "../../users/api/userApi";
import type { User } from "../../users/types";
import { authApi } from "../api/authApi";

export interface AuthState {
  token: string | null;
  profile: User | null;
  loading: boolean;
}

export const authStore = writable<AuthState>({ token: getToken(), profile: null, loading: false });

const patch = (partial: Partial<AuthState>) => authStore.update((s) => ({ ...s, ...partial }));

/** Memuat profil pengguna yang sedang login. Token dihapus bila sesi tidak valid. */
export async function loadProfile(): Promise<boolean> {
  patch({ loading: true });
  const response = await userApi.getProfile();
  if (response.status === "success" && response.data) {
    patch({ profile: response.data.user, loading: false });
    return true;
  }
  clearToken();
  authStore.set({ token: null, profile: null, loading: false });
  return false;
}

export async function login(email: string, password: string): Promise<boolean> {
  patch({ loading: true });
  const response = await authApi.login({ email, password });
  if (response.status !== "success" || !response.data) {
    patch({ loading: false });
    notify("error", getErrorMessage(response));
    return false;
  }
  setToken(response.data.token);
  patch({ token: response.data.token });
  const loaded = await loadProfile();
  notify(loaded ? "success" : "error", loaded ? response.message : "Gagal memuat profil pengguna");
  return loaded;
}

export async function register(name: string, email: string, password: string): Promise<boolean> {
  patch({ loading: true });
  const response = await authApi.register({ name, email, password });
  patch({ loading: false });
  const ok = response.status === "success";
  notify(ok ? "success" : "error", ok ? response.message : getErrorMessage(response));
  return ok;
}

export async function logout(): Promise<void> {
  await authApi.logout();
  clearToken();
  authStore.set({ token: null, profile: null, loading: false });
  notify("info", "Anda telah keluar");
}

export function setProfile(profile: User): void {
  patch({ profile });
}
