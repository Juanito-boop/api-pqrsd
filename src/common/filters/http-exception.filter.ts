import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // Log the full exception for debugging
    const exceptionResponse = exception.getResponse();
    console.error('HttpException:', {
      status,
      message: exception.message,
      response: exceptionResponse,
      stack: exception.stack,
    });

    // If the failing route is the public submit endpoint, log the incoming payload
    try {
      if (request.url === '/api/v1/pqrsd/submit') {
        console.error('PQRSD submit failed. Request method:', request.method);
        console.error('PQRSD submit payload:', request.body);
        console.error('PQRSD validation response:', exceptionResponse);
      }
    } catch (err) {
      // swallow logging errors to avoid masking original exception
      console.error('Error while logging submit payload:', err);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      error: exception.getResponse(),
    };

    response.status(status).json(errorResponse);
  }
}