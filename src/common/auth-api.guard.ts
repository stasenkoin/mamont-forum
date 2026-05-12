import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
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

    let req: Request;
    let res: Response;

    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const { req: gqlReq, res: gqlRes } = gqlCtx.getContext();
      req = gqlReq;
      res = gqlRes;
    } else {
      const ctx = context.switchToHttp();
      req = ctx.getRequest<Request>();
      res = ctx.getResponse<Response>();
    }

    try {
      req.session = await Session.getSession(req, res, {
        sessionRequired: true,
      });
      return true;
    } catch (err) {
      if (STError.isErrorFromSuperTokens(err)) {
        throw new UnauthorizedException('Необходима авторизация');
      }
      throw err;
    }
  }
}
