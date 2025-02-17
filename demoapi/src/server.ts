import { ApiController } from './apiController.js';
import { Configuration } from './configuration.js';
import { ExceptionHandler } from './errors/exceptionHandler.js';
import { LoggerMiddleware } from './logging/loggerMiddleware.js';
import { OAuthFilter } from './oauth/oauthFilter.js';
import startTracing from './opentelemetry/tracing.js';

// Configure OpenTelemetry
const configuration = new Configuration();
startTracing(configuration);

// Load Express once OpenTelemetry has finished loading
const express = (await import('express')).default;
const application = express();

// A logging middleware
const logger = new LoggerMiddleware();
application.use('*_', logger.logRequest);

// An OAuth filter middleware
const oauthFilter = new OAuthFilter(configuration);
application.use('*_', oauthFilter.validateAccessToken);

// Use a controller to run the API's business logic
const controller = new ApiController();
application.post('/', controller.getData);

// An exception handler
const exceptionHandler = new ExceptionHandler();
application.use('*_', exceptionHandler.onUnhandledException);

// Start listening
application.listen(configuration.port, () => {
    console.log(`API is listening on port ${configuration.port}`);
});
