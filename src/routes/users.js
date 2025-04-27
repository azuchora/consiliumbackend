const express = require('express');
const router = express.Router();
const { handleUploadAvatar, handleGetAvatar, handleGetUser } = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const filePayloadExists = require('../middleware/filesPayloadExists');

router.use(verifyJWT);

router.post('/users/:id/avatar',
    fileUpload({ createParentPath: true }), 
    filePayloadExists, 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter, 
    handleUploadAvatar
);

router.get('/users/:id/avatar', handleGetAvatar);

router.get('/users/:id', handleGetUser);

module.exports = router;
