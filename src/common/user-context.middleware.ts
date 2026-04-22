import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Session from 'supertokens-node/recipe/session';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  private normalizeNickname(source: string) {
    const base = source
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24);
    return base || 'user';
  }

  private async ensureUserProfile(supertokensId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { supertokensId },
      select: { id: true, nickname: true, avatarUrl: true, role: true },
    });
    if (existing) {
      return existing;
    }

    const nicknameBase = this.normalizeNickname(`user_${supertokensId.slice(0, 8)}`);

    for (let i = 0; i < 20; i++) {
      const nickname =
        i === 0 ? nicknameBase : `${nicknameBase}_${Math.floor(Math.random() * 10000)}`;
      const nicknameTaken = await this.prisma.user.findUnique({
        where: { nickname },
        select: { id: true },
      });
      if (nicknameTaken) {
        continue;
      }

      try {
        const created = await this.prisma.user.create({
          data: { supertokensId, nickname },
          select: { id: true, nickname: true, avatarUrl: true, role: true },
        });
        return created;
      } catch {
        // Another request may create the same profile concurrently.
        const retry = await this.prisma.user.findUnique({
          where: { supertokensId },
          select: { id: true, nickname: true, avatarUrl: true, role: true },
        });
        if (retry) {
          return retry;
        }
      }
    }

    return null;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });
      if (session) {
        const supertokensId = session.getUserId();
        const user = await this.ensureUserProfile(supertokensId);
        if (user) {
          res.locals.user = user;
        }
      }
    } catch (err) {
      console.log('[UserContext] session error:', (err as Error).message);
    }
    next();
  }
}
