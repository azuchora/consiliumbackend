const jwt = require('jsonwebtoken');
const TOKENS = require('../config/tokens');
const { getUser } = require('../model/user');
const { StatusCodes } = require('http-status-codes');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const refreshToken = cookies.jwt;
        const foundUser = await getUser({ refresh_token: refreshToken });

        if(!foundUser) return res.sendStatus(StatusCodes.FORBIDDEN);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(StatusCodes.UNAUTHORIZED);
            const accessToken = jwt.sign(
                { username: decoded.username, id: decoded.id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: TOKENS.access.expiresIn }
            );
            res.json({ accessToken });
        });
    } catch (error) {
        console.error("RefreshToken error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
};

module.exports = handleRefreshToken;
