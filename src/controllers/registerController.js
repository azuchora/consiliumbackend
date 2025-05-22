const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { getUser, createUser } = require('../model/user');
const { assignRole } = require('../model/roles');
const ROLES = require('../config/roles');
const { isValidPassword, isValidEmail, isValidUsername } = require('../services/sanitizationService');
const { normalizeEmail } = require('validator');

const handleNewUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if(!username || !email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username, email, and password are required.' });
        }

        if(!isValidUsername(username)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid username.' });
        }
        
        if(!isValidPassword(password)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid password.' });
        }

        if(!isValidEmail(email)){
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email address.' });
        }

        const existingUser = await getUser({
            OR: [
                { username },
                { email },
            ]
        });
        
        if(existingUser.length > 0){
            return res.status(StatusCodes.CONFLICT).json({ message: 'User with this username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await createUser({
            username,
            hashedPassword: hashedPassword,
            email: normalizeEmail(email),
        });

        await assignRole({ userId: newUser.id, roleId: ROLES.User });
        
        return res.status(StatusCodes.CREATED).json({
            message: 'User registered successfully.',
            user: { username, id: newUser.id } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error during registration.' });
    }
};

module.exports = handleNewUser;
