const { Server } = require("socket.io");
const { registerCommentSocket } = require('./comments');
const { registerNotificationSocket } = require("./notifications");
const { registerChatSocket } = require("./chat");
const corsOptions = require('../config/corsOptions');

let sockets = {};

/**
 * @param {import("http").Server} server 
 */
const setupSockets = (server) => {
    const io = new Server(server, {
        cors: corsOptions,
     });

    sockets.comments = registerCommentSocket(io);
    sockets.notifications = registerNotificationSocket(io);
    sockets.chat = registerChatSocket(io);

    return io;
}

module.exports = {
    setupSockets,
    get sockets() {
        return sockets;
    }
};