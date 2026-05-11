import { Module } from '@nestjs/common';
import { RulesController } from './rules.controller';
import { RulesApiController } from './rules.api.controller';
import { RulesService } from './rules.service';

@Module({
  controllers: [RulesController, RulesApiController],
  providers: [RulesService],
})
export class RulesModule {}
