const bcrypt = require('bcrypt');
const LENGTH_LIMITS = require('../config/lengthLimits');
const { StatusCodes } = require('http-status-codes');
const { getUsers, createUser } = require('../model/user');

const handleNewUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if(!username || !email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username, email, and password are required.' });
        }

        const usernameRegex = new RegExp(`^[a-zA-Z0-9_]{${LENGTH_LIMITS.username.min},${LENGTH_LIMITS.username.max}}$`);
        if(!usernameRegex.test(username)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid username.' });
        }
        
        // min 1: lowercase, uppercase, digit, special char
        const lookAhead = '(?=(.*[a-z]))(?=(.*[A-Z]))(?=(.*\\d))(?=(.*[@$!%*?#&^_-]))';
        const passwordRegex = new RegExp(`^${lookAhead}[a-zA-Z0-9@$!%*?#&^_-]{${LENGTH_LIMITS.password.min},${LENGTH_LIMITS.password.max}}$`);
        if(!passwordRegex.test(password)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid password.' });
        }
        
        const emailRegex = new RegExp(`^(?=.{${LENGTH_LIMITS.email.min},${LENGTH_LIMITS.email.max}})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`);
        if(!emailRegex.test(email)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email address.' });
        }

        const existingUser = await getUsers({ username, email }); 
        
        if(existingUser.length > 0){
            return res.status(StatusCodes.CONFLICT).json({ message: 'User with this username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await createUser({
            username,
            hashed_password: hashedPassword,
            email
        });
        
        return res.status(StatusCodes.CREATED).json({ message: 'User registered successfully.', user: { username, id: newUser.id } });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error during registration.' });
    }
};

module.exports = handleNewUser;
