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
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('discussions')
export class DiscussionsController {
  constructor(
    private discussionsService: DiscussionsService,
    private authService: AuthService,
  ) {}

  @Get()
  @Render('discussions/index')
  list(@Req() req: Request) {
    return { user: null };
  }

  @Get('new')
  @UseGuards(AuthGuard)
  @Render('discussions/new')
  async newForm(@Req() req: Request) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    return { user };
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
      user: null,
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
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    const isAuthor = await this.discussionsService.isAuthor(
      id,
      user?.id ?? 0,
    );
    if (!isAuthor) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужое обсуждение',
      );
    }
    return {
      discussionId: id,
      user,
    };
  }
}
