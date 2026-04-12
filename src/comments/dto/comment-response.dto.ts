import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CommentAuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'mamont123' })
  nickname: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'ID комментария', example: 1 })
  id: number;

  @ApiProperty({ description: 'Текст комментария', example: 'Отличная тема!' })
  content: string;

  @ApiProperty({ description: 'Дата создания', example: '2026-04-10T12:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'ID автора', example: 1 })
  authorId: number | null;

  @ApiProperty({ description: 'ID обсуждения', example: 1 })
  discussionId: number;

  @ApiPropertyOptional({ description: 'Автор', type: CommentAuthorDto })
  author: CommentAuthorDto | null;
}
