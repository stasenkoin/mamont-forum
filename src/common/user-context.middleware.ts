import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Session from 'supertokens-node/recipe/session';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });
      if (session) {
        const supertokensId = session.getUserId();
        const user = await this.prisma.user.findUnique({
          where: { supertokensId },
          select: { id: true, nickname: true, avatarUrl: true, role: true },
        });
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
