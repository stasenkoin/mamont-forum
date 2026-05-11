import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Render } from '@nestjs/common';
import { RulesService } from './rules.service';

@ApiExcludeController()
@Controller('rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  @Render('rules/index')
  async rules() {
    const customRules = await this.rulesService.findAll();
    return { customRules };
  }
}
