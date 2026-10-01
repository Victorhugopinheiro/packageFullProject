const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  domain: isProduction ? "nocorre.online" : undefined,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const accessCookieOptions = {
  ...refreshCookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  domain: isProduction ? "nocorre.online" : undefined,
  path: "/",
};