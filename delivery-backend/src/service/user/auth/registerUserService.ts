import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt.js";
import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";
import { AuthServiceError } from "./authErrors.js";

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WORKER";
};

export type RegisterUserResult = {
  user: RegisteredUser;
  accessToken: string;
  refreshToken: string;
};

class RegisterUserService {
  async handle(name: string, email: string, password: string): Promise<RegisterUserResult> {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AuthServiceError("Email already in use", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export default RegisterUserService;
