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
  async list(@Req() req: Request) {
    const discussions = await this.discussionsService.findAll();
    return {
      discussions,
      user: req.session.userId ? req.session : null,
    };
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
    if (!discussion) throw new NotFoundException();

    const userLiked = req.session.userId
      ? discussion.likes.some((l) => l.userId === req.session.userId)
      : false;

    return {
      discussion,
      userLiked,
      totalComments: discussion._count.comments,
      user: req.session.userId ? req.session : null,
    };
  }

  @Get(':id/edit')
  @UseGuards(AuthGuard)
  @Render('discussions/edit')
  async editForm(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) throw new NotFoundException();
    return {
      discussion,
      user: req.session,
    };
  }
}
