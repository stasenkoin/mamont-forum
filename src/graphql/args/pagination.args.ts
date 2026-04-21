import { Field, ArgsType, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    description: 'Номер страницы, начиная с 1',
    defaultValue: 1,
  })
  @Min(1)
  page = 1;

  @Field(() => Int, {
    description: 'Количество элементов на странице',
    defaultValue: 10,
  })
  @Min(1)
  @Max(50)
  limit = 10;
}
