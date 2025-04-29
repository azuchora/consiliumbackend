const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');

const getRefreshToken = (filters = {}) => getOneByFilters('refresh_tokens', filters);
const getRefreshTokens = (filters = {}) => getManyByFilters('refresh_tokens', filters);
const updateRefreshToken = (filters = {}, updatedData = {}) => updateByFilters('refresh_tokens', filters, updatedData);
const deleteRefreshTokens = (filters = {}) => deleteByFilters('refresh_tokens', filters);

const createRefreshToken = async ({ userId, refreshToken }) => {
    if(!userId || !refreshToken){
        throw new Error('Missing required token fields.');
    }

    const result = await sql`
        INSERT INTO refresh_tokens(user_id, token)
        VALUES (${userId}, ${refreshToken})
        RETURNING *
    `;
   
    return result[0];
};

module.exports = {
    getRefreshToken,
    getRefreshTokens,
    updateRefreshToken,
    deleteRefreshTokens,
    createRefreshToken,
}
