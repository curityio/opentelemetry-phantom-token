import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Configuration } from './configuration.js';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

const configuration = new Configuration();
const otelExporter = new OTLPTraceExporter({
    url: configuration.openTelemetryExporterEndpoint,
});

const provider = new NodeTracerProvider({
    resource: new Resource({
        ['service.name']: 'demoapi',
    }),
    spanProcessors: [
        new SimpleSpanProcessor(otelExporter),

        // Uncomment this to output the API's spans to the console
        // new SimpleSpanProcessor(new ConsoleSpanExporter()),
    ],
});
provider.register();

// Add a span for incoming requests to the demo API and calls from the demo API to the JWKS URI
registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
    ],
});
