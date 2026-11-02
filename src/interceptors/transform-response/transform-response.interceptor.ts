import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const httpContent = context.switchToHttp();
    const response = httpContent.getResponse();
    const statusCode = response.statusCode;

    // modifikasi response nya sesuai kebutuhan
    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode,
        message: 'Success',
        data
      }))
    );
  }
}
