const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'attachments');

const saveFile = async (file) => {
    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}_${uuidv4()}${ext}`;
    const fullPath = path.join(uploadDir, uniqueName);
    
    file.mv(fullPath);

    return uniqueName;
};

const removeFile = async (fileName) => {
    const fullPath = path.join(uploadDir, fileName);
    if(fs.existsSync(fullPath)){
        fs.rmSync(fullPath);
    }
};

module.exports = {
    saveFile,
    removeFile,
}
