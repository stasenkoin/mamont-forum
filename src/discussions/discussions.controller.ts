import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Req,
  Render,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { DiscussionsService } from './discussions.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('discussions')
export class DiscussionsController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get()
  @Render('discussions/index')
  list(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }

  @Get('new')
  @UseGuards(AuthGuard)
  @Render('discussions/new')
  newForm(@Req() req: Request) {
    return { user: req.session };
  }

  @Get(':id')
  @Render('discussions/show')
  async show(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    return {
      discussionId: id,
      user: req.session.userId ? req.session : null,
    };
  }

  @Get(':id/edit')
  @UseGuards(AuthGuard)
  @Render('discussions/edit')
  async editForm(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    const isAuthor = await this.discussionsService.isAuthor(
      id,
      req.session.userId,
    );
    if (!isAuthor) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужое обсуждение',
      );
    }
    return {
      discussionId: id,
      user: req.session,
    };
  }
}
