const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [25, 50, 100, 200, 400, 800, 1200, 2000, 5000],
});

register.registerMetric(httpRequestDurationMs);

const httpMetricsMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    httpRequestDurationMs
      .labels(req.method, route, String(res.statusCode))
      .observe(durationMs);
  });

  next();
};

const metricsHandler = async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  httpMetricsMiddleware,
  metricsHandler,
};
