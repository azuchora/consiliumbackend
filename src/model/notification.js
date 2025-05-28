const { prisma } = require('../db/client');

const createNotification = async ({ userId, type, metadata }) => {
    return await prisma.notifications.create({
        data: {
            userId,
            type,
            metadata,
            read: false,
        }
    });
};

const getUserNotifications = async ({ userId, limit = 10, before }) => {
    return await prisma.notifications.findMany({
        where: {
            userId,
            ...(before && { createdAt: { lt: before } })
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
    });
};

const markAsRead = async (id) => {
    return await prisma.notifications.update({
        where: { id },
        data: { read: true }
    });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};