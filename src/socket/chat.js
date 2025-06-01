const verifySocketJWT = require('../middleware/verifySocketAuth');

/**
 * @param {import("socket.io").Server} io
 */
const registerChatSocket = (io) => {
    const chatNamespace = io.of('/chat');

    chatNamespace.use(verifySocketJWT);

    chatNamespace.on('connection', (socket) => {
        console.log(`[chat] Connection from: ${socket.id}, user: ${socket.user?.username}`);

        socket.on('joinUserRoom', (userId) => {
            if (!userId) return;
            socket.join(`user_${userId}`);
            console.log(`[chat] ${socket.id} joined the room user_${userId}`);
        });

        socket.on('leaveUserRoom', (userId) => {
            if (!userId) return;
            socket.leave(`user_${userId}`);
            console.log(`[chat] ${socket.id} left the room user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[chat] disconnected: ${socket.id}, user: ${socket.user?.username}`);
        });
    });

    return chatNamespace;
};

/**
 * @param {import("socket.io").Namespace} chatNamespace
 * @param {string|number} userId
 * @param {object} message
 */
const emitChatMessage = (chatNamespace, userId, message) => {
    chatNamespace.to(`user_${userId}`).emit('chatMessage', message);
};

/**
 * @param {import("socket.io").Namespace} chatNamespace
 * @param {string|number} userId
 * @param {object} data
 */
const emitChatDelete = (chatNamespace, userId, data) => {
    chatNamespace.to(`user_${userId}`).emit('chatDelete', data);
};

/**
 * @param {import("socket.io").Namespace} chatNamespace
 * @param {string|number} userId
 * @param {object} data
 */
const emitChatRead = (chatNamespace, userId, data) => {
    chatNamespace.to(`user_${userId}`).emit('chatRead', data);
};

module.exports = {
    registerChatSocket,
    emitChatMessage,
    emitChatDelete,
    emitChatRead,
};