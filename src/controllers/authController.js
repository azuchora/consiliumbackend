const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { getUserByRefreshToken, getUserWithRoles } = require('../model/user');                   
const { getFile } = require('../model/files');
const { deleteRefreshTokens, createRefreshToken } = require('../model/refreshTokens');
const { generateAccessToken, generateRefreshToken, clearRefreshTokenCookie, setRefreshTokenCookie } = require('../services/tokenService');
const { assignRole } = require('../model/roles');
const { clearRefreshTokenCookie } = require('../services/tokenService');
const ROLES = require('../config/roles');

// In the future, when public API is accessible
// Just add proper api call
// Right now its 'fake api call'
const verifyDoctor = async ({ name, surname, pesel, pwz }) => {
    const response = {
        status: null,
        success: false,
    }

    const pwzList = ['1234567', '7654321', '1111111', '2222222'];

    if(!name || !surname || !pesel || !pwz){
        response.status = StatusCodes.BAD_REQUEST;
        return response;
    }

    if(pwzList.includes(pwz)){
        response.status = StatusCodes.OK;
        response.success = true;
        return response;
    } else {
        response.status = StatusCodes.NOT_FOUND;
        return response;
    }
}

const handleLogin = async (req, res) => {
    try {
        const cookies = req.cookies;
        const { username, password } = req.body;
    
        if(!username || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username and password are required.' });
        }
        
        const foundUser = await getUserWithRoles({ username });
        
        if(!foundUser){
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid username or password.' });
        }
    
        const match = await bcrypt.compare(password, foundUser.hashed_password);
        if(!match){
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid username or password.' });
        }
        
        const accessToken = generateAccessToken({ username, id: foundUser.id, roles: foundUser.roles });
        const newRefreshToken = generateRefreshToken({ username, id: foundUser.id, roles: foundUser.roles });

        const avatarFilename = (await getFile({ user_id: foundUser.id }))?.filename;
        
        const user = {
            username: foundUser.username,
            id: foundUser.id,
            avatarFilename: avatarFilename ? avatarFilename : null,
            roles: foundUser.roles,
        };
        
        if(cookies?.jwt){
            const refreshToken = cookies.jwt;
            const foundToken = await getUserByRefreshToken(refreshToken);

            if(!foundToken){
                await deleteRefreshTokens({ user_id: foundUser.id });
            }
            
            clearRefreshTokenCookie(res);
            await deleteRefreshTokens({ token: refreshToken });
        }

        await createRefreshToken({ userId: foundUser.id, refreshToken: newRefreshToken });
    
        setRefreshTokenCookie(res, newRefreshToken);
        
        return res.json({ ...user, accessToken });
    } catch (error) {
    console.error('Login error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

const handleUserVerification = async (req, res) => {
    try {
        const { name, surname, pesel, pwz } = req.body;
    
        if(!name || !surname || !pesel || !pwz){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username and password are required.' });
        }
        
        const response = await verifyDoctor({ name, surname, pesel, pwz });
        if(!response) throw new Error('Cannot verify doctor');

        switch (response.status){
            case StatusCodes.OK:
                await assignRole({ userId: req.user.id, roleId: ROLES.Verified });
                return res.status(StatusCodes.OK).json({ success: true, message: 'User successfully verified.' });
            
            case StatusCodes.BAD_REQUEST:
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid credentials.' });
            
            case StatusCodes.NOT_FOUND:
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Failed to verify user.' });
        }
        
    } catch (error) {
    console.error('UserVerification error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
}

const handleLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(StatusCodes.NO_CONTENT);
        
        const refreshToken = cookies.jwt;
        const foundUser = await getUserByRefreshToken(refreshToken);

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

module.exports = {
    handleLogin,
    handleUserVerification,
    handleLogout,
}
