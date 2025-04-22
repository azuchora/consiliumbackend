const express = require('express');
const router = express.Router();
const handleLogout = require('../controllers/logoutController');

router.post('/logout', handleLogout);

module.exports = router;
