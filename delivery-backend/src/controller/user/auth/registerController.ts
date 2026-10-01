import type { Request, Response } from "express";
import { z } from "zod";
import { accessCookieOptions, refreshCookieOptions } from "../../../lib/authCookies.js";
import RegisterUserService from "../../../service/user/auth/registerUserService.js";
import { AuthServiceError } from "../../../service/user/auth/authErrors.js";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

class RegisterController {
  private readonly service = new RegisterUserService();

  async handle(req: Request, res: Response) {
    const parsedBody = registerSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    try {
      const result = await this.service.handle(
        parsedBody.data.name,
        parsedBody.data.email,
        parsedBody.data.password,
      );

      res.cookie("accessToken", result.accessToken, accessCookieOptions);
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

      return res.status(201).json({ user: result.user });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default RegisterController;
