import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Текст комментария', example: 'Отличная тема!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
