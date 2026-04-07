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
  DefaultValuePipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';

@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    const result = await this.discussionsService.findAllPaginated(page, limit);
    setPaginationHeaders(res, '/api/discussions', page, limit, result.total);
    res.json(result.items);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) throw new NotFoundException();
    return discussion;
  }

  @Get(':id/comments')
  async findComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) throw new NotFoundException();
    setPaginationHeaders(res, `/api/discussions/${id}/comments`, page, limit, discussion.comments.length);
    const start = (page - 1) * limit;
    res.json(discussion.comments.slice(start, start + limit));
  }

  @Post()
  @UseGuards(AuthGuardApi)
  async create(@Body() dto: CreateDiscussionDto, @Req() req: Request) {
    return this.discussionsService.create(dto, req.session.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuardApi)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscussionDto,
    @Req() req: Request,
  ) {
    if (!(await this.discussionsService.isAuthor(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    return this.discussionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuardApi)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!(await this.discussionsService.isAuthor(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.discussionsService.delete(id);
    return { message: 'Обсуждение удалено' };
  }
}
