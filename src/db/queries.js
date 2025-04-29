const sql = require('../db/client');

const getOneByFilters = async (tableName, filters = {}) => {
    const keys = Object.keys(filters);
    if(keys.length === 0){
        throw new Error('No filters provided');
    }

    const conditions = keys.map(key => sql`${sql.unsafe(key)} = ${filters[key]}`);

    const combinedConditions = conditions.reduce((prev, curr, index) =>
        index === 0 ? curr : sql`${prev} AND ${curr}`);

    const result = await sql`
        SELECT * FROM ${sql.unsafe(tableName)}
        WHERE ${combinedConditions}
    `;

    return result[0];
};

const getManyByFilters = async (tableName, filters = {}) => {
    const keys = Object.keys(filters);
    if(keys.length === 0){
        throw new Error('No filters provided');
    }

    const conditions = keys.map(key => sql`${sql.unsafe(key)} = ${filters[key]}`);

    const combinedConditions = conditions.reduce((prev, curr, index) =>
        index === 0 ? curr : sql`${prev} AND ${curr}`
    );
    
    const result = await sql`
        SELECT * FROM ${sql.unsafe(tableName)}
        WHERE ${combinedConditions}
    `;

    return result;
};

const updateByFilters = async (tableName, filters = {}, updatedData = {}) => {
    const filterKeys = Object.keys(filters);
    const updateKeys = Object.keys(updatedData);

    if(filterKeys.length === 0){
        throw new Error('No filters provided');
    }

    if(updateKeys.length === 0){
        throw new Error('No update data provided');
    }
    
    const setClauses = updateKeys.map(
        key => sql`${sql.unsafe(key)} = ${updatedData[key]}`
    );
    
    const whereConditions = filterKeys.map(
        key => sql`${sql.unsafe(key)} = ${filters[key]}`
    );

    const combinedSetClauses = setClauses.reduce((prev, curr, i) => 
        i === 0 ? curr : sql`${prev}, ${curr}`);

    const combinedWhereConditions = whereConditions.reduce((prev, curr, i) => 
        i === 0 ? curr : sql`${prev} AND ${curr}`)

    const result = await sql`
        UPDATE ${sql.unsafe(tableName)}
        SET ${combinedSetClauses}
        WHERE ${combinedWhereConditions}
        RETURNING *
    `;

    return result[0];
};

const deleteByFilters = async (tableName, filters = {}) => {
    const keys = Object.keys(filters);
    
    if(keys.length === 0){
        throw new Error('No filters provided');
    }

    const conditions = keys.map(
        key => sql`${sql.unsafe(key)} = ${filters[key]}`
    );

    const combinedConditions = conditions.reduce((prev, curr, index) =>
        index === 0 ? curr : sql`${prev} AND ${curr}`)

    const result = await sql`
        DELETE FROM ${sql.unsafe(tableName)}
        WHERE ${combinedConditions}
        RETURNING *
    `;

    return result;
};

module.exports = {
    getOneByFilters,
    getManyByFilters,
    updateByFilters,
    deleteByFilters,
}
