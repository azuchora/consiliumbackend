const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { getUser, updateUser } = require('../model/user');
const TOKENS = require('../config/tokens');

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        if(!username || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Username and password are required." });
        }
        
        const foundUser = await getUser({ username });
    
        if(!foundUser){
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid username or password." });
        }
    
        const match = await bcrypt.compare(password, foundUser.hashed_password);
        if(!match){
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid username or password." });
        }
        
        const accessToken = jwt.sign({ username, id: foundUser.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: TOKENS.access.expiresIn,
        });

        const refreshToken = jwt.sign({ username, id: foundUser.id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: TOKENS.refresh.expiresIn,
        });
        
        const user = {
            username: foundUser.username,
            avatar_filename: foundUser.avatar_filename,
            id: foundUser.id 
        };

        await updateUser({ username }, { refresh_token: refreshToken });
    
        res.cookie("jwt", refreshToken, {
          secure: process.env.IS_PROD === "true",
          maxAge: TOKENS.refresh.maxAge, 
          httpOnly: true,
        });

        return res.json({ user, accessToken });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
      }
};

module.exports = handleLogin;
