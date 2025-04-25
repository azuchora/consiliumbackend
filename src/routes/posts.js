const express = require('express');
const router = express.Router();
const handleNewPost = require('../controllers/postsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

router.use(verifyJWT);

router.post('/posts', 
    fileUpload({ createParentPath: true }), 
    filesPayloadExists, 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter, 
    handleNewPost
);

module.exports = router;
