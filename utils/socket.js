const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const appConfig = require("config");
const config = require("../config/env.config");

let io;
const userSocketMap = new Map(); // userId (string) -> Set<socketId>

const addUserSocket = (userId, socketId) => {
  if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
  userSocketMap.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const set = userSocketMap.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSocketMap.delete(userId);
};

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.allowedOrigins,
    },
  });

  io.on("connection", (socket) => {
    // Client sends its auth token after connecting; we resolve it to a userId
    // and track it so we can target that specific user later (e.g. mentions).
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, appConfig.get("jwtPrivateKey"));
        socket.data.userId = String(decoded._id);
        addUserSocket(socket.data.userId, socket.id);
      } catch {
        // invalid/expired token - leave socket unauthenticated, ticket:changed still works
      }
    });

    socket.on("disconnect", () => {
      if (socket.data?.userId) {
        removeUserSocket(socket.data.userId, socket.id);
      }
    });
  });

  return io;
};

exports.emitTicketChanged = (ticketId, action, excludeSocketId) => {
  if (!io) return;

  const emitter = excludeSocketId ? io.except(excludeSocketId) : io;

  emitter.emit("ticket:changed", { ticketId, action });
};

// Sends an event only to the given user's active socket(s), across all their open tabs.
exports.emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;

  const socketIds = userSocketMap.get(String(userId));
  if (!socketIds) return;

  socketIds.forEach((socketId) => io.to(socketId).emit(event, payload));
};

exports.emitForceLogout = (socketId, event = "account:deactivated") => {
  if (!io || !socketId) return;

  io.to(socketId).emit(event);
};
