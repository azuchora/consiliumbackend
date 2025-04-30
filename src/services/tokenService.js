const jwt = require('jsonwebtoken');
const TOKENS = require('../config/tokens');

const generateAccessToken = ({ username, id, roles }) => {
    return jwt.sign({ username, id, roles }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: TOKENS.access.expiresIn,
    });
};

const generateRefreshToken = ({ username, id }) => {
    return jwt.sign({ username, id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: TOKENS.refresh.expiresIn,
    });
};

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('jwt', refreshToken, {
        secure: process.env.IS_PROD === 'true',
        maxAge: TOKENS.refresh.maxAge, 
        sameSite: 'None',
        httpOnly: true,
    });
};

const clearRefreshTokenCookie = (res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.IS_PROD === 'true',
        sameSite: 'None', 
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
};
