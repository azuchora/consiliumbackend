const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUser, updateUser } = require('../model/user');
const TOKENS = require('../config/tokens');

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        if(!username || !password){
            return res.status(400).json({ message: "Username and password are required." });
        }
        
        const foundUser = await getUser({ username });
    
        if(!foundUser){
            return res.status(401).json({ message: "Invalid username or password." });
        }
    
        const match = await bcrypt.compare(password, foundUser.hashed_password);
        if(!match){
            return res.status(401).json({ message: "Invalid username or password." });
        }
    
        const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: TOKENS.access.expiresIn,
        });

        const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: TOKENS.refresh.expiresIn,
        });
        
        await updateUser({ username }, { refresh_token: refreshToken });
    
        res.cookie("jwt", refreshToken, {
          secure: false,
          maxAge: TOKENS.refresh.maxAge, 
          httpOnly: true,
        });

        return res.json({ uid: foundUser.id, accessToken });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
};

module.exports = handleLogin;
