const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters } = require('../db/queries');

const getUser = (filters = {}) => getOneByFilters('users', filters);
const getUsers = (filters = {}) => getManyByFilters('users', filters);
const updateUser = (filters = {}, updatedData = {}) => updateByFilters('users', filters, updatedData);

const createUser = async ({ username, hashed_password, email }) => {
    if(!username || !hashed_password || !email){
        throw new Error('Missing required user fields.');
    }

    const result = await sql`
        INSERT INTO users(username, hashed_password, email)
        VALUES (${username}, ${hashed_password}, ${email})
        RETURNING *
    `;
   
    return result[0];
}

module.exports = {
    getUser,
    getUsers,
    updateUser,
    createUser,
}
