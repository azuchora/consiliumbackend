const sql = require('../db/client');
const { getOneByFilters, getManyByFilters, updateByFilters, deleteByFilters } = require('../db/queries');

const getFile = (filters = {}) => getOneByFilters('files', filters);
const getFiles = (filters = {}) => getManyByFilters('files', filters);
const updateFile = (filters = {}) => updateByFilters('files', filters);
const deleteFile = (filters = {}) => deleteByFilters('files', filters);

const createFile = async (fileData = {}) => {
    const keys = Object.keys(fileData);

    if(keys.length === 0){
        throw new Error('No file data provided');
    }

    const refKeys = ['user_id', 'post_id', 'comment_id'];
    const refCount = refKeys.filter(key => fileData[key] != null).length;

    if(refCount !== 1){
        throw new Error('Exactly one of user_id, post_id, or comment_id must be provided.');
    }

    if(!fileData.filename){
        throw new Error('Filename is required');
    }

    const columns = keys;
    const values = keys.map((key) => sql`${fileData[key]}`);
    const combinedValues = values.reduce((prev, curr, i) =>
         i === 0 ? curr : sql`${prev}, ${curr}`)

    const result = await sql`
        INSERT INTO files (${sql(columns)})
        VALUES (${combinedValues})
        RETURNING *
    `;

    return result[0];
};

module.exports = {
    getFile,
    getFiles,
    updateFile,
    createFile,
    deleteFile,
}
