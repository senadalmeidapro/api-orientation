// import {
//     CallHandler,
//     ExecutionContext,
//     Injectable,
//     NestInterceptor,
//     StreamableFile,
// } from '@nestjs/common';
// import { map, type Observable } from 'rxjs';

// import type { Response } from 'express';
// import { ApiSuccessResponseDto } from '../dto/api-response.dto';

// type ResponseLike = {
//     status?: unknown;
//     json?: unknown;
//     redirect?: unknown;
// };

// @Injectable()
// export class ApiSuccessResponseInterceptor<T> implements NestInterceptor<
//     T,
//     ApiSuccessResponseDto<T> | T
// > {
//     intercept(
//         context: ExecutionContext,
//         next: CallHandler<T>,
//     ): Observable<ApiSuccessResponseDto<T> | T> {
//         const response = context.switchToHttp().getResponse<Response>();

//         return next.handle().pipe(
//             map((data) => {
//                 if (response.headersSent || this.shouldBypassWrap(data)) {
//                     return data;
//                 }

//                 const statusCode = response.statusCode ?? 200;
//                 const message =
//                     statusCode === 201
//                         ? 'Ressource créée avec succès.'
//                         : 'Opération effectuée avec succès.';

//                 return {
//                     success: true,
//                     statusCode,
//                     message,
//                     data,
//                 };
//             }),
//         );
//     }

//     private shouldBypassWrap(data: unknown): boolean {
//         if (!data) {
//             return false;
//         }

//         if (data instanceof StreamableFile) {
//             return true;
//         }

//         if (typeof data === 'object') {
//             const typedData = data as ResponseLike & {
//                 success?: unknown;
//                 statusCode?: unknown;
//                 data?: unknown;
//             };

//             if (
//                 typedData.success === true &&
//                 typeof typedData.statusCode === 'number' &&
//                 'data' in typedData
//             ) {
//                 return true;
//             }

//             if (
//                 typeof typedData.status === 'function' &&
//                 typeof typedData.json === 'function' &&
//                 typeof typedData.redirect === 'function'
//             ) {
//                 return true;
//             }
//         }

//         return false;
//     }
// }
