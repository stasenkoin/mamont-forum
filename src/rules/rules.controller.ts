import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Render } from '@nestjs/common';

@ApiExcludeController()
@Controller('rules')
export class RulesController {
  @Get()
  @Render('rules/index')
  rules() {
    return { user: null };
  }
}
