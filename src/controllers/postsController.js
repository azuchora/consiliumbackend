const { createFile } = require('../model/files');
const { createPost, deletePost, getPost, getPaginatedPosts, upsertPostVote } = require('../model/posts');
const { StatusCodes } = require('http-status-codes');
const fileService = require('../services/fileService');
const { sanitizeId } = require('../services/sanitizationService');
const { censorFile } = require('../services/censorService');
const POST_STATUSES = require('../config/postStatuses');
const { followPost, unfollowPost, isPostFollowed, getUserFollowers } = require('../model/follows');
const { notifyUser } = require('../services/notificationService');

const allowdGenders = ['male', 'female'];

const handleNewPost = async (req, res) => {
    try {
        const { title, description, gender, age, postStatusId } = req.body;
        const user = req.user;

        if(!title || !description || !gender || !age || !postStatusId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title, description, gender and age are required.' })
        }
        
        if(!Object.values(POST_STATUSES).includes(Number(postStatusId))){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post status.' });
        }

        if(!allowdGenders.includes(gender)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid gender.' });
        }

        if(age < 0 || age > 120){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid age.' });   
        }

        const newPost = await createPost({ userId: user.id, title, description, gender, age, postStatusId });
        
        const files = req.files;
        let createdFiles = [];
        if(files)
        try {
            const filePromises = [];
            for(const key of Object.keys(files)){
                const fileField = files[key];
                const fileArray = Array.isArray(fileField) ? fileField : [fileField];
                
                const promises = fileArray.map(async (file) => {
                    const filename = await fileService.saveFile(file);
                    createdFiles.push(filename);
                    await createFile({ filename, postId: newPost.id });
                    await censorFile(filename);
                });
                
                filePromises.push(...promises);
            }
            await Promise.all(filePromises);
        } catch (error){
            console.log(error);
            for(const file of createdFiles){
                await fileService.removeFile(file.filename);
            }
            await deletePost({ id: newPost.id });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error while saving attachments.' });
        }
        newPost.files = createdFiles.map(f => {
            return {
                'filename': f,
            }
        });

        res.status(StatusCodes.CREATED).json({ post: newPost });
        
        const followers = await getUserFollowers({ userId: user.id });
        const followersPromises = followers.map(follower => {
            return notifyUser({
                userId: follower.followerId,
                actorId: user.id,
                postId: newPost.id,
                type: 'new_post',
            })
        });

        await Promise.all(followersPromises);
        
    } catch (error) {
        console.error('CreatePost error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
};

const handleGetPost = async (req, res) => {
    try {
        const postId = sanitizeId(req.params.id);

        if(!postId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        const foundPost = await getPost({ id: postId });
        
        if(!foundPost){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }
        
        foundPost.isFollowed = await isPostFollowed({
            followerId: req.user.id,
            postId: foundPost.id
        });

        return res.status(StatusCodes.OK).json({ post: {...foundPost } });
    } catch (error) {
        console.error('getPost error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleDeletePost = async (req, res) => {
    try {
        const postId = sanitizeId(req.params.id);
        const user = req.user;

        if(!postId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        const foundPost = await getPost({ id: postId });
        
        if(!foundPost){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        if(foundPost.userId != user.id){
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'No permission to delete post.' });
        }

        const postFiles = foundPost.files;
        for(const file of postFiles){
            await fileService.removeFile(file.filename);
        }
        
        await deletePost({ id: postId });

        return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (error) {
        console.error('DeletePost error', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error '});
    }
};

const handleGetPosts = async (req, res) => {
    try {
        const {
            limit = 5,
            timestamp,
            postStatusId,
            search,
            categoryId,
            age,
            gender,
            username,
        } = req.query;
        
        const posts = await getPaginatedPosts({
            limit,
            timestamp,
            postStatusId,
            search,
            categoryId,
            age,
            gender,
            username,
        });

        const postPromises = [];
        const addIsFollowed = async (post) => {
            post.isFollowed = await isPostFollowed({
                followerId: req.user.id,
                postId: post.id
            });
        }
        posts.forEach(post => {
            postPromises.push(addIsFollowed(post));
        })

        await Promise.all(postPromises);
        
        const newLastFetchedTimestamp = posts.length > 0 
            ? posts[posts.length - 1].createdAt
            : timestamp;
        
        return res.status(StatusCodes.OK).json({
            posts,
            pagination: {
                limit,
                timestamp: newLastFetchedTimestamp,
                hasMore: posts.length === Number(limit)
            }
        });
    } catch (error) {
        console.error('handleGetPosts error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleVotePost = async (req, res) => {
    try {
        const user = req.user;
        const postId = sanitizeId(req.params.id);
        const { value } = req.body;

        if(![1, -1].includes(value)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Vote must be 1 or -1.' });
        }

        if(!postId){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        const updatedVote = await upsertPostVote({
            userId: user.id,
            postId,
            value
        });

        return res.status(StatusCodes.OK).json({ vote: updatedVote });
    } catch (error) {
        console.error('VotePost error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleFollowPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = sanitizeId(req.params.id);
        
        if(!postId){
            return res.status(400).json({ message: 'Invalid post id.' });
        }

        await followPost({ followerId: userId, postId });
        return res.status(200).json({ message: 'Post followed successfully.' });
    } catch (error) {
        console.error('Error following post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

const handleUnfollowPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = sanitizeId(req.params.id);

        if(!postId){
            return res.status(400).json({ message: 'Invalid post id.' });
        }

        await unfollowPost({ followerId: userId, postId });
        return res.status(200).json({ message: 'Post unfollowed successfully.' });
    } catch (error) {
        console.error('Error unfollowing post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {
    handleNewPost,
    handleGetPost,
    handleDeletePost,
    handleGetPosts,
    handleVotePost,
    handleVotePost,
    handleFollowPost,
    handleUnfollowPost,
}
