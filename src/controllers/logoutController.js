const { getUser, updateUser } = require('../model/user');
const { StatusCodes } = require('http-status-codes');

const handleLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.NO_CONTENT);
        
        const refreshToken = cookies.jwt;
        const foundUser = await getUser({ refresh_token: refreshToken })

        if(!foundUser){
            res.clearCookie('jwt', { httpOnly: true, secure: process.env.IS_PROD === 'true' });
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }
        
        await updateUser({ id: foundUser.id }, { refresh_token: null });
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.IS_PROD === 'true' });
        res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

module.exports = handleLogout;
