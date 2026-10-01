import type { Request, Response } from "express";
import { z } from "zod";
import { accessCookieOptions, refreshCookieOptions } from "../../../lib/authCookies.js";
import LoginUserService from "../../../service/user/auth/loginUserService.js";
import { AuthServiceError } from "../../../service/user/auth/authErrors.js";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class LoginController {
  private readonly service = new LoginUserService();

  async handle(req: Request, res: Response) {
    const parsedBody = authSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    try {
      const result = await this.service.handle(parsedBody.data.email, parsedBody.data.password);

      res.cookie("accessToken", result.accessToken, accessCookieOptions);
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

      return res.status(200).json({ success: true, user: result.user });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: "Internal server errorrrrr", error: error instanceof Error ? error.message : String(error) });
    }
  }
}

export default LoginController;