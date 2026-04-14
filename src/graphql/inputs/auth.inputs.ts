import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType({ description: 'Данные для регистрации пользователя' })
export class RegisterInput {
  @Field({ description: 'Никнейм пользователя' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Field({ description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field({ nullable: true, description: 'URL аватара пользователя' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

@InputType({ description: 'Данные для входа в аккаунт' })
export class LoginInput {
  @Field({ description: 'Никнейм пользователя' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Field({ description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
