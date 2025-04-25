const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const verifyJWT = (req, res, next) => {
    const authHeader = req?.headers['authorization'];
    if(!authHeader) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(StatusCodes.FORBIDDEN);
            req.user = {
                username: decoded.username,
                id: decoded.id
            }
            next();
        }
    );
}

module.exports = verifyJWT;
