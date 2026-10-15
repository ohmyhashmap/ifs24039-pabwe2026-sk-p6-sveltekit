import { apiHelper } from "../../../helpers/apiHelper";
import type { User } from "../types";

export const userApi = {
  getUsers: () => apiHelper.get<{ users: User[] }>("/users"),
  getProfile: () => apiHelper.get<{ user: User }>("/users/me"),
  updateProfile: (payload: { name: string; email: string }) =>
    apiHelper.put<{ user: User }>("/users/me", { body: payload }),
  changePhoto: (photo: File) => {
    const form = new FormData();
    form.append("photo", photo);
    return apiHelper.post("/users/me/photo", { form });
  },
  changePassword: (payload: {
    password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => apiHelper.put("/users/password", { body: payload }),
};
