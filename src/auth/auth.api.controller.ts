import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Header,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { S3Service } from '../s3/s3.service';
import {
  UserResponseDto,
  MessageResponseDto,
  AvatarResponseDto,
} from './dto/user-response.dto';
import { AuthGuardApi } from '../common/auth-api.guard';

@ApiTags('Авторизация')
@Controller('api/auth')
export class AuthApiController {
  constructor(
    private authService: AuthService,
    private s3Service: S3Service,
  ) {}

  @Post('profile')
  @ApiOperation({
    summary: 'Создать профиль после регистрации через SuperTokens',
  })
  @ApiResponse({ status: 201, description: 'Профиль создан' })
  @ApiResponse({ status: 409, description: 'Никнейм уже занят' })
  async createProfile(
    @Body() body: { supertokensId: string; nickname: string },
  ) {
    if (!body.supertokensId || !body.nickname) {
      throw new UnauthorizedException('Некорректные данные');
    }
    if (await this.authService.nicknameExists(body.nickname)) {
      throw new ConflictException('Этот никнейм уже занят');
    }
    const user = await this.authService.createProfile(
      body.supertokensId,
      body.nickname,
    );
    return { id: user.id, nickname: user.nickname };
  }

  @Get('me')
  @Header('Cache-Control', 'private, max-age=60')
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi)
  @ApiCookieAuth('sAccessToken')
  async me(@Req() req: Request) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  @Patch('me/avatar')
  @UseGuards(AuthGuardApi)
  @ApiCookieAuth('sAccessToken')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить аватар пользователя' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (jpeg, png, gif, webp)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Аватар обновлён',
    type: AvatarResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат или размер файла' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|gif|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const ext = file.mimetype.split('/')[1];
    const key = `avatars/${user.id}-${Date.now()}.${ext}`;

    const avatarUrl = await this.s3Service.upload(
      key,
      file.buffer,
      file.mimetype,
    );

    await this.authService.updateAvatar(user.id, avatarUrl);

    return { avatarUrl };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({
    status: 200,
    description: 'Аккаунт удалён',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi)
  @ApiCookieAuth('sAccessToken')
  async deleteAccount(@Req() req: Request) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    await this.authService.deleteAccount(user.id);
    await req.session.revokeSession();
    return { message: 'Аккаунт удалён' };
  }
}
