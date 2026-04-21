import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CommentType } from './comment.type';
import { DiscussionType } from './discussion.type';
import { NotificationType } from './notification.type';
import { UserType } from './user.type';

@ObjectType({ description: 'Страница списка обсуждений' })
export class DiscussionPageType {
  @Field(() => [DiscussionType], { description: 'Элементы текущей страницы' })
  items: DiscussionType[];

  @Field(() => Int, { description: 'Текущая страница' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}

@ObjectType({ description: 'Страница списка комментариев' })
export class CommentPageType {
  @Field(() => [CommentType], { description: 'Элементы текущей страницы' })
  items: CommentType[];

  @Field(() => Int, { description: 'Текущая страница' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}

@ObjectType({ description: 'Страница списка пользователей' })
export class UserPageType {
  @Field(() => [UserType], { description: 'Элементы текущей страницы' })
  items: UserType[];

  @Field(() => Int, { description: 'Текущая страница' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}

@ObjectType({ description: 'Страница списка уведомлений' })
export class NotificationPageType {
  @Field(() => [NotificationType], { description: 'Элементы текущей страницы' })
  items: NotificationType[];

  @Field(() => Int, { description: 'Текущая страница' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}
