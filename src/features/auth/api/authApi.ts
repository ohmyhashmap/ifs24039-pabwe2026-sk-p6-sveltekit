import { apiHelper } from "../../../helpers/apiHelper";
import type { User } from "../../users/types";

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    apiHelper.post("/auth/register", { body: payload, auth: false }),
  login: (payload: { email: string; password: string }) =>
    apiHelper.post<{ user: User; token: string }>("/auth/login", { body: payload, auth: false }),
  logout: () => apiHelper.post("/auth/logout"),
};
