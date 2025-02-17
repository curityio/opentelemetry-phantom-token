# OpenTelemetry Demo

An example end-to-end deployment for a phantom token flow that uses OpenTelemetry.

## OpenTelemetry Use Case

This deployment uses OpenTelemetry for a Docker Compose deployment that runs the phantom token flow.\
It demonstrates the use of `TraceId` and `SpanId` values between components and the use of visualization tools.

## Prerequisites

- A Docker engine.
- Node.js 20 or later.
- Copy a license file for the Curity Identity Server into the `idsvr` folder.

## Components

| Component | Location | Description |
| --------- | -------- | ----------- |
| Client | | A console shell client that initiates OAuth and API requests to begin a trace. |
| API Gateway | | The Kong API gateway adds a span to the trace. |
| API | http://api.example.com | An example Node.js API that adds a span to the trace using the OpenTelemetry SDK. |
| Authorization Server | http://login.example.com | The Curity Identity Server adds a span to the trace. |
| OpenTelemetry Collector | | The OpenTelemetry collector receives and distributes trace data. |
| Zipkin | http://traces.example.com | The Zipkin frontend visualizes the end-to-end trace data. |

## Deploy the Backend

First add these entries to the local computer's `/etc/hosts` file:

```text
api.example.com login.example.com traces.example.com
```

Then run the following commands to deploy all backend components within a Docker Compose network:

```bash
./build.sh
./run.sh
```

## Run the Client

Once the backend is deployed, run a console client that initiates OAuth and API requests:

```bash
./democlient/run.sh
```
