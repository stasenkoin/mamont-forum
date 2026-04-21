import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { Error as STError } from 'supertokens-node';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class AuthGuardApi implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    try {
      req.session = await Session.getSession(req, res, { sessionRequired: true });
      return true;
    } catch (err) {
      if (STError.isErrorFromSuperTokens(err)) {
        throw new UnauthorizedException('Необходима авторизация');
      }
      throw err;
    }
  }
}
