import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Данные для создания обсуждения' })
export class CreateDiscussionInput {
  @Field({ description: 'Заголовок обсуждения' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ description: 'Текст обсуждения' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

@InputType({ description: 'Данные для обновления обсуждения' })
export class UpdateDiscussionInput {
  @Field({ description: 'Новый заголовок обсуждения' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ description: 'Новый текст обсуждения' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
