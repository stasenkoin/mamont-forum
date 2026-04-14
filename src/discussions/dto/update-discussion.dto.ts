import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDiscussionDto {
  @ApiProperty({
    description: 'Заголовок обсуждения',
    example: 'Обновлённый заголовок',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Текст обсуждения',
    example: 'Обновлённый текст...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
