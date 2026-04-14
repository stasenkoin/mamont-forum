import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Req, Render } from '@nestjs/common';
import { Request } from 'express';

@ApiExcludeController()
@Controller('users')
export class UsersController {
  @Get()
  @Render('users/index')
  list(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }
}
