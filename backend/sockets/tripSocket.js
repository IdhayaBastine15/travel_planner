const { verifyAccessToken } = require('../utils/jwt');

module.exports = function setupTripSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch { next(new Error('Invalid token')); }
  });

  const presence = new Map();

  io.on('connection', (socket) => {
    socket.on('join_trip', (tripId) => {
      socket.join(tripId);
      socket.currentTripId = tripId;
      if (!presence.has(tripId)) presence.set(tripId, new Set());
      presence.get(tripId).add({ socketId: socket.id, userId: socket.user.id, username: socket.user.username });
      io.to(tripId).emit('user_presence', { tripId, users: [...presence.get(tripId)].map((u) => ({ userId: u.userId, username: u.username })) });
    });

    socket.on('leave_trip', (tripId) => { socket.leave(tripId); removePresence(tripId, socket.id); broadcastPresence(io, tripId, presence); });
    socket.on('activity_added', (data) => socket.to(data.tripId).emit('activity_added', data));
    socket.on('activity_updated', (data) => socket.to(data.tripId).emit('activity_updated', data));
    socket.on('activity_deleted', (data) => socket.to(data.tripId).emit('activity_deleted', data));
    socket.on('expense_logged', (data) => socket.to(data.tripId).emit('expense_logged', data));
    socket.on('collaborator_joined', (data) => socket.to(data.tripId).emit('collaborator_joined', data));
    socket.on('new_comment', (data) => socket.to(data.tripId).emit('new_comment', data));

    socket.on('disconnect', () => {
      if (socket.currentTripId) { removePresence(socket.currentTripId, socket.id); broadcastPresence(io, socket.currentTripId, presence); }
    });
  });
};

function removePresence(tripId, socketId) {
  if (!presence.has(tripId)) return;
  for (const u of presence.get(tripId)) { if (u.socketId === socketId) { presence.get(tripId).delete(u); break; } }
}
function broadcastPresence(io, tripId, presence) {
  const users = presence.has(tripId) ? [...presence.get(tripId)].map((u) => ({ userId: u.userId, username: u.username })) : [];
  io.to(tripId).emit('user_presence', { tripId, users });
}
