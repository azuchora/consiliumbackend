const validator = require('validator');
const LENGTH_LIMITS = require('../config/lengthLimits');

const sanitizeId = (input) => {
    const sanitized = Number(input);
    return Number.isInteger(sanitized) && sanitized > 0 ? sanitized : '';
}

const isValidPassword = (password) => {
    const isLengthOk = validator.isLength(password, {
        min: LENGTH_LIMITS.password.min,
        max: LENGTH_LIMITS.password.max
    });

    if(!isLengthOk) return false;

    return validator.isStrongPassword(password, {
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false
    });
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

    return content.length < LENGTH_LIMITS.comment.min || content.length > LENGTH_LIMITS.comment.max;
};

module.exports = {
    isValidPassword,
    isValidEmail,
    isValidUsername,
    sanitizeId,
    normalizeEmail,
    isValidComment,
};
