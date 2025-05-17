const express = require('express');
const router = express.Router();
const { handleNewPost, handleGetPost, handleDeletePost, handleGetPosts } = require('../controllers/postsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const BLOCKED_EXTENSIONS = require('../config/blockedExtensions');

router.use(verifyJWT);

router.post('/posts', 
    fileUpload({ createParentPath: true }), 
    fileExtLimiter(BLOCKED_EXTENSIONS, true), 
    fileSizeLimiter, 
    handleNewPost
);

router.get('/posts', handleGetPosts);
router.get('/posts/:id', handleGetPost);

router.delete('/posts/:id', handleDeletePost);

module.exports = router;
