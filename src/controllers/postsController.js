const { createFile } = require("../model/files");
const { createPost, deletePost } = require("../model/posts");
const { StatusCodes } = require('http-status-codes');
const fileService = require("../services/fileService");

const handleNewPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = req.user;

        if(!title || !description){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required.' })
        }
        
        const newPost = await createPost({ userId: user.id, title, description });

        const files = req.files;
        const fileNames = [];

        try {
            for(const key of Object.keys(files)){
                const fileField = files[key];
                const fileArray = Array.isArray(fileField) ? fileField : [fileField];

                for(const file of fileArray){
                    const filename = await fileService.saveFile(file);
                    fileNames.push(filename);
                    await createFile({ filename, post_id: newPost.id});
                }
            }
        } catch (error){
            for(const filename of fileNames){
                await fileService.removeFile(filename);
            }
            await deletePost({ id: newPost });
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Error while saving attachments." });
        }
        
        return res.status(StatusCodes.CREATED).json({ post: newPost, fileNames });
    } catch (error) {
        console.error("CreatePost error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
      }
};

module.exports = handleNewPost;
