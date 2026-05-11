import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';
import { SUPERTOKENS_CONFIG, SupertokensConfig } from './supertokens.config';

@Injectable()
export class SupertokensService {
  constructor(@Inject(SUPERTOKENS_CONFIG) private config: SupertokensConfig) {
    supertokens.init({
      framework: 'express',
      supertokens: {
        connectionURI: config.connectionUri,
        apiKey: config.apiKey,
      },
      appInfo: {
        appName: config.appName,
        apiDomain: config.apiDomain,
        websiteDomain: config.websiteDomain,
        apiBasePath: '/auth',
        websiteBasePath: '/login',
      },
      recipeList: [
        EmailPassword.init(),
        UserRoles.init(),
        Session.init({
          cookieSameSite: 'lax',
        }),
      ],
    });
  }
}
