const { Queue, Worker, QueueEvents } = require("bullmq");
const config = require("../config");
const logger = require("../utils/logger");
const emailService = require("../utils/emailService");

const EMAIL_QUEUE_NAME = "email-jobs";

let queue = null;
let worker = null;
let queueEvents = null;

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

  worker.on("failed", (job, error) => {
    logger.error(
      `Email job failed (${job?.name || "unknown"}): ${error.message}`,
    );
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
      removeOnComplete: true,
      removeOnFail: 100,
      ...options,
    },
  );
};

const stopEmailWorker = async () => {
  await Promise.all([
    worker?.close(),
    queueEvents?.close(),
    queue?.close(),
  ]);
};

module.exports = {
  startEmailWorker,
  stopEmailWorker,
  enqueueEmailJob,
};
