const validator = require('validator');
const LENGTH_LIMITS = require('../config/lengthLimits');

const sanitizeId = (input) => {
    const sanitized = parseInt(input);
    return Number.isInteger(sanitized) && sanitized > 0 ? sanitized : null;
}

const isValidPassword = (password) => {
    const PASSWORD_REGEX = new RegExp(
        `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])[A-Za-z0-9!@#$%]{${LENGTH_LIMITS.password.min},${LENGTH_LIMITS.password.max}}$`
    );
    
    return validator.matches(password, PASSWORD_REGEX);
};

const isValidEmail = (email) => {
    return validator.isEmail(email);
};

const normalizeEmail = (email) => {
    return validator.normalizeEmail(email);
}

const isValidUsername = (username) => {
    const isValidLength = validator.isLength(username, {
        min: LENGTH_LIMITS.username.min,
        max: LENGTH_LIMITS.username.max,
    });

    if(!isValidLength) return false;

    const allowedPattern = /^[a-zA-Z0-9_.-]+$/;

    return validator.matches(username, allowedPattern);
};

const isValidComment = (content) => {
    if(!content) return false;

    return content.length >= LENGTH_LIMITS.comment.min && content.length <= LENGTH_LIMITS.comment.max;
};

module.exports = {
    isValidPassword,
    isValidEmail,
    isValidUsername,
    sanitizeId,
    normalizeEmail,
    isValidComment,
};
