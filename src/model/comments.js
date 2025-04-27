const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');

const getComment = (filters = {}) => getOneByFilters('comments', filters);
const getComments = (filters = {}) => getManyByFilters('comments', filters);
const updateComment = (filters = {}, updatedData = {}) => updateByFilters('comments', filters, updatedData);
const deleteComment = (filters = {}) => deleteByFilters('comments', filters);

const createComment = async ({ postId, userId, content, commentId = null }) => {
    if(!userId || !content || !postId){
        throw new Error('Missing required comment fields.');
    }

    const result = await sql`
        INSERT INTO comments(post_id, user_id, content, comment_id)
        VALUES (${postId}, ${userId}, ${content}, ${commentId})
        RETURNING *
    `;
   
    return result[0];
}

module.exports = {
    getComment,
    getComments,
    updateComment,
    deleteComment,
    createComment,
}
