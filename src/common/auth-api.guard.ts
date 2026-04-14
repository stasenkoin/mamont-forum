import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class AuthGuardApi implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request =
      context.getType<string>() === 'http'
        ? context.switchToHttp().getRequest<Request>()
        : GqlExecutionContext.create(context).getContext<{ req: Request }>().req;

    if (!request.session?.userId) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    return true;
  }
}
