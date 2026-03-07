const { Queue, Worker, QueueEvents } = require("bullmq");
const config = require("../config");
const logger = require("../utils/logger");
const emailService = require("../utils/emailService");

const EMAIL_QUEUE_NAME = "email-jobs";
const EMAIL_DLQ_NAME = "email-jobs-dlq";

let queue = null;
let deadLetterQueue = null;
let worker = null;
let queueEvents = null;
let recentFailureTimestamps = [];

const connectionOptions = config.redis.url
  ? { connection: { url: config.redis.url } }
  : null;

const isQueueEnabled = () => Boolean(connectionOptions);

const getQueue = () => {
  if (!isQueueEnabled()) return null;
  if (!queue) {
    queue = new Queue(EMAIL_QUEUE_NAME, connectionOptions);
  }
  return queue;
};

const getDeadLetterQueue = () => {
  if (!isQueueEnabled()) return null;
  if (!deadLetterQueue) {
    deadLetterQueue = new Queue(EMAIL_DLQ_NAME, connectionOptions);
  }
  return deadLetterQueue;
};

const registerFailure = () => {
  const now = Date.now();
  const windowMs = config.queue.failureAlertWindowMs;
  recentFailureTimestamps = recentFailureTimestamps
    .filter((timestamp) => now - timestamp < windowMs)
    .concat(now);

  if (
    recentFailureTimestamps.length >= config.queue.failureAlertThreshold
  ) {
    logger.error(
      `Email queue failure alert threshold reached: ${recentFailureTimestamps.length} failures in ${windowMs / 1000}s`,
    );
  }
};

const processEmailJob = async (job) => {
  const { type, payload } = job.data;

  switch (type) {
    case "invitation":
      return emailService.sendInvitation(payload);
    case "resend-invitation":
      return emailService.resendInvitation(payload);
    case "password-reset":
      return emailService.sendPasswordReset(payload);
    case "welcome":
      return emailService.sendWelcome(payload);
    default:
      throw new Error(`Unknown email job type: ${type}`);
  }
};

const startEmailWorker = () => {
  if (!isQueueEnabled()) {
    logger.warn("Email queue disabled: REDIS_URL is not configured");
    return;
  }

  if (worker) return;

  worker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
    ...connectionOptions,
    concurrency: config.queue.emailConcurrency,
  });

  queueEvents = new QueueEvents(EMAIL_QUEUE_NAME, connectionOptions);

  worker.on("failed", async (job, error) => {
    registerFailure();
    logger.error(
      `Email job failed (${job?.name || "unknown"}): ${error.message}`,
    );

    if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
      const dlq = getDeadLetterQueue();
      if (dlq) {
        await dlq.add(
          `failed-${job.name || "email"}`,
          {
            originalJobId: job.id,
            originalQueue: EMAIL_QUEUE_NAME,
            failedAt: new Date().toISOString(),
            reason: error.message,
            attemptsMade: job.attemptsMade,
            data: job.data,
          },
          {
            removeOnComplete: 200,
            removeOnFail: 500,
          },
        );
      }
    }
  });

  queueEvents.on("completed", ({ jobId }) => {
    logger.info(`Email job completed: ${jobId}`);
  });

  logger.info("Email queue worker started");
};

const enqueueEmailJob = async (type, payload, options = {}) => {
  const emailQueue = getQueue();
  if (!emailQueue) {
    return processEmailJob({ data: { type, payload } });
  }

  return emailQueue.add(
    type,
    { type, payload },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 100,
      ...options,
    },
  );
};

const getQueueHealth = async () => {
  const emailQueue = getQueue();
  const dlq = getDeadLetterQueue();

  if (!emailQueue) {
    return {
      enabled: false,
      queueName: EMAIL_QUEUE_NAME,
      deadLetterQueueName: EMAIL_DLQ_NAME,
      status: "disabled",
    };
  }

  const [counts, dlqCounts] = await Promise.all([
    emailQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    ),
    dlq
      ? dlq.getJobCounts("waiting", "active", "completed", "failed", "delayed")
      : Promise.resolve({}),
  ]);

  return {
    enabled: true,
    queueName: EMAIL_QUEUE_NAME,
    deadLetterQueueName: EMAIL_DLQ_NAME,
    counts,
    deadLetterCounts: dlqCounts,
    alerting: {
      windowMs: config.queue.failureAlertWindowMs,
      threshold: config.queue.failureAlertThreshold,
      recentFailures: recentFailureTimestamps.length,
    },
  };
};

const stopEmailWorker = async () => {
  await Promise.all([
    worker?.close(),
    queueEvents?.close(),
    queue?.close(),
    deadLetterQueue?.close(),
  ]);
};

module.exports = {
  startEmailWorker,
  stopEmailWorker,
  enqueueEmailJob,
  getQueueHealth,
  getQueue,
  getDeadLetterQueue,
  EMAIL_QUEUE_NAME,
  EMAIL_DLQ_NAME,
};
