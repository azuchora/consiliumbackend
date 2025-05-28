const { getUserNotifications, markAsRead } = require('../model/notification');
const { sanitizeId } = require('../services/sanitizationService');

const handleGetNotifications = async (req, res) => {
    try {
        const { before, limit = 10 } = req.query;
        const user = req.user;
        
        const notifications = await getUserNotifications({
            userId: user.id,
            limit,
            before,
        });
        
        const newLastFetchedTimestamp =
            notifications.length > 0
                ? notifications[notifications.length - 1].createdAt
                : before;

        return res.status(200).json({
            notifications,
            pagination: {
                limit: Number(limit),
                timestamp: newLastFetchedTimestamp,
                hasMore: notifications.length === Number(limit),
            },
        });
    } catch (e) {
        console.error('getUserNotifications error:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const handleMarkAsRead = async (req, res) => {
    try {
        const id = sanitizeId(req.params.id);
        const notification = await markAsRead(id);
        return res.status(200).json({ notification });
    } catch (e) {
        return res.status(500).json({ message: 'Could not update notification.' });
    }
};

module.exports = { 
    handleGetNotifications,
    handleMarkAsRead,
};
