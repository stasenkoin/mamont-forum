import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Req, Render } from '@nestjs/common';
import { Request } from 'express';

@ApiExcludeController()
@Controller('rules')
export class RulesController {
  @Get()
  @Render('rules/index')
  rules(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }
}
