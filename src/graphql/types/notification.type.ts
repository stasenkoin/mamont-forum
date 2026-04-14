import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { DiscussionType } from './discussion.type';

@ObjectType({ description: 'Уведомление пользователя' })
export class NotificationType {
  @Field(() => Int, { description: 'ID уведомления' })
  id: number;

  @Field({ description: 'Тип уведомления' })
  type: string;

  @Field({ description: 'Текст уведомления' })
  message: string;

  @Field({ description: 'Прочитано ли уведомление' })
  isRead: boolean;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время создания уведомления',
  })
  createdAt: Date;

  @Field(() => Int, { description: 'ID пользователя, получателя уведомления' })
  userId: number;

  @Field(() => Int, {
    nullable: true,
    description: 'ID связанного обсуждения',
  })
  discussionId?: number | null;

  @Field(() => DiscussionType, {
    nullable: true,
    description: 'Связанное обсуждение',
  })
  discussion?: DiscussionType | null;
}
