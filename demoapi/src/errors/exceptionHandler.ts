import { NextFunction, Request, Response } from 'express';
import { ApiError } from './apiError.js';

export class ExceptionHandler {

    public constructor() {
        this.onUnhandledException = this.onUnhandledException.bind(this);
    }

    public onUnhandledException(unhandledException: any, request: Request, response: Response, next: NextFunction): void {

        const apiError = this.getApiError(unhandledException);
        this.writeErrorResponse(apiError, response);
    }

    private getApiError(unhandledException: any): ApiError {

        if (unhandledException instanceof ApiError) {
            return unhandledException;
        }

        return new ApiError(500, 'server_error', 'Problem encountered in the API', unhandledException.message);
    }

    private writeErrorResponse(apiError: ApiError, response: Response): void {

        response.locals.logData.error = apiError.toLogJson();
        response.setHeader('Content-Type', 'application/json');
        response.status(apiError.status).send(JSON.stringify(apiError.toClientJson()));
    }
}
