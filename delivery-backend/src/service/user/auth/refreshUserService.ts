import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../lib/jwt.js";
import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";
import { AuthServiceError } from "./authErrors.js";
import type { AuthenticatedUser } from "./loginUserService.js";

export type RefreshUserResult = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

class RefreshUserService {
  async handle(refreshToken: string): Promise<RefreshUserResult> {
    try {
      const { userId } = await verifyRefreshToken(refreshToken);
      const incomingTokenHash = hashToken(refreshToken);

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new AuthServiceError("Unauthorized", 401);
      }

      const existingSession = await prisma.refreshSession.findUnique({
        where: { tokenHash: incomingTokenHash, userId: userId },
      });

      if (!existingSession) {
        await prisma.refreshSession.deleteMany({ where: { userId } });
        throw new AuthServiceError("Unauthorized", 401);
      }

      if (existingSession.expiresAt <= new Date()) {
        await prisma.refreshSession.delete({ where: { id: existingSession.id } });
        throw new AuthServiceError("Unauthorized", 401);
      }

      
      const newRefreshBundle = await signRefreshToken(user.id);
      const newTokenHash = hashToken(newRefreshBundle.token);

      // Rotate the session row in place instead of inserting a new row per refresh,
      // otherwise the table grows forever. Keying the update on the current tokenHash
      // makes it atomic: only one concurrent request can match and win the rotation,
      // the rest find 0 rows updated and fail with 401.
      const rotated = await prisma.refreshSession.updateMany({
        where: { id: existingSession.id, tokenHash: incomingTokenHash },
        data: { tokenHash: newTokenHash, expiresAt: newRefreshBundle.expiresAt },
      });

      if (rotated.count !== 1) {
        throw new AuthServiceError("Unauthorized", 401);
      }

      const accessToken = await signAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        accessToken,
        refreshToken: newRefreshBundle.token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new AuthServiceError("Unauthorized", 401);
    }
  }
}

export default RefreshUserService;