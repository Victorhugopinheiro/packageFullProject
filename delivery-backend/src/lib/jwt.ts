import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const textEncoder = new TextEncoder();

function getSecret(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return textEncoder.encode(value);
}

const accessSecret = () => getSecret(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
const refreshSecret = () => getSecret(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");
const issuer = process.env.JWT_ISSUER!
const accessAudience = process.env.JWT_ACCESS_AUDIENCE!
const refreshAudience = process.env.JWT_REFRESH_AUDIENCE!
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "WORKER";
};

export type RefreshTokenBundle = {
  token: string;
  expiresAt: Date;
};

export async function signAccessToken(payload: AuthTokenPayload) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuer(issuer)
    .setAudience(accessAudience)
    .setJti(randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS)
    .sign(accessSecret());
}

export async function signRefreshToken(userId: string): Promise<RefreshTokenBundle> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + REFRESH_TOKEN_TTL_SECONDS;

  const token = await new SignJWT({ tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(issuer)
    .setAudience(refreshAudience)
    .setJti(randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(refreshSecret());

  return {
    token,
    expiresAt: new Date(exp * 1000),
  };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret(), {
    algorithms: ["HS256"],
    issuer,
    audience: accessAudience,
    typ: "JWT",
  });

  if (!payload.sub || !payload.email || !payload.name || !payload.role) {
    throw new Error("Invalid token");
  }

  return {
    userId: payload.sub,
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role as AuthTokenPayload["role"],
  };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret(), {
    algorithms: ["HS256"],
    issuer,
    audience: refreshAudience,
    typ: "JWT",
  });

  if (!payload.sub || payload.tokenType !== "refresh") {
    throw new Error("Invalid token");
  }

  return {
    userId: payload.sub,
    jti: payload.jti,
  };
}