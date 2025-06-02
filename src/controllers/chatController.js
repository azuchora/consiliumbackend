const {
    getOrCreateConversation,
    getUserConversations,
    createMessage,
    getMessages,
    deleteMessage,
    markMessageRead,
    getConversation,
    getMessage
} = require('../model/chat');
const { StatusCodes } = require('http-status-codes');
const { sockets } = require('../socket');
const { sanitizeId } = require('../services/sanitizationService');
const {
    emitChatMessage,
    emitChatDelete,
    emitChatRead
} = require('../socket/chat');
const { notifyUser } = require('../services/notificationService');

const handleGetOrCreateConversation = async (req, res) => {
    const user1Id = req.user.id;
    const user2Id = sanitizeId(req.body.userId);
    if (user1Id === user2Id) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot chat with yourself' });
    const conversation = await getOrCreateConversation({ user1Id, user2Id });
    res.json({ conversation });
};

const handleGetConversations = async (req, res) => {
    const userId = req.user.id;
    const conversations = await getUserConversations({ userId });
    res.json({ conversations });
};

const handleSendMessage = async (req, res) => {
    const senderId = req.user.id;
    const conversationId = sanitizeId(req.params.conversationId);
    const { content } = req.body;

    const conversation = await getConversation({ conversationId });

    if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Conversation not found' });
    }

    const recipientId = (conversation.user1Id === senderId) ? conversation.user2Id : conversation.user1Id;
    if (!recipientId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid conversation' });
    }

    const message = await createMessage({
        conversationId: Number(conversationId),
        senderId,
        recipientId,
        content
    });

    emitChatMessage(sockets.chat, recipientId, message);
    emitChatMessage(sockets.chat, senderId, message);
    res.status(StatusCodes.CREATED).json({ message });
    notifyUser({
        userId: recipientId,
        actorId: senderId,
        type: 'new_message',
        conversationId: Number(conversationId),
        messageId: message.id,
    });
};

const handleGetMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { limit = 15, before } = req.query;
    const messages = await getMessages({ conversationId: Number(conversationId), limit, before });
    res.json({ messages });
};

const handleDeleteMessage = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const msg = await getMessage({ id: Number(id) });
    
    if(!msg || msg.senderId !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false });
    }

    const deleted = await deleteMessage({ id, userId });
    if (deleted) {
        emitChatDelete(sockets.chat, msg.recipientId, { id: Number(id) });
        emitChatDelete(sockets.chat, userId, { id: Number(id) });
        res.json({ success: true });
    } else {
        res.status(StatusCodes.FORBIDDEN).json({ success: false });
    }
};

const handleMarkRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updated = await markMessageRead({ id, userId });
    if (updated) {
        emitChatRead(sockets.chat, userId, { id: Number(id), userId });
        res.json({ success: true });
    } else {
        res.status(StatusCodes.FORBIDDEN).json({ success: false });
    }
};

module.exports = {
    handleGetOrCreateConversation,
    handleGetConversations,
    handleSendMessage,
    handleGetMessages,
    handleDeleteMessage,
    handleMarkRead,
};