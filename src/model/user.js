const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters } = require('../db/queries');
const { getRefreshTokens } = require('./refreshTokens');

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
};

const getUserWithTokens = async (filters = {}) => {
    const foundUser = await getUser(filters);
    if(!foundUser) return null;

    const userTokens = await getRefreshTokens({ user_id: foundUser.id });

    return {
        ...foundUser,
        refreshTokens: [...userTokens]
    }
};

const getUserByRefreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    const result = await sql`
        SELECT users.*
        FROM users
        JOIN refresh_tokens ON refresh_tokens.user_id = users.id
        WHERE refresh_tokens.token = ${refreshToken}
        LIMIT 1;
    `;

    return result[0] || null;
};

module.exports = {
    getUser,
    getUsers,
    updateUser,
    createUser,
    getUserWithTokens,
    getUserByRefreshToken,
}
