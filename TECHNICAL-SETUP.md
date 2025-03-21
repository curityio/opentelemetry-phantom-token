# Technical Setup

The following notes explain further details about the technical setup and the example API.\
The deployment is based on the [OpenTelemetry Collector Demo](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo).

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

The API also writes JSON logs that include the trace ID and span ID of incoming requests.

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

During development the API does not run behind an API gateway.\
Set the following directive in the `./democlient/run.sh` script to call the locally running API:

```bash
LOCAL_API='true'
```

Then run the demo client to generate local API requests with an access token:

```bash
`./democlient/run.sh`
```

The API exports traces to the Open Telemetry Collector at `http://localhost:4318/v1/traces`.\
You can then see spans from the local API at `http://traces.example.com`.
