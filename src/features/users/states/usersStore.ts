import { writable } from "svelte/store";
import { getErrorMessage, type ApiResponse } from "../../../helpers/apiHelper";
import { notify } from "../../../states/toastStore";
import { loadProfile, setProfile } from "../../auth/states/authStore";
import { userApi } from "../api/userApi";
import type { User } from "../types";

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const usersStore = writable<UsersState>({ users: [], loading: false, error: null });

export async function loadUsers(): Promise<boolean> {
  usersStore.update((s) => ({ ...s, loading: true, error: null }));
  const response = await userApi.getUsers();
  if (response.status === "success" && response.data) {
    usersStore.set({ users: response.data.users, loading: false, error: null });
    return true;
  }
  usersStore.update((s) => ({ ...s, loading: false, error: getErrorMessage(response) }));
  return false;
}

function report(response: ApiResponse<any>): boolean {
  const ok = response.status === "success";
  notify(ok ? "success" : "error", ok ? response.message : getErrorMessage(response));
  return ok;
}

export async function saveProfile(name: string, email: string): Promise<boolean> {
  const response = await userApi.updateProfile({ name, email });
  const ok = report(response);
  if (ok && response.data) setProfile(response.data.user);
  return ok;
}

export async function savePhoto(photo: File): Promise<boolean> {
  const ok = report(await userApi.changePhoto(photo));
  if (ok) await loadProfile();
  return ok;
}

export async function savePassword(
  password: string,
  newPassword: string,
  confirmation: string,
): Promise<boolean> {
  return report(
    await userApi.changePassword({
      password,
      new_password: newPassword,
      new_password_confirmation: confirmation,
    }),
  );
}
