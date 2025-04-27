const express = require('express');
const router = express.Router();
const { handleNewPost, handleGetPost, handleDeletePost } = require('../controllers/postsController');
const { handleNewComment } = require('../controllers/commentsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
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

router.delete('/posts/:id', handleDeletePost);

router.post('/posts/:id/comments', 
    fileUpload({ createParentPath: true }), 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter,
    handleNewComment
);

module.exports = router;
