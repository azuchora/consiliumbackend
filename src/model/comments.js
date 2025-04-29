const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');
const { attachFiles } = require('../services/fileAttachmentService');

const getComment = (filters = {}) => getOneByFilters('comments', filters);
const getComments = (filters = {}) => getManyByFilters('comments', filters);
const updateComment = (filters = {}, updatedData = {}) => updateByFilters('comments', filters, updatedData);
const deleteComment = (filters = {}) => deleteByFilters('comments', filters);

const createComment = async ({ postId, userId, content, parentCommentId = null }) => {
    if(!userId || !content || !postId){
        throw new Error('Missing required comment fields.');
    }

    const result = await sql`
        INSERT INTO comments(post_id, user_id, content, comment_id)
        VALUES (${postId}, ${userId}, ${content}, ${parentCommentId})
        RETURNING *
    `;
   
    return result[0];
};

const getPaginatedParentComments = async ({ postId, limit, lastFetchedTimestamp }) => {
    if(!postId || !limit){
        throw new Error('Missing required comment fields');
    }

    let whereClause = sql`post_id = ${postId} AND comment_id IS NULL`;

    if(lastFetchedTimestamp){
        whereClause = sql`${whereClause} AND created_at < ${lastFetchedTimestamp}`;
    }

    const result = await sql`
        SELECT * FROM comments
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit};
    `;
      
    return await attachFiles(result, 'comment_id');
};

const getPaginatedChildComments = async ({ parentId, limit, lastFetchedTimestamp }) => {
    if(!parentId || !limit){
        throw new Error('Missing required comment fields');
    }

    let whereClause = sql`comment_id = ${parentId}`;

    if(lastFetchedTimestamp){
        whereClause = sql`${whereClause} AND created_at < ${lastFetchedTimestamp}`;
    }

    const result = await sql`
        SELECT * FROM comments
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit};
    `;

    return await attachFiles(result, 'comment_id');
};

module.exports = {
    getComment,
    getComments,
    updateComment,
    deleteComment,
    createComment,
    getPaginatedParentComments,
    getPaginatedChildComments,
}
