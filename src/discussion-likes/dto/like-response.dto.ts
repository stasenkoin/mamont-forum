import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty({ description: 'ID лайка', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'ID обсуждения', example: 1 })
  discussionId: number;

  @ApiProperty({ description: 'Дата создания', example: '2026-04-10T12:00:00.000Z' })
  createdAt: Date;
}
