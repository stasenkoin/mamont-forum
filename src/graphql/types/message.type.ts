import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Результат операции с текстовым сообщением' })
export class MessageType {
  @Field({ description: 'Сообщение о результате операции' })
  message: string;
}
