# Technical Setup

The following notes explain more details about the technical setup and the example API.

## Open Telemetry Collector

The OpenTelemetry Collector runs within the backend and is not exposed to the internet.\
Therefore, only backend components contribute spans to the OpenTelemetry Collector.

## Demo API

The example API uses the [Node.js OpenTelemetry SDK](https://github.com/open-telemetry/opentelemetry-js) to add spans to incoming traces.

- The API adds a span for each incoming API request.
- The API adds a span for outgoing requests, like when it calls the JWKS URI to download token signing public keys.

The API uses the auto-instrumenting features of the SDK, to add spans for Express requests and outgoing HTTP requests.

```typescript
const otelExporter = new OTLPTraceExporter({
    url: configuration.openTelemetryExporterEndpoint,
});

const provider = new NodeTracerProvider({
    resource: new Resource({
        ['service.name']: 'demoapi',
    }),
    spanProcessors: [
        new SimpleSpanProcessor(otelExporter),
    ],
});
provider.register();

registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
    ],
});
```

The API uses ECMAScript modules so follows the guidelines for [OpenTelemetry ESM Support](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md).\
This means it starts with the following command to load OpenTelemetry before the application code.

```text
node --experimental-loader=@opentelemetry/instrumentation/hook.mjs --import ./dist/telemetry.js dist/server.js
```

The API also writes JSON logs that include the traceId and spanId of incoming requests.

```json
{
  "method": "POST",
  "path": "/",
  "time": "Mon, 17 Feb 2025 08:50:15 GMT",
  "traceId": "554b9ebb0dce9b472f3842eaf3c592eb",
  "spanId": "351637357a4e9068",
  "statusCode": 200
}
```

## Demo Client

The demo client just uses bash commands to get an OAuth access token and send it to the API.

```bash
./democlient/run.sh
```

Each request generates a `traceparent` header in the OpenTelemetry format.

```bash
function createTraceParent() {
  VERSION="00"
  TRACE_ID=$(openssl rand -hex 16)
  SPAN_ID=$(openssl rand -hex 8)
  TRACE_FLAG="01"
  echo "$VERSION-$TRACE_ID-$SPAN_ID-$TRACE_FLAG"
}
```

## API Development

During API development, run the API locally using the following commands.

```bash
cd demoapi
npm start
```

Then set the following directive in the `./democlient/run.sh` script.

```bash
LOCAL_API='true'
```

During development the API does not run behind an API gateway, but you can see its spans at `http://traces.example.com`.
