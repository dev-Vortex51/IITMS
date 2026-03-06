const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");

let ioInstance = null;

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken && typeof authToken === "string") {
    return authToken;
  }

  const header = socket.handshake?.headers?.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
};

const initializeSocket = (httpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: config.cors.origins,
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
      };
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
    if (socket.user?.role) {
      socket.join(`role:${socket.user.role}`);
    }

    logger.info(`Socket connected: user=${userId} socket=${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: user=${userId} socket=${socket.id}`);
    });
  });

  return ioInstance;
};

const getSocket = () => ioInstance;

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};

module.exports = {
  initializeSocket,
  getSocket,
  emitToUser,
};
