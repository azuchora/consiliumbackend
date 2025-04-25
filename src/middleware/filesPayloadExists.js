const { StatusCodes } = require('http-status-codes');

const filesPayloadExists = (req, res, next) => {
    if(!req.files) return res.status(StatusCodes.BAD_REQUEST).json({ status: "error", message: "Missing files" });

    next();
}

module.exports = filesPayloadExists;
