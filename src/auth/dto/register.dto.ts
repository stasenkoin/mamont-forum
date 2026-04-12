import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Никнейм пользователя', example: 'mamont123' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ description: 'Пароль', example: 'qwerty123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'URL аватара',
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
