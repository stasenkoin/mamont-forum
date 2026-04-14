import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Никнейм', example: 'mamont123' })
  nickname: string;

  @ApiPropertyOptional({
    description: 'URL аватара',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'Дата регистрации',
    example: '2026-04-10T12:00:00.000Z',
  })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Никнейм', example: 'mamont123' })
  nickname: string;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Сообщение', example: 'Операция выполнена' })
  message: string;
}
