const { createFile, getFiles } = require('../model/files');
const { createPost, deletePost, getPost, getPostWithFiles, getPaginatedPosts } = require('../model/posts');
const { StatusCodes } = require('http-status-codes');
const fileService = require('../services/fileService');
const { sanitizeId } = require('../services/sanitizationService');

const handleNewPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = req.user;

        if(!title || !description){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required.' })
        }
        
        const newPost = await createPost({ userId: user.id, title, description });

        const files = req.files;
        const createdFiles = [];
        if(files)
        try {
            for(const key of Object.keys(files)){
                const fileField = files[key];
                const fileArray = Array.isArray(fileField) ? fileField : [fileField];

                for(const file of fileArray){
                    const filename = await fileService.saveFile(file);
                    createdFiles.push({ filename });
                    await createFile({ filename, post_id: newPost.id});
                }
            }
        } catch (error){
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

        const foundPost = await getPostWithFiles({ id: postId });

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

        const postFiles = await getFiles({ post_id: postId });
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
        const { limit = 10, postStatusId, lastFetchedTimestamp } = req.query;

        const posts = await getPaginatedPosts({
            limit,
            postStatusId: postStatusId || null,
            lastFetchedTimestamp: lastFetchedTimestamp || null
        });
        
        const newLastFetchedTimestamp = posts.length > 0 
            ? posts[posts.length - 1].created_at 
            : lastFetchedTimestamp;

        return res.status(StatusCodes.OK).json({
            posts,
            pagination: {
                limit,
                lastFetchedTimestamp: newLastFetchedTimestamp,
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
