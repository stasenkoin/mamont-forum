import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Пользователь форума' })
export class UserType {
  @Field(() => Int, { description: 'ID пользователя' })
  id: number;

  @Field({ description: 'Никнейм пользователя' })
  nickname: string;

  @Field({ nullable: true, description: 'URL аватара пользователя' })
  avatarUrl?: string | null;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время регистрации пользователя',
  })
  createdAt: Date;

  @Field(() => Int, { description: 'Количество созданных обсуждений' })
  discussionsCount: number;

  @Field(() => Int, { description: 'Количество оставленных комментариев' })
  commentsCount: number;
}
