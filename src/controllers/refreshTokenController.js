const jwt = require('jsonwebtoken');
const { getUser, getUserByRefreshToken } = require('../model/user');
const { StatusCodes } = require('http-status-codes');
const { deleteRefreshTokens, createRefreshToken } = require('../model/refreshTokens');
const { generateAccessToken, generateRefreshToken, clearRefreshTokenCookie, setRefreshTokenCookie } = require('../services/tokenService');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const refreshToken = cookies.jwt;
        clearRefreshTokenCookie(res);

        const foundUser = await getUserByRefreshToken(refreshToken);

        if(!foundUser){
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
                if(err) return res.sendStatus(StatusCodes.FORBIDDEN);
                const hackedUser = await getUser( { username: decoded.username });
                if(hackedUser) await deleteRefreshTokens({ user_id: hackedUser.id });  
            });
            return res.sendStatus(StatusCodes.FORBIDDEN);
        } 

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if(err) await deleteRefreshTokens({ token: refreshToken });
            if(err || foundUser.username !== decoded.username) return res.sendStatus(StatusCodes.UNAUTHORIZED);

            const foundRoles = await getRoles({ user_id: foundUser.id });
            const roles = foundRoles?.map(r => r.role_id);
            const accessToken = generateAccessToken({ username: foundUser.username, id: foundUser.id, roles });
            const newRefreshToken = generateRefreshToken({ username, id: foundUser.id });

            await createRefreshToken({ userId: foundUser.id, refreshToken });
            setRefreshTokenCookie(res, newRefreshToken);

            return res.json({ accessToken });
        });
    } catch (error) {
        console.error('RefreshToken error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = handleRefreshToken;
