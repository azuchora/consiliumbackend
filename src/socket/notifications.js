/**
 * @param {import("socket.io").Server} io
 */
const registerNotificationSocket = (io) => {
    const notificationNamespace = io.of('/notifications');

    notificationNamespace.on('connection', (socket) => {
        console.log(`[notifications] Connection from: ${socket.id}`);

        socket.on('joinUserRoom', (userId) => {
            if (!userId) return;
            socket.join(`user_${userId}`);
            console.log(`[notifications] ${socket.id} joined the room user_${userId}`);
        });

        socket.on('leaveUserRoom', (userId) => {
            if (!userId) return;
            socket.leave(`user_${userId}`);
            console.log(`[notifications] ${socket.id} left the room user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[notifications] disconnected: ${socket.id}`);
        });
    });

  return notificationNamespace;
}

/**
 * @param {import("socket.io").Namespace} notificationNamespace 
 * @param {string} userId 
 * @param {object} notification 
 */
const emitNotification = (notificationNamespace, userId, notification) => {
    notificationNamespace.to(`user_${userId}`).emit('notification', notification);
}

module.exports = {
    registerNotificationSocket,
    emitNotification,
};