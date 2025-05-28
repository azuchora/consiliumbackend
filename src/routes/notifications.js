const express = require('express');
const router = express.Router();
const { handleGetNotifications, handleMarkAsRead } = require('../controllers/notificationsController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.get('/notifications', handleGetNotifications);

router.patch('/notifications/:id/read', handleMarkAsRead);

module.exports = router;
