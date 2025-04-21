const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ message: 'Server error has occured. Please try again later.' });
};

module.exports = errorHandler;
