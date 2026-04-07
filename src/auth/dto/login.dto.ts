import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Никнейм пользователя', example: 'mamont123' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ description: 'Пароль', example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
