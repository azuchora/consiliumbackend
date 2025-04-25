const express = require('express');
const router = express.Router();
const { handleNewPost, handleGetPost } = require('../controllers/postsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

router.use(verifyJWT);

router.post('/posts', 
    fileUpload({ createParentPath: true }), 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter, 
    handleNewPost
);

router.get('/posts/:id', handleGetPost);

module.exports = router;
