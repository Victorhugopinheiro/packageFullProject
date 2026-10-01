import { prisma } from "../../../lib/prisma.js";
import { hashToken } from "../../../lib/tokenHash.js";

class LogoutUserService {
  async handle(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await prisma.refreshSession.deleteMany({
      where: { tokenHash: hashToken(refreshToken) },
    });
  }
}

export default LogoutUserService;