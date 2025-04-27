const { createFile, getFiles } = require('../model/files');
const { createPost, deletePost, getPost } = require('../model/posts');
const { StatusCodes } = require('http-status-codes');
const fileService = require('../services/fileService');

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
        const postId = Number(req.params.id);

        if(!postId || !Number.isInteger(postId)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        const foundPost = await getPost({ id: postId });

        if(!foundPost){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        const foundFiles = await getFiles({ post_id: postId });
        const postFiles = foundFiles.map(file => ({
            id: file.id,
            filename: file.filename
        }));

        return res.status(StatusCodes.OK).json({ post: {...foundPost, files: postFiles} });
    } catch (error) {
        console.error('getPost error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleDeletePost = async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const user = req.user;

        if(!postId || !Number.isInteger(postId)){
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

module.exports = {
    handleNewPost,
    handleGetPost,
    handleDeletePost,
}
