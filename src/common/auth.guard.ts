import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (!request.session?.userId) {
      response.redirect('/auth/login');
      return false;
    }
    return true;
  }
}
