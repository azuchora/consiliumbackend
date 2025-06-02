const express = require('express');
const router = express.Router();
const { handleUploadAvatar, handleGetAvatar, handleGetUser, handleFollowUser, handleUnfollowUser, handleChangePassword, handleForgotPassword, handleResetPassword } = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const filePayloadExists = require('../middleware/filesPayloadExists');

router.post('/users/forgot-password', handleForgotPassword);
router.post('/users/reset-password', handleResetPassword);

router.put('/users/:id/avatar',
    verifyJWT,
    fileUpload({ createParentPath: true }), 
    filePayloadExists, 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter, 
    handleUploadAvatar
);

router.post('/users/:id/follow', verifyJWT, handleFollowUser);
router.post('/users/change-password', verifyJWT, handleChangePassword);


router.get('/users/:id/avatar', verifyJWT, handleGetAvatar);
router.get('/users/:username', verifyJWT, handleGetUser);

router.delete('/users/:id/follow', verifyJWT, handleUnfollowUser);

module.exports = router;
