import { test, expect, vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockJwtVerify = vi.fn();
vi.mock("jose", () => ({
  jwtVerify: mockJwtVerify,
  SignJWT: vi.fn(),
}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie is present", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const { getSession } = await import("@/lib/auth");
  const result = await getSession();

  expect(result).toBeNull();
  expect(mockJwtVerify).not.toHaveBeenCalled();
});

test("getSession returns null when token verification fails", async () => {
  mockCookieStore.get.mockReturnValue({ value: "invalid-token" });
  mockJwtVerify.mockRejectedValue(new Error("invalid signature"));

  const { getSession } = await import("@/lib/auth");
  const result = await getSession();

  expect(result).toBeNull();
});

test("getSession returns null when token is expired", async () => {
  mockCookieStore.get.mockReturnValue({ value: "expired-token" });
  mockJwtVerify.mockRejectedValue(new Error("JWT expired"));

  const { getSession } = await import("@/lib/auth");
  const result = await getSession();

  expect(result).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const payload = { userId: "user-1", email: "a@example.com", expiresAt: new Date() };
  mockCookieStore.get.mockReturnValue({ value: "valid-token" });
  mockJwtVerify.mockResolvedValue({ payload });

  const { getSession } = await import("@/lib/auth");
  const result = await getSession();

  expect(result?.userId).toBe("user-1");
  expect(result?.email).toBe("a@example.com");
});

test("getSession reads from the auth-token cookie", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const { getSession } = await import("@/lib/auth");
  await getSession();

  expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
});
