import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const session = req.session;
    if (!session) return false;

    const userId = session.getUserId();
    const rolesResponse = await UserRoles.getRolesForUser('public', userId);
    const userRoles = rolesResponse.roles;

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
