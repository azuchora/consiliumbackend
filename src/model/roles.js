const sql = require('../db/client');
const { getOneByFilters, getManyByFilters } = require('../db/queries');

const getRole = (filters = {}) => getOneByFilters('user_roles', filters);
const getRoles = (filters = {}) => getManyByFilters('user_roles', filters);

const assignRole = async ({ userId, roleId }) => {
    if(!userId || !roleId){
        throw new Error('Missing required fields.');
    }

    const result = await sql`
        INSERT INTO user_roles(user_id, role_id)
        VALUES (${userId}, ${roleId})
        RETURNING *
    `;
   
    return result[0];
};

const revokeRole = async ({ userId, roleId }) => {
    if(!userId || !roleId){
        throw new Error('Missing required fields.');
    }

    const result = await sql`
        DELETE FROM user_roles
        WHERE user_id = ${userId} AND role_id = ${roleId}
        RETURNING *
    `;
   
    return result[0];
};

module.exports = {
    getRole,
    getRoles,
    assignRole,
    revokeRole,
}
