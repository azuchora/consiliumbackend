const express = require('express');
const router = express.Router();
const { handleNewComment, handleGetParentComments, handleGetChildComments, handleDeleteComment, handleVoteComment, handleMarkCommentHelpful } = require('../controllers/commentsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

router.use(verifyJWT);

router.post('/posts/:id/comments', 
    fileUpload({ createParentPath: true }), 
    fileExtLimiter(['.png', '.jpg', '.jpeg']), 
    fileSizeLimiter,
    handleNewComment
);

router.delete('/comments/:id', handleDeleteComment);

router.put('/comments/:id/vote', handleVoteComment);
router.put('/comments/:id/helpful', handleMarkCommentHelpful);

router.get('/posts/:id/comments', handleGetParentComments);
router.get('/comments/:id/replies', handleGetChildComments);

module.exports = router;
