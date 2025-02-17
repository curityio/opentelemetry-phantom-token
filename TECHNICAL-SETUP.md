# Technical Setup

The following notes explain more details about the technical setup and the example API.

## Demo API

The example API uses the [Node.js OpenTelemetry SDK](https://github.com/open-telemetry/opentelemetry-js) to add spans to incoming traces:

- The API adds a span for each incoming API request.
- The API adds a span for outgoing requests, like when it calls the JWKS URI to download token signing public keys.

The API uses the auto-instrument features of the Node.js OpenTelemetry SDK.\
It must load the OpenTelemetry SDK before other libraries, and uses the following command to do so:

```text
node --experimental-loader=@opentelemetry/instrumentation/hook.mjs dist/server.js
```

## Curity Identity Server

## Demo Client

