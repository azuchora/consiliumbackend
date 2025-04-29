const jwt = require('jsonwebtoken');
const TOKENS = require('../config/tokens');
const { getUser, getUserByRefreshToken } = require('../model/user');
const { StatusCodes } = require('http-status-codes');
const { deleteRefreshTokens, createRefreshToken } = require('../model/refreshTokens');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const refreshToken = cookies.jwt;
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.IS_PROD === 'true' });

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
            const accessToken = jwt.sign(
                { username: decoded.username, id: decoded.id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: TOKENS.access.expiresIn }
            );

            const newRefreshToken = jwt.sign({ username, id: foundUser.id }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: TOKENS.refresh.expiresIn,
            });

            await createRefreshToken({ userId: foundUser.id, refreshToken });

            res.cookie('jwt', newRefreshToken, {
                secure: process.env.IS_PROD === 'true',
                maxAge: TOKENS.refresh.maxAge, 
                httpOnly: true,
            });

            return res.json({ accessToken });
        });
    } catch (error) {
        console.error('RefreshToken error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = handleRefreshToken;
