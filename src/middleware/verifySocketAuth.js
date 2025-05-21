const jwt = require('jsonwebtoken');

const verifySocketJWT = (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        const err = new Error('Unauthorized');
        err.data = { message: 'No token provided' };
        return next(err);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            const error = new Error('Forbidden');
            error.data = { message: 'Invalid token' };
            return next(error);
        }

        socket.user = {
            username: decoded.username,
            id: decoded.id,
            roles: decoded.roles,
        };

        next();
    });
}

module.exports = verifySocketJWT;
