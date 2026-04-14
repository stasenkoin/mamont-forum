import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { CommentType } from './comment.type';
import { UserType } from './user.type';

@ObjectType({ description: 'Обсуждение форума' })
export class DiscussionType {
  @Field(() => Int, { description: 'ID обсуждения' })
  id: number;

  @Field({ description: 'Заголовок обсуждения' })
  title: string;

  @Field({ description: 'Текст обсуждения' })
  content: string;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время создания обсуждения',
  })
  createdAt: Date;

  @Field(() => Int, { nullable: true, description: 'ID автора обсуждения' })
  authorId?: number | null;

  @Field(() => UserType, { nullable: true, description: 'Автор обсуждения' })
  author?: UserType | null;

  @Field(() => [CommentType], {
    description: 'Комментарии к обсуждению',
  })
  comments: CommentType[];

  @Field(() => Int, { description: 'Количество комментариев к обсуждению' })
  commentsCount: number;

  @Field(() => Int, { description: 'Количество лайков обсуждения' })
  likesCount: number;
}
