import { describe, expect, it } from "vitest";
import { setToken } from "../../../helpers/apiHelper";
import { authApi } from "../../../features/auth/api/authApi";
import { mockFetch, ok } from "../../utils";

describe("authApi", () => {
  it("register memakai POST /auth/register tanpa token", async () => {
    setToken("t");
    const { calls } = mockFetch({ "POST /auth/register": ok("Berhasil melakukan pendaftaran") });
    const res = await authApi.register({ name: "A", email: "a@b.c", password: "123456" });
    expect(res.status).toBe("success");
    expect(calls[0].body).toEqual({ name: "A", email: "a@b.c", password: "123456" });
    expect(calls[0].headers.Authorization).toBeUndefined();
  });

  it("login memakai POST /auth/login tanpa token", async () => {
    const { calls } = mockFetch({ "POST /auth/login": ok("Berhasil login", { token: "x" }) });
    await authApi.login({ email: "a@b.c", password: "123456" });
    expect(calls[0].path).toBe("/auth/login");
    expect(calls[0].body).toEqual({ email: "a@b.c", password: "123456" });
  });

  it("logout memakai POST /auth/logout dengan token", async () => {
    setToken("t");
    const { calls } = mockFetch({ "POST /auth/logout": ok("Berhasil logout") });
    await authApi.logout();
    expect(calls[0].headers.Authorization).toBe("Bearer t");
  });
});
