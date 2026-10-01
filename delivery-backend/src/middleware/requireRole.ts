import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "./requireAuth.js";

type Role = AuthUser["role"];

export function requireRole(allowedRoles: Role | Role[]) {
  const allowedRoleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return function roleGuard(req: Request & { authUser?: AuthUser }, res: Response, next: NextFunction) {
    if (!req.authUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoleList.includes(req.authUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}