import {
  ConflictException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthService } from '../../auth/auth.service';
import { AuthGuardApi } from '../../common/auth-api.guard';
import { LoginInput, RegisterInput } from '../inputs/auth.inputs';
import { AuthPayloadType } from '../types/auth-payload.type';
import { MessageType } from '../types/message.type';
import { UserType } from '../types/user.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayloadType, {
    description: 'Зарегистрировать нового пользователя и открыть сессию',
  })
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GraphqlContext,
  ) {
    if (await this.authService.nicknameExists(input.nickname)) {
      throw new ConflictException('Этот никнейм уже занят');
    }

    const user = await this.authService.register(input);
    context.req.session.userId = user.id;
    context.req.session.nickname = user.nickname;
    context.req.session.avatarUrl = user.avatarUrl ?? undefined;

    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Войти в существующий аккаунт',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GraphqlContext,
  ) {
    const user = await this.authService.validateUser(
      input.nickname,
      input.password,
    );

    if (!user) {
      throw new UnauthorizedException('Неверный никнейм или пароль');
    }

    context.req.session.userId = user.id;
    context.req.session.nickname = user.nickname;
    context.req.session.avatarUrl = user.avatarUrl ?? undefined;

    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }

  @Mutation(() => MessageType, {
    description: 'Завершить текущую пользовательскую сессию',
  })
  @UseGuards(AuthGuardApi)
  async logout(@Context() context: GraphqlContext) {
    await new Promise<void>((resolve) => {
      context.req.session.destroy(() => resolve());
    });

    return { message: 'Выход выполнен' };
  }

  @Query(() => UserType, {
    name: 'me',
    description: 'Получить данные текущего авторизованного пользователя',
  })
  @UseGuards(AuthGuardApi)
  async me(@Context() context: GraphqlContext) {
    const user = await this.authService.findById(context.req.session.userId!);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }

  @Mutation(() => MessageType, {
    description: 'Удалить текущий аккаунт и закрыть сессию',
  })
  @UseGuards(AuthGuardApi)
  async deleteMyAccount(@Context() context: GraphqlContext) {
    await this.authService.deleteAccount(context.req.session.userId!);

    await new Promise<void>((resolve) => {
      context.req.session.destroy(() => resolve());
    });

    return { message: 'Аккаунт удалён' };
  }
}
