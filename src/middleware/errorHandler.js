const { logEvents } = require('./logger');
const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`);
    console.error(err.stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error has occured. Please try again later.' });
};

module.exports = errorHandler;
