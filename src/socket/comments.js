const { Server } = require('socket.io');
const verifySocketJWT = require('../middleware/verifySocketAuth');

/**
 * @param {import("socket.io").Server} io 
 */
const registerCommentSocket = (io) => {
    const commentNamespace = io.of('/comments');

    commentNamespace.use(verifySocketJWT);

    commentNamespace.on('connection', (socket) => {
         console.log(`[comments] new connection from: ${socket.id}, user: ${socket.user.username}`);

        socket.on('joinPostRoom', (postId) => {
            socket.join(`post_${postId}`);
            console.log(`[comments] ${socket.id} joined the room: post_${postId}`);
        });

        socket.on('leavePostRoom', (postId) => {
            socket.leave(`post_${postId}`);
            console.log(`[comments] ${socket.id} left the room: post_${postId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[comments] disconnected: ${socket.id}, user: ${socket.user.username}`);
        });
    });

    return commentNamespace;
}

/**
 * @param {import("socket.io").Namespace} commentNamespace 
 * @param {string} postId 
 * @param {object} commentData 
 */
const emitNewComment = (commentNamespace, postId, comment) => {
    commentNamespace.to(`post_${postId}`).emit('newComment', comment);
}

module.exports = {
    registerCommentSocket,
    emitNewComment,
};
