import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Req, Render, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  @Get()
  @Render('account/index')
  account(@Req() req: Request) {
    return { user: req.session };
  }
}
