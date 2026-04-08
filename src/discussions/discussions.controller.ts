import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  Render,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
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

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateDiscussionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const discussion = await this.discussionsService.create(
      dto,
      req.session.userId,
    );
    res.redirect(`/discussions/${discussion.id}`);
  }

  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const limit = 5;
    const discussion = await this.discussionsService.findOne(id, page, limit);
    if (!discussion) throw new NotFoundException();
    const userId = req.session.userId;
    const userLiked = userId
      ? discussion.likes.some((l) => l.userId === userId)
      : false;
    const isAuthor = userId ? discussion.authorId === userId : false;

    const totalComments = discussion._count.comments;
    const totalPages = Math.ceil(totalComments / limit);

    res.render('discussions/show', {
      discussion,
      userLiked,
      isAuthor,
      user: userId ? req.session : null,
      currentPage: page,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  }

  @Get(':id/edit')
  @UseGuards(AuthGuard)
  async editForm(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!(await this.discussionsService.isAuthor(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    const discussion = await this.discussionsService.findOne(id);
    if (!discussion) throw new NotFoundException();
    res.render('discussions/edit', { discussion, user: req.session });
  }

  @Post(':id/update')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscussionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!(await this.discussionsService.isAuthor(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.discussionsService.update(id, dto);
    res.redirect(`/discussions/${id}`);
  }

  @Post(':id/delete')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!(await this.discussionsService.isAuthor(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.discussionsService.delete(id);
    res.redirect('/discussions');
  }
}
