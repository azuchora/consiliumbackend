const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');

const getPost = (filters = {}) => getOneByFilters('posts', filters);
const getPosts = (filters = {}) => getManyByFilters('posts', filters);
const updatePost = (filters = {}, updatedData = {}) => updateByFilters('posts', filters, updatedData);
const deletePost = (filters = {}) => deleteByFilters('posts', filters);

const createPost = async ({ userId, title, description }) => {
    if(!userId || !title || !description){
        throw new Error('Missing required post fields.');
    }

    const result = await sql`
        INSERT INTO posts(user_id, title, description)
        VALUES (${userId}, ${title}, ${description})
        RETURNING *
    `;
   
    return result[0];
}

module.exports = {
    getPost,
    getPosts,
    updatePost,
    deletePost,
    createPost,
}
