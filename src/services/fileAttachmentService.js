const { getFiles } = require('../model/files');

const attachFiles = async (entities, foreignKeyName) => {
    return await Promise.all(
        entities.map(async (entity) => {
            const foundFiles = await getFiles({ [foreignKeyName]: entity.id });

            const files = foundFiles.map(file => ({
                id: file.id,
                filename: file.filename,
            }));

            return { ...entity, files };
        })
    );
};

module.exports = {
    attachFiles,
}
