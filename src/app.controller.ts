import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    res.redirect('/discussions');
  }
}
