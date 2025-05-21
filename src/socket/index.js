const { Server } = require("socket.io");
const { registerCommentSocket } = require('./comments');
const { registerNotificationSocket } = require("./notifications");

let sockets = {};

/**
 * @param {import("http").Server} server 
 */
const setupSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000', 
            methods: ['GET', 'POST', 'DELETE'],
            credentials: true,
        },
     });

    sockets.comments = registerCommentSocket(io);
    sockets.notifications = registerNotificationSocket(io);

    return io;
}

module.exports = {
    setupSockets,
    get sockets() {
        return sockets;
    }
};