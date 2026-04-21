import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserContextMiddleware } from './common/user-context.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { SupertokensModule } from './supertokens/supertokens.module';
import type { Request, Response } from 'express';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppController } from './app.controller';
import { ElapsedTimeInterceptor } from './common/elapsed-time.interceptor';
import { EtagInterceptor } from './common/etag.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscussionLikesModule } from './discussion-likes/discussion-likes.module';
import { RulesModule } from './rules/rules.module';
import { UsersModule } from './users/users.module';
import { ComplexityPlugin } from './graphql/complexity.plugin';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { CommentsResolver } from './graphql/resolvers/comments.resolver';
import { DiscussionLikesResolver } from './graphql/resolvers/discussion-likes.resolver';
import { DiscussionsResolver } from './graphql/resolvers/discussions.resolver';
import { NotificationsResolver } from './graphql/resolvers/notifications.resolver';
import { UsersResolver } from './graphql/resolvers/users.resolver';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({ isGlobal: true, ttl: 5000 }),
    SupertokensModule.forRoot({
      connectionUri: process.env.SUPERTOKENS_CONNECTION_URI ?? '',
      apiKey: process.env.SUPERTOKENS_API_KEY ?? '',
      appName: 'Mamont Forum',
      apiDomain: process.env.APP_URL ?? 'http://localhost:3456',
      websiteDomain: process.env.APP_URL ?? 'http://localhost:3456',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      csrfPrevention: false,
      playground: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    AuthModule,
    DiscussionsModule,
    CommentsModule,
    NotificationsModule,
    DiscussionLikesModule,
    RulesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ElapsedTimeInterceptor },
    { provide: APP_INTERCEPTOR, useClass: EtagInterceptor },
    ComplexityPlugin,
    AuthResolver,
    DiscussionsResolver,
    CommentsResolver,
    NotificationsResolver,
    DiscussionLikesResolver,
    UsersResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
