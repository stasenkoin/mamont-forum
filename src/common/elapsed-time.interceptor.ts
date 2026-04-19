import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { performance } from 'perf_hooks';
import type { GraphQLResolveInfo } from 'graphql';

function formatElapsed(ms: number): string {
  return ms < 10 ? ms.toFixed(2) : Math.round(ms).toString();
}

const patchedResponses = new WeakSet<Response>();

function attachElapsedHeader(
  res: Response,
  start: number,
  logger: Logger,
  label: string,
): void {
  if (patchedResponses.has(res)) return;
  patchedResponses.add(res);

  const originalEnd = res.end.bind(res) as (...args: unknown[]) => Response;

  res.end = function (this: Response, ...args: unknown[]): Response {
    const elapsed = formatElapsed(performance.now() - start);
    if (!res.headersSent) {
      res.setHeader('X-Elapsed-Time', `${elapsed}ms`);
    }
    logger.log(`${label}: ${elapsed} ms`);
    return originalEnd(...args);
  } as Response['end'];
}
@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ElapsedTime');

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    if (context.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const { res } = gqlCtx.getContext<{ req: Request; res: Response }>();
      const info = gqlCtx.getInfo<GraphQLResolveInfo>();

      if (res) {
        attachElapsedHeader(
          res,
          start,
          this.logger,
          `GraphQL ${info.fieldName}`,
        );
      }
      return next.handle();
    }

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();

    attachElapsedHeader(
      res,
      start,
      this.logger,
      `${req.method} ${req.originalUrl}`,
    );

    const renderTemplate = this.reflector.get<string>(
      '__renderTemplate__',
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data: unknown) => {
        if (renderTemplate && data && typeof data === 'object') {
          const elapsed = formatElapsed(performance.now() - start);
          return { ...data, elapsedTime: elapsed };
        }
        return data;
      }),
    );
  }
}
