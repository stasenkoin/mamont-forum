import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/auth.guard';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private authService: AuthService) {}

  @Get()
  @Render('account/index')
  async account(@Req() req: Request) {
    const user = await this.authService.findById(req.session.userId);
    return { user: req.session, account: user };
  }

  @Post('delete')
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const userId = req.session.userId;
    req.session.destroy(async () => {
      await this.authService.deleteAccount(userId);
      res.redirect('/discussions');
    });
  }
}
