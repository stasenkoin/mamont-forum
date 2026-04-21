import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHash } from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const isApiGet =
      req.method === 'GET' && req.originalUrl.startsWith('/api/');
    if (!isApiGet) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        if (res.headersSent) return data;
        const body = JSON.stringify(data ?? null);
        const hash = createHash('md5').update(body).digest('hex');
        const etag = `W/"${hash}"`;
        res.setHeader('ETag', etag);

        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch === etag) {
          res.status(HttpStatus.NOT_MODIFIED);
          return undefined;
        }
        return data;
      }),
    );
  }
}
