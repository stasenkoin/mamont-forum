import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Текст комментария', example: 'Исправленный комментарий' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
