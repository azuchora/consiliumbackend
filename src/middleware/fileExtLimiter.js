const path = require('path')
const { StatusCodes } = require('http-status-codes');

const fileExtLimiter = (extArray, blockMode = false) => {
    return (req, res, next) => {
        const files = req.files
        
        if(!files){
            next();
            return;
        } 
        
        const fileExtensions = []
        Object.keys(files).forEach(key => {
            const fileField = files[key];
            const fileArray = Array.isArray(fileField) ? fileField : [fileField];
            fileArray.forEach(file => {
                fileExtensions.push(path.extname(file.name).toLowerCase());
            })
        })

        const valid = blockMode
            ? fileExtensions.every(ext => !extArray.includes(ext))
            : fileExtensions.every(ext => extArray.includes(ext))

        if(!valid){
            const message = blockMode
                ? `Upload failed. The following file types are not allowed: ${extArray.join(', ')}`
                : `Upload failed. Only these file types are allowed: ${extArray.join(', ')}`;

            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ status: 'error', message });
        }

        next();
    }
}

module.exports = fileExtLimiter;
