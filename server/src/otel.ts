import opentelemetry from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { logger } from "./logger";

const OTEL_ENDPOINT = process.env.OTEL_ENDPOINT ?? "http://jaegar:4317";

export function otelSetup() {
  logger.info(`Setting up OpenTelemetry writing to ${OTEL_ENDPOINT}`);
  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: "feedrouter",
      [ATTR_SERVICE_VERSION]: "0.0.1",
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${OTEL_ENDPOINT}v1/traces`,
      headers: {},
    }),
    spanProcessors: [
      new opentelemetry.tracing.BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${OTEL_ENDPOINT}v1/traces`,
          headers: {},
        })
      ),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${OTEL_ENDPOINT}v1/metrics`, // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        headers: {}, // an optional object containing custom headers to be sent with each request
        concurrencyLimit: 1, // an optional limit on pending requests
      }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  sdk.start();

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("SDK shut down successfully"))
      .catch((error) => console.log("Error shutting down SDK", error))
      .finally(() => process.exit(0));
  });
}
