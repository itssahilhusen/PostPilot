import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    const formattedMessage =
      typeof message === "object" && message !== null
        ? (message as any).message || message
        : message;

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    response.status(status).json({
      statusCode: status,
      error: exception instanceof HttpException ? exception.name : "InternalServerError",
      message: formattedMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

