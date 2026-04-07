import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscussionDto {
  @ApiProperty({ description: 'Заголовок обсуждения', example: 'Как установить NestJS?' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Текст обсуждения', example: 'Подскажите, как правильно установить NestJS...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
