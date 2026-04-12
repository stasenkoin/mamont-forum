import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'mamont123' })
  nickname: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  avatarUrl: string | null;
}

class CountDto {
  @ApiProperty({ example: 5 })
  comments: number;

  @ApiProperty({ example: 3 })
  likes: number;
}

export class DiscussionResponseDto {
  @ApiProperty({ description: 'ID обсуждения', example: 1 })
  id: number;

  @ApiProperty({ description: 'Заголовок', example: 'Как установить NestJS?' })
  title: string;

  @ApiProperty({ description: 'Текст обсуждения', example: 'Подскажите, как правильно...' })
  content: string;

  @ApiProperty({ description: 'Дата создания', example: '2026-04-10T12:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'ID автора', example: 1 })
  authorId: number | null;

  @ApiPropertyOptional({ description: 'Автор', type: AuthorDto })
  author: AuthorDto | null;

  @ApiProperty({ description: 'Счётчики', type: CountDto })
  _count: CountDto;
}
