const { createNotification } = require('../model/notification');
const { emitNotification } = require('../socket/notifications');
const { sockets } = require('../socket');
const { getPost } = require('../model/posts');
const { getUser } = require('../model/user');

const notifyUser = async ({ userId, actorId, postId, commentId, type }) => {
    const actor = await getUser({ id: actorId });

    const avatarFilename = actor?.files?.[0]?.filename ?? '';

    const metadata = {
        authorId: actor.id,
        username: actor.username,
        avatarFilename,
    };

    if(type === 'new_comment'){
        Object.assign(metadata, { postId, commentId });
    }

    if(type === 'new_post'){
        const post = await getPost({ id: postId });
        Object.assign(metadata, { postId, isAnswered: post?.isAnswered ?? false });
    }

    const notification = await createNotification({
        userId,
        type,
        metadata,
    });

    emitNotification(sockets.notifications, userId, {
        id: notification.id,
        type,
        metadata,
        createdAt: notification.createdAt,
    });
};


module.exports = {
   notifyUser,
};
