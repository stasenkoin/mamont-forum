import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { DiscussionResponseDto } from './dto/discussion-response.dto';
import { MessageResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';

@ApiTags('Обсуждения')
@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список обсуждений' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Список обсуждений',
    type: [DiscussionResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('page и limit должны быть больше 0');
    }
    const result = await this.discussionsService.findAllPaginated(page, limit);
    setPaginationHeaders(res, '/api/discussions', page, limit, result.total);
    res.json(result.items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить обсуждение по ID' })
  @ApiResponse({
    status: 200,
    description: 'Обсуждение найдено',
    type: DiscussionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректный ID' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const discussion = await this.discussionsService.findOne(id, 1, 1000);
    if (!discussion) throw new NotFoundException();
    return discussion;
  }

  @Post()
  @ApiOperation({ summary: 'Создать обсуждение' })
  @ApiResponse({
    status: 201,
    description: 'Обсуждение создано',
    type: DiscussionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi)
  async create(@Body() dto: CreateDiscussionDto, @Req() req: Request) {
    return this.discussionsService.create(dto, req.session.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить обсуждение' })
  @ApiResponse({
    status: 200,
    description: 'Обсуждение обновлено',
    type: DiscussionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не автор)' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  @UseGuards(AuthGuardApi)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscussionDto,
    @Req() req: Request,
  ) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    if (discussion.authorId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }
    return this.discussionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить обсуждение' })
  @ApiResponse({
    status: 200,
    description: 'Обсуждение удалено',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректный ID' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не автор)' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  @UseGuards(AuthGuardApi)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    if (discussion.authorId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }
    await this.discussionsService.delete(id);
    return { message: 'Обсуждение удалено' };
  }
}
