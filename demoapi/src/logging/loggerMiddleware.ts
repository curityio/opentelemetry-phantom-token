import api from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware {

    public async logRequest(request: Request, response: Response, next: NextFunction): Promise<void> {

        response.locals.logData = {} as any;
        response.locals.logData.method = request.method;
        response.locals.logData.path = request.originalUrl;
        response.locals.logData.time = new Date().toUTCString();

        let span = api.trace.getSpan(api.context.active());
        let traceId = span?.spanContext().traceId;
        if (traceId) {
            response.locals.logData.traceId = traceId;
        }

        let spanId = span?.spanContext().spanId;
        if (spanId) {
            response.locals.logData.spanId = spanId;
        }
        
        response.on('finish', () => {
            response.locals.logData.statusCode = response.statusCode;
            console.log(JSON.stringify(response.locals.logData, null, 2));
        });

        next();
    }
}
