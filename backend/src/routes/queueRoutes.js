const express = require("express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { authenticate } = require("../middleware/auth");
const { adminOnly } = require("../middleware/authorization");
const {
  getQueue,
  getDeadLetterQueue,
  getQueueHealth,
} = require("../jobs/emailQueue");

const router = express.Router();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/dashboard");

const queue = getQueue();
const deadLetterQueue = getDeadLetterQueue();

if (queue) {
  const queueAdapters = [new BullMQAdapter(queue)];
  if (deadLetterQueue) {
    queueAdapters.push(new BullMQAdapter(deadLetterQueue));
  }
  createBullBoard({
    queues: queueAdapters,
    serverAdapter,
  });
}

router.use(authenticate, adminOnly);

router.get("/health", async (_req, res, next) => {
  try {
    const health = await getQueueHealth();
    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
});

router.use("/dashboard", serverAdapter.getRouter());

module.exports = router;
