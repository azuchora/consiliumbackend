const TOKENS = {
    refresh: {
        expiresIn: '30d',
        maxAge: 24 * 60 * 60 * 1000
    },
    access: {
        expiresIn: '30d'
    }
}

module.exports = TOKENS;
