const SIZE_LIMITS = require('../config/sizeLimits');
const { StatusCodes } = require('http-status-codes');

const fileSizeLimiter = (req, res, next) => {
    const files = req.files;

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
        const properVerb = filesOverLimit.length > 1 ? 'are' : 'is';

        const sentence = `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`.replaceAll(",", ", ");

        const message = filesOverLimit.length < 3
            ? sentence.replace(",", " and")
            : sentence.replace(/,(?=[^,]*$)/, " and");

        return res.status(StatusCodes.REQUEST_TOO_LONG).json({ status: "error", message });

    }

    next();
}

module.exports = fileSizeLimiter;
