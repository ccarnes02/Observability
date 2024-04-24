const { Resource } = require("@opentelemetry/resources");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

module.exports = (serviceName) => {
    const exporter = new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces', // Default URL for OTLP HTTP Trace Exporter
        serviceName: serviceName
    });

    const provider = new NodeTracerProvider({
        resource: new Resource({
            'service.name': serviceName,
        }),
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });
    
    return trace.getTracer(serviceName);
};
