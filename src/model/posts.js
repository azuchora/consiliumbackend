const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');
const { attachFiles } = require('../services/fileAttachmentService');

const getPost = (filters = {}) => getOneByFilters('posts', filters);
const getPosts = (filters = {}) => getManyByFilters('posts', filters);
const updatePost = (filters = {}, updatedData = {}) => updateByFilters('posts', filters, updatedData);
const deletePost = (filters = {}) => deleteByFilters('posts', filters);

const getPostWithFiles = async (filters = {}) => {
    const post = await getPost(filters);
    
    if(!post){
        throw new Error('Post not found,');
    }

    const postWithFiles = await attachFiles([post], 'post_id');

    return postWithFiles[0];
};

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
};

const getPaginatedPosts = async({ limit, lastFetchedTimestamp, filters = {} }) => {
    if(!limit){
        throw new Error('Missing required fields');
    }

    let whereClause = sql`1=1`;

    if(lastFetchedTimestamp){
        whereClause = sql`${whereClause} AND posts.created_at < ${lastFetchedTimestamp}`;
    }

    const filterKeys = Object.keys(filters);

    if(filterKeys.length > 0){
        const conditions = filterKeys.map(key => 
            sql`${sql.unsafe(`posts.${key}`)} = ${filters[key]}`
        );

        const combinedFilters = conditions.reduce((prev, curr) =>
            sql`${prev} AND ${curr}`
        );

        whereClause = sql`${whereClause} AND ${combinedFilters}`;
    }

    const result = await sql`
        SELECT posts.*, users.username, users.surname, users.name, files.filename avatar
        FROM posts
        JOIN users ON users.id = posts.user_id
        JOIN files ON users.id = files.user_id
        WHERE ${whereClause}
        ORDER BY posts.created_at DESC
        LIMIT ${limit};
    `;

    return await attachFiles(result, 'post_id');
}

module.exports = {
    getPost,
    getPosts,
    updatePost,
    deletePost,
    createPost,
    getPostWithFiles,
    getPaginatedPosts,
}
