const express = require('express');
const router = express.Router();
const { handleLogin, handleUserVerification, handleLogout } = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/login', handleLogin);
router.post('/verify', verifyJWT, handleUserVerification);

router.get('/logout', handleLogout);

module.exports = router;
