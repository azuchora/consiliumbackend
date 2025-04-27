const { StatusCodes } = require('http-status-codes');
const LENGTH_LIMITS = require('../config/lengthLimits');
const { getPost } = require('../model/posts');
const { getComment, createComment, deleteComment } = require('../model/comments');
const fileService = require('../services/fileService');
const { createFile } = require('../model/files');

const handleNewComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, parentCommentId } = req.body;

        const postId = Number(req.params.id);

        if(!postId || !Number.isInteger(postId)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }
    
        if(!content){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Content is required.' });
        }
    
        if(content.length < LENGTH_LIMITS.comment.min || content.length > LENGTH_LIMITS.comment.max){
            const message = `Invalid comment length. ${LENGTH_LIMITS.comment.min} <= comment ${LENGTH_LIMITS.comment.max}`;
            return res.status(StatusCodes.BAD_REQUEST).json({ message });
        }

        const foundPost = await getPost({id: postId });
        if(!foundPost){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid post id.' });
        }

        if(parentCommentId){
            const parentComment = await getComment({ id: parentCommentId });
            if(!parentComment){
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Parent comment not found.' });
            }
        }

        const newComment = await createComment({ postId, userId, content, parentCommentId });

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
                    await createFile({ filename, comment_id: newComment.id});
                }

                newComment.files = createdFiles;
            }
        } catch (error){
            for(const file of createdFiles){
                await fileService.removeFile(file.filename);
            }
            await deleteComment({ id: newComment.id });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error while saving attachments.' });
        }

        return res.status(StatusCodes.OK).json({ comment: newComment });
    } catch (error){
        console.error('Error adding comment:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    handleNewComment,
};
