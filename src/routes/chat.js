const express = require('express');
const router = express.Router();
const {
    handleGetOrCreateConversation,
    handleGetConversations,
    handleSendMessage,
    handleGetMessages,
    handleDeleteMessage,
    handleMarkRead
} = require('../controllers/chatController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.get('/conversations', handleGetConversations);
router.get('/conversations/:conversationId/messages', handleGetMessages);

router.post('/conversations', handleGetOrCreateConversation);

router.post('/conversations/:conversationId/messages', handleSendMessage);

router.delete('/messages/:id', handleDeleteMessage);
router.patch('/messages/:id/read', handleMarkRead);

module.exports = router;