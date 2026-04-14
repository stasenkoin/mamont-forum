import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType({ description: 'Комментарий в обсуждении' })
export class CommentType {
  @Field(() => Int, { description: 'ID комментария' })
  id: number;

  @Field({ description: 'Текст комментария' })
  content: string;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время создания комментария',
  })
  createdAt: Date;

  @Field(() => Int, { nullable: true, description: 'ID автора комментария' })
  authorId?: number | null;

  @Field(() => Int, { description: 'ID обсуждения' })
  discussionId: number;

  @Field(() => UserType, {
    nullable: true,
    description: 'Автор комментария',
  })
  author?: UserType | null;
}
