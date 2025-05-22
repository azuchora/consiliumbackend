const { createFile } = require('../model/files');
const { createPost, deletePost, getPost, getPaginatedPosts } = require('../model/posts');
const { StatusCodes } = require('http-status-codes');
const fileService = require('../services/fileService');
const { sanitizeId } = require('../services/sanitizationService');
const { censorFile } = require('../services/censorService');

const handleNewPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = req.user;

        if(!title || !description){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required.' })
        }
        
        const newPost = await createPost({ userId: user.id, title, description });
        
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
        
        return res.status(StatusCodes.CREATED).json({ post: newPost, files: createdFiles });
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

        if(foundPost.user_id != user.id){
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
        const { limit = 5, postStatusId, timestamp } = req.query;

        const posts = await getPaginatedPosts({
            limit,
            postStatusId: postStatusId || null,
            timestamp: timestamp || null
        });

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

module.exports = {
    handleNewPost,
    handleGetPost,
    handleDeletePost,
    handleGetPosts,
}
