const jwt = require('jsonwebtoken');
const { getUser, getUserByRefreshToken } = require('../model/user');
const { StatusCodes } = require('http-status-codes');
const { deleteRefreshTokens, createRefreshToken, getRefreshToken } = require('../model/refreshTokens');
const { generateAccessToken, generateRefreshToken, clearRefreshTokenCookie, setRefreshTokenCookie } = require('../services/tokenService');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.UNAUTHORIZED);
        
        const refreshToken = cookies.jwt;
        
        // clearRefreshTokenCookie(res);
        const foundToken = await getRefreshToken({ token: refreshToken });
        const foundUser = foundToken ? await getUser({ id: foundToken?.users.id }) : null;

        if(!foundUser){
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
                if(err) return res.sendStatus(StatusCodes.FORBIDDEN);
                const hackedUser = await getUser({ username: decoded.username });
                if(hackedUser) await deleteRefreshTokens({ userId: hackedUser.id });  
            });
            return res.sendStatus(StatusCodes.FORBIDDEN);
        } 

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if(err) await deleteRefreshTokens({ token: refreshToken });
            if(err || foundUser.username !== decoded.username) return res.sendStatus(StatusCodes.UNAUTHORIZED);

            const foundRoles = foundUser.userRoles;
            const roles = foundRoles?.map(r => r.roleId);
            const accessToken = generateAccessToken({ username: foundUser.username, id: foundUser.id, roles });
            // const newRefreshToken = generateRefreshToken({ username: foundUser.username, id: foundUser.id });

            // await createRefreshToken({ userId: foundUser.id, refreshToken: newRefreshToken });
            // setRefreshTokenCookie(res, newRefreshToken);
            const avatarFilename = !foundUser?.files[0]?.filename ? null : foundUser?.files[0]?.filename;
            return res.json({ accessToken, roles, username: foundUser.username, avatarFilename, id: foundUser.id });
        });
    } catch (error) {
        console.error('RefreshToken error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = handleRefreshToken;
