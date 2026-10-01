import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export type AuthUser = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "WORKER";
};

export async function requireAuth(req: Request & { authUser?: AuthUser }, res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const authUser = await verifyAccessToken(token);

    if(!authUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.authUser = authUser;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}