import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Результат успешной авторизации' })
export class AuthPayloadType {
  @Field(() => Int, { description: 'ID пользователя' })
  id: number;

  @Field({ description: 'Никнейм пользователя' })
  nickname: string;

  @Field({ nullable: true, description: 'URL аватара пользователя' })
  avatarUrl?: string | null;
}
