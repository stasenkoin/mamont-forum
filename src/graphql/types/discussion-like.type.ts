import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Лайк обсуждения' })
export class DiscussionLikeType {
  @Field(() => Int, { description: 'ID лайка' })
  id: number;

  @Field(() => Int, { description: 'ID пользователя, поставившего лайк' })
  userId: number;

  @Field(() => Int, { description: 'ID обсуждения' })
  discussionId: number;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время постановки лайка',
  })
  createdAt: Date;
}
