import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Req, Render, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private authService: AuthService) {}

  @Get()
  @Render('account/index')
  async account(@Req() req: Request) {
    const userInfo = await this.authService.findById(req.session.userId);
    return { user: req.session, userInfo };
  }
}
