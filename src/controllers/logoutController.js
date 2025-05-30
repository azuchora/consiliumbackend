const { deleteRefreshTokens, getRefreshToken } = require('../model/refreshTokens');
const { StatusCodes } = require('http-status-codes');
const { clearRefreshTokenCookie } = require('../services/tokenService');

const handleLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.NO_CONTENT);
        
        const refreshToken = cookies.jwt;
        const foundToken = await getRefreshToken({ token: refreshToken });
        const foundUser = foundToken?.users;

        if(!foundUser){
            clearRefreshTokenCookie(res);
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }
        
        await deleteRefreshTokens({ token: refreshToken });
        clearRefreshTokenCookie(res);
        res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = handleLogout;
