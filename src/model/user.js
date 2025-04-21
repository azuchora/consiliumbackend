const sql = require('../config/db');

const getUser = async (filters = {}) => {
    const keys = Object.keys(filters);
    if (keys.length === 0) {
        throw new Error('No filters provided');
    }

    const conditions = [];

    for (const key of keys) {
        conditions.push(sql`${sql.unsafe(key)} = ${filters[key]}`);
    }

    const result = await sql`
        SELECT * FROM users
        WHERE ${conditions.reduce((prev, curr, index) => index === 0 ? curr : sql`${prev} AND ${curr}`)}
    `;

    return result[0];
};

const updateUser = async (filters = {}, updatedData = {}) => {
    const filterKeys = Object.keys(filters);
    const updateKeys = Object.keys(updatedData);

    if (filterKeys.length === 0) {
        throw new Error('No filters provided');
    }

    if (updateKeys.length === 0) {
        throw new Error('No update data provided');
    }

    const whereConditions = filterKeys.map(
        (key) => sql`${sql.unsafe(key)} = ${filters[key]}`
    );

    const setClauses = updateKeys.map(
        (key) => sql`${sql.unsafe(key)} = ${updatedData[key]}`
    );

    const result = await sql`
        UPDATE users
        SET ${setClauses.reduce((prev, curr, i) => i === 0 ? curr : sql`${prev}, ${curr}`)}
        WHERE ${whereConditions.reduce((prev, curr, i) => i === 0 ? curr : sql`${prev} AND ${curr}`)}
        RETURNING *
    `;

    return result[0];
};

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
    updateUser,
    createUser,
}
