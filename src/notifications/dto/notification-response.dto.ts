import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID уведомления', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Тип уведомления',
    example: 'discussion_commented',
  })
  type: string;

  @ApiProperty({
    description: 'Текст уведомления',
    example: 'mamont123 оставил комментарий',
  })
  message: string;

  @ApiProperty({ description: 'Прочитано ли', example: false })
  isRead: boolean;

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-04-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiPropertyOptional({ description: 'ID обсуждения', example: 1 })
  discussionId: number | null;
}
