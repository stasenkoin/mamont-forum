import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserCountDto {
  @ApiProperty({ description: 'Количество обсуждений', example: 5 })
  discussions: number;

  @ApiProperty({ description: 'Количество комментариев', example: 12 })
  comments: number;
}

export class UserListResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Никнейм', example: 'ivan' })
  nickname: string;

  @ApiPropertyOptional({
    description: 'URL аватара',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl: string | null;

  @ApiProperty({ description: 'Дата регистрации' })
  createdAt: Date;

  @ApiProperty({ description: 'Счётчики', type: UserCountDto })
  _count: UserCountDto;
}
