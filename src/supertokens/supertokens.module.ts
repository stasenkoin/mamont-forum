import { DynamicModule, Module } from '@nestjs/common';
import { SupertokensService } from './supertokens.service';
import { SUPERTOKENS_CONFIG, SupertokensConfig } from './supertokens.config';

@Module({})
export class SupertokensModule {
  static forRoot(config: SupertokensConfig): DynamicModule {
    return {
      module: SupertokensModule,
      global: true,
      providers: [
        { provide: SUPERTOKENS_CONFIG, useValue: config },
        SupertokensService,
      ],
      exports: [SupertokensService],
    };
  }
}
