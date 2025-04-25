const { createFile } = require("../model/files");
const { createPost, deletePost } = require("../model/posts");
const fileService = require("../services/fileService");

const handleNewPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = req.user;

        if(!title || !description){
            return res.status(400).json({ message: 'Title and description are required.' })
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
            return res.status(500).json({ message: "Error while saving attachments." });
        }
        
        return res.status(201).json({ post: newPost, fileNames });
    } catch (error) {
        console.error("CreatePost error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
};

module.exports = handleNewPost;
