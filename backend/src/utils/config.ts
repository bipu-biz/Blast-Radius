const isProd = process.env.NODE_ENV === "production";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
};