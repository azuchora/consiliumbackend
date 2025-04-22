const jwt = require('jsonwebtoken');
const TOKENS = require('../config/tokens');
const { getUser } = require('../model/user');

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(401);

        const refreshToken = cookies.jwt;
        const foundUser = await getUser({ refresh_token: refreshToken });

        if(!foundUser) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(401);
            const accessToken = jwt.sign(
                { username: decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: TOKENS.access.expiresIn }
            );
            res.json({ uid: foundUser.uid, accessToken });
        });
    } catch (error) {
        console.error("RefreshToken error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = handleRefreshToken;
