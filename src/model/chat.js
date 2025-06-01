const { prisma } = require('../db/client');

const userSelect = {
    id: true,
    name: true,
    surname: true,
    username: true,
    files: {
        select: {
            id: true,
            filename: true,
            createdAt: true,
        }
    },
};

const getOrCreateConversation = async ({ user1Id, user2Id }) => {
    let conversation = await prisma.conversations.findFirst({
        where: {
            OR: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id }
            ],
        }
    });
    if (!conversation) {
        conversation = await prisma.conversations.create({
            data: { user1Id, user2Id },
        });
    }
    return conversation;
};

const getConversation = async ({ conversationId }) => {
    return prisma.conversations.findUnique({
        where: { id: Number(conversationId) },
    });
}

const getUserConversations = async ({ userId }) => {
    return prisma.conversations.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            user1: {
                select: userSelect
            },
            user2: {
                select: userSelect
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    });
};

const createMessage = async ({ conversationId, senderId, recipientId, content }) => {
    const message = await prisma.messages.create({
        data: { conversationId, senderId, recipientId, content }
    });
    await prisma.conversations.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });
    return message;
};

const getMessages = async ({ conversationId, limit = 20, before }) => {
    return prisma.messages.findMany({
        where: {
            conversationId,
            deleted: false,
            ...(before && { createdAt: { lt: new Date(before) } })
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit)
    });
};

const deleteMessage = async ({ id, userId }) => {
    const msg = await prisma.messages.findUnique({ where: { id: Number(id) } });
    if (!msg || msg.senderId !== userId) return null;
    return prisma.messages.update({
        where: { id: Number(id) },
        data: { deleted: true }
    });
};

const markMessageRead = async ({ id, userId }) => {
    const msg = await prisma.messages.findUnique({ where: { id: Number(id) } });
    if (!msg || msg.recipientId !== userId) return null;
    return prisma.messages.update({
        where: { id: Number(id) },
        data: { read: true }
    });
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    createMessage,
    getMessages,
    deleteMessage,
    markMessageRead,
    getConversation,
}
