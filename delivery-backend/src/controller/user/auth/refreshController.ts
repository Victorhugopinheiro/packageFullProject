import type { Request, Response } from "express";
import {
  accessCookieOptions,
  clearCookieOptions,
  refreshCookieOptions,
} from "../../../lib/authCookies.js";
import { AuthServiceError } from "../../../service/user/auth/authErrors.js";
import RefreshUserService from "../../../service/user/auth/refreshUserService.js";

class RefreshController {
  private readonly service = new RefreshUserService();

  async handle(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      res.clearCookie("accessToken", clearCookieOptions);
      res.clearCookie("refreshToken", clearCookieOptions);
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = await this.service.handle(refreshToken);

      if (!result.accessToken || !result.refreshToken) {
        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.cookie("accessToken", result.accessToken, accessCookieOptions);
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

      return res.status(200).json({ user: result.user });
    } catch (error) {
      res.clearCookie("accessToken", clearCookieOptions);
      res.clearCookie("refreshToken", clearCookieOptions);

      if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default RefreshController;