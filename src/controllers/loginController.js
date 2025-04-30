const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { getUserByRefreshToken, getUserWithRoles } = require('../model/user');                   
const { getFile } = require('../model/files');
const { deleteRefreshTokens, createRefreshToken } = require('../model/refreshTokens');
const { generateAccessToken, generateRefreshToken, clearRefreshTokenCookie, setRefreshTokenCookie } = require('../services/tokenService');

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
        
        return res.json({ user, accessToken });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
};

module.exports = handleLogin;
