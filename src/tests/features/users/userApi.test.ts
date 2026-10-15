import { describe, expect, it } from "vitest";
import { userApi } from "../../../features/users/api/userApi";
import { mockFetch, ok } from "../../utils";

describe("userApi", () => {
  it("memanggil endpoint pengguna dengan metode yang benar", async () => {
    const { calls } = mockFetch({
      "GET /users": ok(),
      "GET /users/me": ok(),
      "PUT /users/me": ok(),
      "POST /users/me/photo": ok(),
      "PUT /users/password": ok(),
    });
    await userApi.getUsers();
    await userApi.getProfile();
    await userApi.updateProfile({ name: "A", email: "a@b.c" });
    await userApi.changePhoto(new File(["x"], "p.png", { type: "image/png" }));
    await userApi.changePassword({ password: "1", new_password: "2", new_password_confirmation: "2" });

    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "GET /users",
      "GET /users/me",
      "PUT /users/me",
      "POST /users/me/photo",
      "PUT /users/password",
    ]);
    expect(calls[2].body).toEqual({ name: "A", email: "a@b.c" });
    expect((calls[3].body as FormData).get("photo")).toBeInstanceOf(File);
    expect(calls[4].body).toEqual({ password: "1", new_password: "2", new_password_confirmation: "2" });
  });
});
