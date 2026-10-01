import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt.js";
import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";
import { AuthServiceError } from "./authErrors.js";

export type AuthenticatedUser = {
  name: string;
  email: string;
  role: "ADMIN" | "WORKER";
};

export type LoginUserResult = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

class LoginUserService {
  async handle(email: string, password: string): Promise<LoginUserResult> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AuthServiceError("Invalid credentials", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new AuthServiceError("Invalid credentials", 401);
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const refreshBundle = await signRefreshToken(user.id);
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshBundle.token),
        expiresAt: refreshBundle.expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshBundle.token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export default LoginUserService;