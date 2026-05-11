import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { AuthGuardApi } from '../common/auth-api.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@ApiTags('Правила')
@Controller('api/rules')
export class RulesApiController {
  constructor(private rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'Список пользовательских правил' })
  findAll() {
    return this.rulesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuardApi, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('sAccessToken')
  @ApiOperation({ summary: 'Создать правило (только админ)' })
  @ApiResponse({ status: 201, description: 'Правило создано' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не админ)' })
  create(@Body() body: { title: string; content: string }) {
    if (!body?.title || !body?.content) {
      throw new BadRequestException('title и content обязательны');
    }
    return this.rulesService.create(body.title, body.content);
  }

  @Delete(':id')
  @UseGuards(AuthGuardApi, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('sAccessToken')
  @ApiOperation({ summary: 'Удалить правило (только админ)' })
  @ApiResponse({ status: 200, description: 'Удалено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не админ)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.rulesService.delete(id);
  }
}
