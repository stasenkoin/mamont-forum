import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Данные для создания комментария' })
export class CreateCommentInput {
  @Field({ description: 'Текст комментария' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

@InputType({ description: 'Данные для обновления комментария' })
export class UpdateCommentInput {
  @Field({ description: 'Новый текст комментария' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
