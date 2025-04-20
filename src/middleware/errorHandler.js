const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error has occured. Please try again later.' });
};

module.exports = errorHandler;
