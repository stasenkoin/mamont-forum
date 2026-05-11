import {
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthService } from '../../auth/auth.service';
import { AuthGuardApi } from '../../common/auth-api.guard';
import { UserType } from '../types/user.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => UserType, {
    name: 'me',
    description: 'Получить данные текущего авторизованного пользователя',
  })
  @UseGuards(AuthGuardApi)
  async me(@Context() context: GraphqlContext) {
    const stId = context.req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
