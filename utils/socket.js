const { Server } = require("socket.io");
const config = require("../config/env.config");

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.allowedOrigins,
    },
  });

  return io;
};

exports.emitTicketChanged = (ticketId, action, excludeSocketId) => {
  if (!io) return;

  const emitter = excludeSocketId ? io.except(excludeSocketId) : io;

  emitter.emit("ticket:changed", { ticketId, action });
};

exports.emitForceLogout = (socketId, event = "account:deactivated") => {
  if (!io || !socketId) return;

  io.to(socketId).emit(event);
};
