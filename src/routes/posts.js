const express = require('express');
const router = express.Router();
const { handleNewPost, handleGetPost, handleDeletePost, handleGetPosts, handleVotePost, handleFollowPost, handleUnfollowPost } = require('../controllers/postsController');
const verifyJWT = require('../middleware/verifyJWT');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');
const BLOCKED_EXTENSIONS = require('../config/blockedExtensions');
const verifyRoles = require('../middleware/verifyRoles');
const ROLES = require('../config/roles');

router.use(verifyJWT);
router.use(verifyRoles(ROLES.Admin, ROLES.Moderator, ROLES.Verified));

router.post('/posts', 
    fileUpload({ createParentPath: true }), 
    fileExtLimiter(BLOCKED_EXTENSIONS, true), 
    fileSizeLimiter, 
    handleNewPost
);
router.post('/posts/:id/follow', handleFollowPost);

router.get('/posts', handleGetPosts);
router.get('/posts/:id', handleGetPost);

router.put('/posts/:id/vote', handleVotePost);

router.delete('/posts/:id', handleDeletePost);
router.delete('/posts/:id/follow', handleUnfollowPost);

module.exports = router;
