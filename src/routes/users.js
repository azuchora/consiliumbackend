const express = require('express');
const router = express.Router();
const { handleUploadAvatar, handleGetAvatar, handleGetUser, handleFollowUser, handleUnfollowUser } = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const filePayloadExists = require('../middleware/filesPayloadExists');

router.use(verifyJWT);

router.put('/users/:id/avatar',
    fileUpload({ createParentPath: true }), 
    filePayloadExists, 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter, 
    handleUploadAvatar
);

router.post('/users/:id/follow', handleFollowUser);

router.get('/users/:id/avatar', handleGetAvatar);
router.get('/users/:username', handleGetUser);

router.delete('/users/:id/follow', handleUnfollowUser);

module.exports = router;
