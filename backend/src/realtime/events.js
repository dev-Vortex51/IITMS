const { emitToUser, getSocket } = require("./socket");

function notifyUser(userId, event, data) {
  emitToUser(userId, event, data);
}

function notifyRole(role, event, data) {
  const io = getSocket();
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

function notifyAdmins(event, data) {
  notifyRole("admin", event, data);
}

module.exports = {
  notifyUser,
  notifyRole,
  notifyAdmins,
};
