const path = require("path")

const fileExtLimiter = (allowedExtArray) => {
    return (req, res, next) => {
        const files = req.files
        
        const fileExtensions = []
        Object.keys(files).forEach(key => {
            const fileField = files[key];
            const fileArray = Array.isArray(fileField) ? fileField : [fileField];
            fileArray.forEach(file => {
                fileExtensions.push(path.extname(file.name).toLowerCase());
            })
        })

        const allowed = fileExtensions.every(ext => allowedExtArray.includes(ext))

        if(!allowed){
            const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(",", ", ");

            return res.status(422).json({ status: "error", message });
        }

        next()
    }
}

module.exports = fileExtLimiter;
