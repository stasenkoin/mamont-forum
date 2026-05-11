import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Render } from '@nestjs/common';

@ApiExcludeController()
@Controller('users')
export class UsersController {
  @Get()
  @Render('users/index')
  list() {
    return {};
  }
}
