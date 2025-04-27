const SIZE_LIMITS = require('../config/sizeLimits');
const { StatusCodes } = require('http-status-codes');

const fileSizeLimiter = (req, res, next) => {
    const files = req.files;
    
    if(!files){
        next();
        return;
    } 
    
    const filesOverLimit = [];
    const isOverLimit = (file) => {
        if(file.size > SIZE_LIMITS.file){
            filesOverLimit.push(file.name)
        }
    };

    Object.keys(files).forEach(key => {
        const fileField = files[key];
        const fileArray = Array.isArray(fileField) ? fileField : [fileField];
        fileArray.forEach(file => isOverLimit(file));
    })

    if(filesOverLimit.length){
        return res.status(StatusCodes.REQUEST_TOO_LONG).json({ status: 'error', message: `File size limit of ${SIZE_LIMITS.file/1024/1024}MB per file was exceeded` });
    }

    next();
}

module.exports = fileSizeLimiter;
